import { Metadata } from "next";
import { AdminNotificationList } from "@/features/admin/components/notifications/AdminNotificationList";

export const metadata: Metadata = {
  title: "Notifications & Alerts | NIRA Admin",
  description: "Real-time security alerts, registration events, and VIP upgrade notifications.",
};

export default function AdminNotificationsPage() {
  return <AdminNotificationList />;
}
