"use client";

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-nature/70 flex items-center justify-center p-4 relative overflow-hidden organic-bg">
      {/* Decorative ambient background spots */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] aspect-square rounded-full bg-accent/15 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
