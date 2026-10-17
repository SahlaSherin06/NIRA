import { Metadata } from "next";
import { AdminUsersView } from "@/features/admin/components/users/AdminUsersView";

export const metadata: Metadata = {
  title: "Member Management & Directory | NIRA Admin",
  description: "Administrative access controls, verified profiles, and user management.",
};

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
