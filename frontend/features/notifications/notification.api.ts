import { api } from "@/lib/axios";

export interface NotificationData {
  _id: string;
  type: "interest_received" | "match" | "system" | "new_message" | "superlike_received";
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedUser?: {
    _id: string;
    name: string;
    mainPhoto?: string;
  };
  // Legacy field just in case
  relatedUserId?: {
    _id: string;
    name: string;
  };
}

/**
 * Function: getNotificationsApi
 * Executes the core operations and logic for get notifications api.
 */
export const getNotificationsApi = async (): Promise<NotificationData[]> => {
  const res = await api.get("/notifications");
  return res.data.notifications;
};

/**
 * Function: markNotificationsReadApi
 * Executes the core operations and logic for mark notifications read api.
 */
export const markNotificationsReadApi = async (): Promise<void> => {
  await api.put("/notifications/read");
};

