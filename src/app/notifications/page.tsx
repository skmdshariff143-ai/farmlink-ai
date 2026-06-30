"use client";

import React, { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AIChatbot from "@/components/layout/AIChatbot";
import { useFarmStore } from "@/store/useFarmStore";
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

function NotificationsPageContent() {
  const { notifications, markNotificationsAsRead } = useFarmStore();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AIChatbot />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-bg-nature/20">
          
          <div className="flex justify-between items-center border-b border-border-nature pb-6">
            <div>
              <h1 className="text-2xl font-black text-text-charcoal flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Notification Center
              </h1>
              <p className="text-xs text-gray-500">Mandi price shift alerts, dispatch updates, and weather warnings.</p>
            </div>
            <button
              onClick={markNotificationsAsRead}
              className="px-4 py-2 border border-border-nature hover:bg-bg-nature text-text-charcoal font-bold text-xs rounded-xl transition-all"
            >
              Mark all read
            </button>
          </div>

          <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-charcoal border-b border-border-nature pb-3 mb-2">Push Alerts history</h3>
            <div className="space-y-3.5">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  No notifications recorded.
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      !n.read ? "bg-primary/5 border-primary/20" : "border-border-nature bg-bg-nature/10"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      n.type === "success" ? "bg-green-100 text-primary" :
                      n.type === "warning" ? "bg-yellow-100 text-yellow-600" : "bg-primary/10 text-primary"
                    }`}>
                      {n.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-text-charcoal text-[13px]">{n.title}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-gray-500 mt-1 leading-relaxed text-[11px]">{n.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500">Loading notifications...</span>
        </div>
      </div>
    }>
      <NotificationsPageContent />
    </Suspense>
  );
}
