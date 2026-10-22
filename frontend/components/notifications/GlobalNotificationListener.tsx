"use client";

import { useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/auth.queries";
import { notificationKeys } from "@/features/notifications/notification.queries";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

/**
 * Component: GlobalNotificationListener
 * Silently listens for real-time notification events via Socket.IO
 * and updates React Query cache (navbar notification badge & list)
 * without rendering any intrusive toasts or popups.
 */
export function GlobalNotificationListener() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userId = session?.user?._id || session?.user?.userId;
    if (!userId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join", userId);
    });

    // Invalidate notifications query when a new notification or warning arrives
    socket.on("newNotification", () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    socket.on("safetyWarning", () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    // Real-time Force Logout if admin suspends this account
    socket.on("accountSuspended", () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("nira_access_token");
        queryClient.clear();
        window.location.href = "/login?suspended=true";
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [session, queryClient]);

  return null;
}
