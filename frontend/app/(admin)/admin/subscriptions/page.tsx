import { Metadata } from "next";
import { AdminSubscriptionsView } from "@/features/admin/components/subscriptions/AdminSubscriptionsView";

export const metadata: Metadata = {
  title: "VIP Subscriptions & Revenue | NIRA Admin",
  description: "Monitor paid memberships, track subscription plans, and grant VIP passes.",
};

export default function AdminSubscriptionsPage() {
  return <AdminSubscriptionsView />;
}
