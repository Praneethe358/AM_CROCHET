import authClient from "@/services/authApi";

let razorpayScriptPromise = null;

const extractMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.msg ||
    "Something went wrong. Please try again."
  );
};

export const loadRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export const createPaymentOrderRequest = async ({ couponCode, shippingAddress } = {}) => {
  try {
    const preferred = await authClient.post("/payment/create-order", { couponCode, shippingAddress });
    return preferred.data?.data || preferred.data;
  } catch (preferredError) {
    if (preferredError?.response?.status !== 404) {
      throw new Error(extractMessage(preferredError));
    }

    try {
      const fallback = await authClient.post("/orders/create", { couponCode, shippingAddress });
      return fallback.data?.data || fallback.data;
    } catch (fallbackError) {
      throw new Error(extractMessage(fallbackError));
    }
  }
};

export const verifyPaymentRequest = async (payload) => {
  try {
    const preferred = await authClient.post("/payment/verify", payload);
    return preferred.data?.data || preferred.data;
  } catch (preferredError) {
    if (preferredError?.response?.status !== 404) {
      throw new Error(extractMessage(preferredError));
    }

    try {
      const fallback = await authClient.post("/orders/verify", payload);
      return fallback.data?.data || fallback.data;
    } catch (fallbackError) {
      throw new Error(extractMessage(fallbackError));
    }
  }
};
