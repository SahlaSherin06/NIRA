import { AdminLayout } from "@/features/admin/components/layout/AdminLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal - NIRA",
  description: "Management and analytics dashboard for NIRA Matrimony",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
