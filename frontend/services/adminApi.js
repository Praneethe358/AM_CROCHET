import authClient from "./authApi";

const isRetryableRequestError = (error) => {
  const message = (error?.message || "").toLowerCase();
  return (
    error?.code === "ECONNABORTED" ||
    error?.code === "ERR_NETWORK" ||
    message.includes("timeout") ||
    message.includes("network")
  );
};

const getWithRetry = async (url, config = {}, retries = 1) => {
  try {
    return await authClient.get(url, config);
  } catch (error) {
    if (retries > 0 && isRetryableRequestError(error)) {
      return getWithRetry(url, config, retries - 1);
    }
    throw error;
  }
};

export const getAdminProducts = async () => {
  const response = await authClient.get("/admin/products");
  return response.data?.data || [];
};

export const createAdminProduct = async (productData) => {
  const response = await authClient.post("/admin/products", productData);
  return response.data?.data || response.data;
};

export const updateAdminProduct = async (id, productData) => {
  const response = await authClient.put(`/admin/products/${id}`, productData);
  return response.data?.data || response.data;
};

export const deleteAdminProduct = async (id) => {
  const response = await authClient.delete(`/admin/products/${id}`);
  return response.data?.data || response.data;
};

export const getAdminOrders = async () => {
  const response = await authClient.get("/admin/orders");
  return response.data?.data || [];
};

export const updateOrderStatus = async (id, orderStatus) => {
  const response = await authClient.put(
    `/admin/orders/${id}`,
    { status: orderStatus, orderStatus },
  );
  return response.data?.data || response.data;
};

export const getAdminDashboardStats = async () => {
  try {
    const products = await getAdminProducts();
    const orders = await getAdminOrders();
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.finalAmount || order.totalAmount || 0),
      0
    );
    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
    };
  } catch (error) {
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    };
  }
};

export const uploadAdminImage = async (file) => {
  // If it's already a URL string, return it directly
  if (typeof file === "string") return file;

  const formData = new FormData();
  formData.append("image", file);

  const response = await authClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data?.imageUrl || response.data?.imageUrl || "";
};

export const uploadAdminMultipleImages = async (files) => {
  // Separate files (File objects) from existing URLs (strings)
  const existingUrls = files.filter((f) => typeof f === "string");
  const fileObjects = files.filter((f) => f instanceof File);

  const uploadedUrls = [];

  if (fileObjects.length > 0) {
    const formData = new FormData();
    fileObjects.forEach((f) => formData.append("images", f));

    const response = await authClient.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const images = response.data?.data?.images || response.data?.images || [];
    images.forEach((img) => {
      if (img.imageUrl) uploadedUrls.push(img.imageUrl);
    });
  }

  return [...existingUrls, ...uploadedUrls];
};

export const uploadAdminMedia = async (file, mediaType = "image") => {
  if (typeof file === "string") return file;

  const normalizedType = mediaType === "video" ? "video" : "image";
  const formData = new FormData();
  formData.append("media", file);
  formData.append("mediaType", normalizedType);

  const response = await authClient.post("/upload/media", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data?.mediaUrl || response.data?.mediaUrl || "";
};

export const getAdminHero = async () => {
  const response = await getWithRetry("/admin/hero", { timeout: 25000 }, 1);
  return response.data?.data || null;
};

export const updateAdminHero = async (heroData) => {
  const response = await authClient.put("/admin/hero", heroData);
  return response.data?.data || response.data;
};

export const getAdminCategories = async () => {
  const response = await authClient.get("/admin/categories");
  return response.data?.data || [];
};

export const createAdminCategory = async (categoryData) => {
  const response = await authClient.post("/admin/categories", categoryData);
  return response.data?.data || response.data;
};

export const updateAdminCategory = async (id, categoryData) => {
  const response = await authClient.put(`/admin/categories/${id}`, categoryData);
  return response.data?.data || response.data;
};

export const deleteAdminCategory = async (id) => {
  const response = await authClient.delete(`/admin/categories/${id}`);
  return response.data?.data || response.data;
};

export const getAdminFeatured = async () => {
  const response = await getWithRetry("/admin/featured", { timeout: 20000 }, 1);
  return response.data?.data || { items: [], maxItems: 6, isActive: true };
};

export const updateAdminFeatured = async (featuredData) => {
  const response = await authClient.put("/admin/featured", featuredData);
  return response.data?.data || response.data;
};
