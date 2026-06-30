import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001"; // Deployed Socket port

export function useMobileSocket(roomId?: string, userId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      if (roomId) socket.emit("room:join", { roomId });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("message:received", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("bid:tick", (bid: any) => {
      setBids((prev) => [bid, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId]);

  const sendChatMessage = (text: string, senderName: string) => {
    if (!socketRef.current || !roomId || !userId) return;
    socketRef.current.emit("message:send", {
      roomId,
      senderId: userId,
      senderName,
      text
    });
  };

  const emitBid = (listingId: string, cropName: string, bidderName: string, bidAmount: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit("bid:update", {
      listingId,
      cropName,
      bidderName,
      bidAmount
    });
  };

  return {
    connected,
    messages,
    bids,
    sendChatMessage,
    emitBid
  };
}
