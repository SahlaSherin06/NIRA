import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const backendUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (process.env.NEXT_PUBLIC_BACKEND_URL
        ? process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/api\/?$/, "")
        : "https://beats-soma-argued-javascript.trycloudflare.com");

    socket = io(backendUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });
  }
  return socket;
};
