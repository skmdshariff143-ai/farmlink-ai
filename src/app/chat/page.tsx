"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import AIChatbot from "@/components/layout/AIChatbot";
import { useFarmStore, ChatRoom } from "@/store/useFarmStore";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Send, Mic, Image as ImageIcon, Video, Phone, CheckCheck, 
  Circle, ChevronLeft, ArrowLeft, Bot, VideoOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomIdFromUrl = searchParams.get("id");

  const { chatRooms, addMessage, currentUser } = useFarmStore();

  const [activeRoomId, setActiveRoomId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("Connecting...");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatRooms, isTyping]);

  // Handle URL changes
  useEffect(() => {
    const targetId = roomIdFromUrl || (chatRooms.length > 0 ? chatRooms[0].id : "");
    if (targetId && targetId !== activeRoomId) {
      const timer = setTimeout(() => {
        setActiveRoomId(targetId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [roomIdFromUrl, chatRooms, activeRoomId]);

  const activeRoom = chatRooms.find((r) => r.id === activeRoomId);

  const handleSend = () => {
    if (!inputText.trim() || !activeRoomId) return;

    addMessage(
      activeRoomId,
      currentUser.id,
      currentUser.name,
      inputText
    );
    
    setInputText("");

    // Simulate typing indicator and response from other participant
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Received your message. We are processing this trade option.";
      
      if (activeRoom?.participantRole === "Buyer") {
        replyText = "Sounds good. Please arrange the transport pickup. I'll make sure the escrow release code is updated as soon as the load is weighed.";
      } else if (activeRoom?.participantRole === "Transport") {
        replyText = "My truck will arrive at 8:00 AM tomorrow. Please make sure the grains are dry and bagged for fast loading.";
      }

      addMessage(
        activeRoomId,
        activeRoom?.participantName === "Express Logistics (Harpreet)" ? "user_harpreet" : "user_nikhil",
        activeRoom?.participantName || "Trader",
        replyText
      );
    }, 2000);
  };

  const handleSimulatedMedia = (type: "image" | "audio") => {
    if (!activeRoomId) return;

    if (type === "image") {
      addMessage(
        activeRoomId,
        currentUser.id,
        currentUser.name,
        "",
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80"
      );
    } else {
      addMessage(
        activeRoomId,
        currentUser.id,
        currentUser.name,
        "",
        undefined,
        true
      );
    }
  };

  const startVideoCall = () => {
    setIsVideoCalling(true);
    setCallStatus("Ringing encrypted peer connection...");
    
    setTimeout(() => {
      setCallStatus("Connected • Live Audio/Video");
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AIChatbot />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex gap-6 overflow-hidden h-[calc(100vh-5.5rem)]">
        
        {/* Left Side: Room list */}
        <div className={`w-full md:w-80 shrink-0 border border-border-nature rounded-3xl bg-white dark:bg-card-bg/60 p-4 flex flex-col justify-between ${
          roomIdFromUrl && "hidden md:flex"
        }`}>
          <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-border-nature pb-3">
              <span className="font-extrabold text-sm text-text-charcoal">Direct Messages</span>
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </div>

            <div className="space-y-2">
              {chatRooms.map((room) => {
                const isSelected = room.id === activeRoomId;
                return (
                  <div
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center gap-3 ${
                      isSelected 
                        ? "bg-primary/5 border-primary/20" 
                        : "border-border-nature hover:bg-bg-nature/40"
                    }`}
                  >
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={room.participantAvatar}
                        alt={room.participantName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/10"
                      />
                      {room.online && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-green-500 text-white stroke-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-xs font-bold text-text-charcoal truncate leading-none">
                          {room.participantName}
                        </h4>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate mt-1 leading-normal">
                        {room.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button 
            onClick={() => router.push("/dashboard?tab=overview")}
            className="w-full py-2 border border-border-nature hover:bg-bg-nature text-text-charcoal font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Right Side: Active Chat Frame */}
        <div className={`flex-1 border border-border-nature rounded-3xl bg-white dark:bg-card-bg/60 flex flex-col justify-between overflow-hidden relative ${
          !roomIdFromUrl && "hidden md:flex"
        }`}>
          {activeRoom ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border-nature flex items-center justify-between bg-bg-nature/20">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => router.push("/chat")}
                    className="md:hidden p-1.5 rounded-xl border border-border-nature hover:bg-bg-nature"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeRoom.participantAvatar}
                      alt={activeRoom.participantName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-text-charcoal leading-none">
                      {activeRoom.participantName}
                    </h3>
                    <span className="text-[9px] text-primary font-bold mt-1 inline-block">
                      {activeRoom.participantRole} • {activeRoom.online ? "Online" : "Away"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={startVideoCall}
                    className="p-2 border border-border-nature hover:border-primary hover:text-primary rounded-xl text-gray-400 transition-all"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="p-2 border border-border-nature hover:border-primary hover:text-primary rounded-xl text-gray-400 transition-all">
                    <Phone className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeRoom.messages.map((m) => {
                  const isMe = m.senderId === currentUser.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className="space-y-1">
                        <div
                          className={`max-w-[280px] sm:max-w-md rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                            isMe 
                              ? "bg-primary text-white rounded-tr-none" 
                              : "bg-bg-nature/60 dark:bg-card-bg border border-border-nature rounded-tl-none text-text-charcoal"
                          }`}
                        >
                          {/* Image message */}
                          {m.image ? (
                            <div className="space-y-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.image}
                                alt="crop payload"
                                className="rounded-xl max-h-40 object-cover"
                              />
                              <p className="text-[10px] opacity-80">Attached crop audit photo</p>
                            </div>
                          ) : m.audio ? (
                            <div className="flex items-center gap-2 py-1">
                              <span className="text-sm">🔊</span>
                              <div className="space-y-0.5">
                                <div className="h-1.5 w-24 bg-white/30 rounded-full overflow-hidden">
                                  <div className="h-full bg-accent w-3/4 animate-pulse" />
                                </div>
                                <span className="text-[9px] opacity-75">Voice Note (0:04)</span>
                              </div>
                            </div>
                          ) : (
                            m.text
                          )}
                        </div>
                        <div className={`text-[9px] text-gray-400 flex items-center gap-1 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}>
                          <span>{m.timestamp}</span>
                          {isMe && <CheckCheck className="h-3 w-3 text-primary" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Simulator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-bg-nature/60 dark:bg-card-bg border border-border-nature rounded-2xl rounded-tl-none p-3 text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span>{activeRoom.participantName} is typing...</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div className="p-3 border-t border-border-nature bg-bg-nature/10 flex items-center gap-2">
                <button
                  onClick={() => handleSimulatedMedia("image")}
                  className="p-2 border border-border-nature hover:border-primary hover:text-primary rounded-xl text-gray-400 transition-all shrink-0"
                  title="Simulate Photo Upload"
                >
                  <ImageIcon className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => handleSimulatedMedia("audio")}
                  className="p-2 border border-border-nature hover:border-primary hover:text-primary rounded-xl text-gray-400 transition-all shrink-0"
                  title="Simulate Voice Message"
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>

                <input
                  type="text"
                  placeholder="Type message securely..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-4 py-2 border border-border-nature rounded-xl text-xs bg-white dark:bg-card-bg outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                />
                
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2 bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary rounded-xl transition-all shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <Bot className="h-12 w-12 text-primary animate-float" />
              <h3 className="font-bold text-sm text-text-charcoal">No Conversation Selected</h3>
              <p className="text-xs text-gray-400 max-w-xs">Select a direct message channel on the left side to begin direct bargaining negotiations.</p>
            </div>
          )}

          {/* Video Calling Modal */}
          <AnimatePresence>
            {isVideoCalling && (
              <div className="absolute inset-0 bg-black/90 z-50 flex flex-col justify-between p-8 text-center text-white">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm">{activeRoom?.participantName}</h4>
                  <p className="text-[10px] text-green-300 uppercase tracking-widest font-bold">{callStatus}</p>
                </div>

                <div className="flex justify-center my-10">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="h-24 w-24 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/5 relative"
                  >
                    <Video className="h-10 w-10 text-white" />
                  </motion.div>
                </div>

                <button
                  onClick={() => setIsVideoCalling(false)}
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all"
                >
                  <VideoOff className="h-5 w-5" />
                </button>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Loading Chat Rooms...</span>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
