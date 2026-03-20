"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Container from "@/components/Container";
import CheckoutForm from "@/components/CheckoutForm";
import OrderSummary from "@/components/OrderSummary";
import PaymentButton from "@/components/PaymentButton";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const totals = useMemo(() => {
    const subtotal = (cartItems || []).reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
    const shipping = subtotal > 0 ? 49 : 0;
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

  const handlePaymentStart = () => {
    setIsProcessingPayment(true);
  };

  const handlePaymentEnd = () => {
    setIsProcessingPayment(false);
  };

  const handleOrderPlaced = () => {
    router.push("/orders");
  };

  const canProceedToPay =
    !isProcessingPayment &&
    (cartItems || []).length > 0 &&
    Object.values(formData).every((value) => value.trim().length > 0);

  return (
    <ProtectedRoute>
      <section className="pt-28 pb-36 md:pb-24 min-h-screen bg-theme-bg">
        <Container>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-theme-text">Checkout</h1>
              <p className="text-theme-faint mt-1">Secure payment and fast order confirmation.</p>
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
                  <PaymentButton
                    shippingAddress={formData}
                    disabled={!canProceedToPay}
                    beforePay={validateForm}
                    isLoading={isProcessingPayment}
                    onPaymentStart={handlePaymentStart}
                    onPaymentEnd={handlePaymentEnd}
                    onOrderPlaced={handleOrderPlaced}
                  />
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
            <PaymentButton
              shippingAddress={formData}
              disabled={!canProceedToPay}
              beforePay={validateForm}
              isLoading={isProcessingPayment}
              onPaymentStart={handlePaymentStart}
              onPaymentEnd={handlePaymentEnd}
              onOrderPlaced={handleOrderPlaced}
            />
          </div>
        )}
      </section>
    </ProtectedRoute>
  );
}
