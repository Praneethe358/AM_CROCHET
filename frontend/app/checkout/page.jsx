"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Container from "@/components/Container";
import CheckoutForm from "@/components/CheckoutForm";
import OrderSummary from "@/components/OrderSummary";
import { useCart } from "@/context/CartContext";
import { createOrderRecordRequest } from "@/services/orderApi";

// WhatsApp business number (without + or country code spaces)
const WHATSAPP_PHONE = "919080689844"; // Update this with actual WhatsApp business number

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const idempotencyKeyRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totals = useMemo(() => {
    const subtotal = (cartItems || []).reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
    const shipping = 0;
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
  }, [cartItems]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.phone.trim()) nextErrors.phone = "Phone number is required";
    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!formData.address.trim()) nextErrors.address = "Address is required";
    if (!formData.city.trim()) nextErrors.city = "City is required";
    if (!formData.pincode.trim()) nextErrors.pincode = "Pincode is required";
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
      nextErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const generateWhatsAppMessage = (orderData) => {
    const items = cartItems || [];
    if (items.length === 0) return "";

    let message = "Hello, I want to order:\n\n";
    
    items.forEach((item) => {
      const name = item.name || "Product";
      const qty = item.quantity || 1;
      const price = Number(item.price || 0) * qty;
      message += `${name} x${qty} - ₹${price.toFixed(2)}\n`;
    });

    message += `\n*Total: ₹${totals.total.toFixed(2)}*\n\n`;
    message += `*Shipping Details:*\n`;
    message += `Name: ${formData.name}\n`;
    message += `Phone: ${formData.phone}\n`;
    message += `Address: ${formData.address}, ${formData.city} - ${formData.pincode}\n`;
    
    if (orderData?._id) {
      message += `\nOrder ID: ${orderData._id}`;
    }

    return message;
  };

  const openWhatsApp = (orderData) => {
    try {
      const message = generateWhatsAppMessage(orderData);
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, "_blank");
      return true;
    } catch (error) {
      console.error("WhatsApp redirect error:", error);
      toast.error("Failed to open WhatsApp. Please try again.");
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;

    const isFormValid = validateForm();
    if (!isFormValid) {
      return;
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmWhatsAppOrder = async () => {
    setShowConfirmModal(false);
    
    const itemsPayload = cartItems.map((item) => ({
      productId: item._id || item.id || item.productId,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    }));

    if (!idempotencyKeyRef.current) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        idempotencyKeyRef.current = crypto.randomUUID();
      } else {
        idempotencyKeyRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }
    }

    setIsPlacingOrder(true);
    try {
      const orderData = await createOrderRecordRequest(
        {
          items: itemsPayload,
          shippingAddress: formData,
        },
        {
          idempotencyKey: idempotencyKeyRef.current,
        }
      );

      // Open WhatsApp with order details
      const whatsappOpened = openWhatsApp(orderData);
      
      if (whatsappOpened) {
        clearCart();
        idempotencyKeyRef.current = null;
        toast.success("Order saved! Complete your order on WhatsApp.");
        router.push("/orders");
      }
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const canPlaceOrder =
    !isPlacingOrder &&
    (cartItems || []).length > 0 &&
    Object.values(formData).every((value) => value.trim().length > 0);

  return (
    <ProtectedRoute>
      <section className="pt-28 pb-36 md:pb-24 min-h-screen bg-theme-bg">
        <Container>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-theme-text">Checkout</h1>
              <p className="text-theme-faint mt-1">Complete your order via WhatsApp.</p>
            </div>
          </div>

          {(cartItems || []).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto bg-theme-card border border-theme-border rounded-3xl p-7 text-center"
            >
              <p className="text-theme-faint">Your cart is empty. Add products before checkout.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <CheckoutForm formData={formData} errors={errors} onFieldChange={handleFieldChange} />

              <div className="space-y-5">
                <OrderSummary shippingFee={totals.shipping} />

                <div className="hidden md:block">
                  <button
                    type="button"
                    disabled={!canPlaceOrder}
                    onClick={handlePlaceOrder}
                    className="w-full h-12 sm:h-14 rounded-xl bg-green-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <MessageCircle size={20} />
                    {isPlacingOrder ? "Processing..." : "Order via WhatsApp"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>

        {(cartItems || []).length > 0 && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-theme-bg/95 backdrop-blur-xl border-t border-theme-border p-4 pb-safe shadow-[0_-12px_40px_rgba(44,44,44,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-theme-faint">Total</p>
              <p className="text-xl font-bold text-theme-text">₹{totals.total.toFixed(2)}</p>
            </div>
            <button
              type="button"
              disabled={!canPlaceOrder}
              onClick={handlePlaceOrder}
              className="w-full h-12 rounded-xl bg-green-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <MessageCircle size={18} />
              {isPlacingOrder ? "Processing..." : "Order via WhatsApp"}
            </button>
          </div>
        )}

        {/* WhatsApp Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-theme-card rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-theme-text mb-2">
                Confirm WhatsApp Order
              </h3>
              <p className="text-center text-theme-faint mb-6">
                You will be redirected to WhatsApp to complete your order. Your order will be saved first.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-11 rounded-xl border border-theme-border font-medium text-theme-text hover:bg-theme-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmWhatsAppOrder}
                  className="flex-1 h-11 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </section>
    </ProtectedRoute>
  );
}
