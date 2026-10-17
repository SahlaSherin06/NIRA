import { Metadata } from "next";
import { AdminReportsView } from "@/features/admin/components/reports/AdminReportsView";

export const metadata: Metadata = {
  title: "Reports & Safety Moderation | NIRA Admin",
  description: "Review member complaints, issue warnings, and enforce account bans.",
};

export default function AdminReportsPage() {
  return <AdminReportsView />;
}
