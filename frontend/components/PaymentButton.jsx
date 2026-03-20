"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { syncCartWithBackend } from "@/services/orderApi";
import {
  createPaymentOrderRequest,
  loadRazorpayScript,
  verifyPaymentRequest,
} from "@/services/paymentApi";

export default function PaymentButton({
  shippingAddress,
  disabled,
  beforePay,
  isLoading,
  onPaymentStart,
  onPaymentEnd,
  onOrderPlaced,
}) {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const processingRef = useRef(false);
  const modalOpenRef = useRef(false);

  const openRazorpayCheckout = async () => {
    if (disabled || processingRef.current || modalOpenRef.current) return;

    if (typeof beforePay === "function") {
      const canContinue = beforePay();
      if (!canContinue) {
        return;
      }
    }

    if (!cartItems?.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      toast.error("Payment service is unavailable right now");
      return;
    }

    processingRef.current = true;
    onPaymentStart?.();

    try {
      await syncCartWithBackend(cartItems);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load payment gateway. Please try again.");
      }

      const paymentOrder = await createPaymentOrderRequest({
        shippingAddress,
      });
      const razorpayOrderId = paymentOrder?.razorpayOrderId || paymentOrder?.order_id;
      const amount = paymentOrder?.amount;
      const currency = paymentOrder?.currency || "INR";

      if (!razorpayOrderId || !amount) {
        throw new Error("Invalid payment session. Please try again.");
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "BagStore",
        description: "Premium Bag Purchase",
        prefill: {
          name: shippingAddress.name || user.name,
          email: user.email,
          contact: shippingAddress.phone,
        },
        notes: {
          address: `${shippingAddress.address}, ${shippingAddress.city} - ${shippingAddress.pincode}`,
        },
        theme: {
          color: "#C8A97E",
        },
        modal: {
          ondismiss: () => {
            modalOpenRef.current = false;
            toast.error("Payment cancelled");
            onPaymentEnd?.();
            processingRef.current = false;
          },
        },
        handler: async (response) => {
          try {
            const verification = await verifyPaymentRequest(response);

            if (!verification?.order?._id) {
              throw new Error("Order verification did not return a valid order");
            }

            clearCart();
            toast.success("Payment successful");
            toast.success("Order placed successfully");
            onOrderPlaced?.(verification.order);
          } catch (error) {
            toast.error(error.message || "Order confirmation failed");
          } finally {
            modalOpenRef.current = false;
            onPaymentEnd?.();
            processingRef.current = false;
          }
        },
      });

      razorpay.on("payment.failed", (response) => {
        modalOpenRef.current = false;
        const message = response?.error?.description || "Payment failed";
        toast.error(message);
        onPaymentEnd?.();
        processingRef.current = false;
      });

      modalOpenRef.current = true;
      razorpay.open();
    } catch (error) {
      toast.error(error.message || "Payment failed");
      onPaymentEnd?.();
      processingRef.current = false;
      modalOpenRef.current = false;
    }
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={openRazorpayCheckout}
      disabled={disabled || isLoading}
      className="w-full h-12 sm:h-14 rounded-xl bg-theme-text text-white font-semibold flex items-center justify-center gap-2 hover:bg-theme-accent disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <CreditCard size={18} />
      {isLoading ? "Processing..." : "Pay Now"}
    </motion.button>
  );
}
