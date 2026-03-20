"use client";

import { motion } from "framer-motion";

export default function CheckoutForm({ formData, errors, onFieldChange }) {
  const fieldClass = (fieldName) =>
    `w-full h-12 px-4 rounded-xl bg-theme-bg border outline-none transition-all ${
      errors[fieldName]
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-theme-border focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20"
    }`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-theme-card/90 border border-theme-border rounded-3xl p-5 sm:p-7 shadow-[0_10px_30px_rgba(200,169,126,0.12)]"
    >
      <h2 className="text-2xl font-serif font-bold text-theme-text mb-5">Shipping Details</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-theme-text mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            placeholder="Enter full name"
            autoComplete="name"
            className={fieldClass("name")}
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-text mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(event) => onFieldChange("phone", event.target.value)}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            className={fieldClass("phone")}
          />
          {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-text mb-2">Address</label>
          <textarea
            value={formData.address}
            onChange={(event) => onFieldChange("address", event.target.value)}
            placeholder="House no, street, area"
            autoComplete="street-address"
            rows={3}
            className={`w-full px-4 py-3 rounded-xl bg-theme-bg border outline-none transition-all resize-none ${
              errors.address
                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-theme-border focus:border-theme-accent focus:ring-2 focus:ring-theme-accent/20"
            }`}
          />
          {errors.address && <p className="mt-1.5 text-xs text-red-500">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(event) => onFieldChange("city", event.target.value)}
              placeholder="City"
              autoComplete="address-level2"
              className={fieldClass("city")}
            />
            {errors.city && <p className="mt-1.5 text-xs text-red-500">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(event) => onFieldChange("pincode", event.target.value)}
              placeholder="Pincode"
              autoComplete="postal-code"
              className={fieldClass("pincode")}
            />
            {errors.pincode && <p className="mt-1.5 text-xs text-red-500">{errors.pincode}</p>}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
