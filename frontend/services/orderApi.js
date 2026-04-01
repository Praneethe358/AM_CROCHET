import authClient from "@/services/authApi";
import { axiosWithRetry } from "@/lib/fetchWithRetry";

const extractMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.msg ||
    "Something went wrong. Please try again."
  );
};

const isObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const getProductIdentifier = (item) => {
  if (isObjectId(item?._id)) return item._id;
  if (isObjectId(item?.id)) return item.id;
  if (isObjectId(item?.productId)) return item.productId;
  return null;
};

export const syncCartWithBackend = async (cartItems = []) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Your cart is empty.");
  }

  try {
    await authClient.delete("/cart", { timeout: 10000 });

    for (const item of cartItems) {
      const productId = getProductIdentifier(item);

      if (!productId) {
        throw new Error(
          "One or more items are not ready for secure checkout yet."
        );
      }

      await authClient.post(
        "/cart",
        {
          productId,
          quantity: Number(item.quantity) || 1,
        },
        { timeout: 10000 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(extractMessage(error));
  }
};

export const getUserOrdersRequest = async () => {
  try {
    const response = await axiosWithRetry(
      () => authClient.get("/orders/my", { timeout: 10000 }),
      { retries: 3, retryDelay: 2000 }
    );
    return response.data?.data || [];
  } catch (error) {
    throw new Error(extractMessage(error));
  }
};

export const createOrderRecordRequest = async (payload, options = {}) => {
  try {
    const requestPayload = { ...(payload || {}) };
    const headers = {};
    if (options?.idempotencyKey) {
      headers["x-idempotency-key"] = options.idempotencyKey;
      requestPayload.idempotencyKey = options.idempotencyKey;
    }

    const response = await authClient.post("/orders", requestPayload, {
      headers,
      timeout: 12000,
    });
    return response.data?.data || response.data;
  } catch (error) {
    throw new Error(extractMessage(error));
  }
};
