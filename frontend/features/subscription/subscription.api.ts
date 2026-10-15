import { api } from "@/lib/axios";

export const devUpgradeApi = async (data?: { duration?: "1_month" | "3_months" | "6_months" | "lifetime" }) => {
  const response = await api.post("/subscription/dev-upgrade", data);
  return response.data;
};
