import { api } from "@/lib/axios";

export const devUpgradeApi = async () => {
  const response = await api.post("/subscription/dev-upgrade");
  return response.data;
};
