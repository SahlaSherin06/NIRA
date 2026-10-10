import { api } from "@/lib/axios";

export const devUpgradeApi = async () => {
  const response = await api.post("/subscription/dev-upgrade");
  return response.data;
};

export const createOrderApi = async () => {
  const response = await api.post("/subscription/create-order");
  return response.data;
};

export const verifyPaymentApi = async (paymentData: any) => {
  const response = await api.post("/subscription/verify-payment", paymentData);
  return response.data;
};
