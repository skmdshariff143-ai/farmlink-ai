"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// In production, direct connections to the environment SOCKET URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useSocket(roomId?: string, userContext?: { id: string; name: string }) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ userId: string; name: string; status: string }[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [bidTick, setBidTick] = useState<any>(null);
  const [deliveryProgress, setDeliveryProgress] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // 1. Initialize client-side socket connection
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log(`Connected to Socket server: ${socket.id}`);

      // Register user context immediately
      if (userContext) {
        socket.emit("user:status", {
          userId: userContext.id,
          name: userContext.name,
          status: "online"
        });
      }

      // Join dynamic room
      if (roomId) {
        socket.emit("room:join", { roomId });
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // 2. Event Listeners
    socket.on("user:status:update", (users: any[]) => {
      setOnlineUsers(users);
    });

    socket.on("message:received", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("bid:tick", (tick: any) => {
      setBidTick(tick);
    });

    socket.on("order:progress", (progress: any) => {
      setDeliveryProgress(progress);
    });

    socket.on("notification:receive", (notif: any) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    socket.on("typing:status", ({ userName, isTyping }: any) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(userName) ? prev : [...prev, userName];
        } else {
          return prev.filter((name) => name !== userName);
        }
      });
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userContext?.id]);

  // 3. Emitter Functions
  const sendChatMessage = (text: string, image?: string, audio?: boolean) => {
    if (!socketRef.current || !roomId || !userContext) return;
    socketRef.current.emit("message:send", {
      roomId,
      senderId: userContext.id,
      senderName: userContext.name,
      text,
      image,
      audio
    });
  };

  const emitBid = (listingId: string, cropName: string, bidAmount: number) => {
    if (!socketRef.current || !userContext) return;
    socketRef.current.emit("bid:update", {
      listingId,
      cropName,
      bidderName: userContext.name,
      bidAmount
    });
  };

  const emitOrderUpdate = (orderId: string, trackingStep: number, status: string, location: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("order:update", {
      orderId,
      trackingStep,
      status,
      location
    });
  };

  const emitNotification = (targetUserId: string, message: string, type?: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("notification:push", {
      userId: targetUserId,
      message,
      type
    });
  };

  const startTyping = () => {
    if (!socketRef.current || !roomId || !userContext) return;
    socketRef.current.emit("typing:start", { roomId, userName: userContext.name });
  };

  const stopTyping = () => {
    if (!socketRef.current || !roomId || !userContext) return;
    socketRef.current.emit("typing:stop", { roomId, userName: userContext.name });
  };

  return {
    connected,
    typingUsers,
    onlineUsers,
    messages,
    bidTick,
    deliveryProgress,
    notifications,
    sendChatMessage,
    emitBid,
    emitOrderUpdate,
    emitNotification,
    startTyping,
    stopTyping
  };
}
