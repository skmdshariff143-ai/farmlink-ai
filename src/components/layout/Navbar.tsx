"use client";

import React, { useState, useEffect } from "react";
import { useFarmStore, UserRole } from "@/store/useFarmStore";
import { 
  Leaf, Search, Bell, MessageSquare, Globe, Sun, Moon, 
  ChevronDown, Wallet, User, UserCheck, LogOut, CheckCircle2, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { 
    currentUser, 
    setRole, 
    notifications, 
    markNotificationsAsRead, 
    chatRooms 
  } = useFarmStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState("EN");

  // Read status for notifications
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const activeChatRoomsCount = chatRooms.length;

  useEffect(() => {
    // Initialise dark mode state based on html class
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    setShowRoleMenu(false);
    // Add success feedback animation
    const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==");
    audio.play().catch(() => {});
  };

  const languages = [
    { code: "EN", name: "English" },
    { code: "TE", name: "తెలుగు (Telugu)" },
    { code: "HI", name: "हिन्दी (Hindi)" },
    { code: "TA", name: "தமிழ் (Tamil)" },
    { code: "KA", name: "ಕನ್ನಡ (Kannada)" },
    { code: "ML", name: "മലയാളം (Malayalam)" },
    { code: "MR", name: "मराठी (Marathi)" },
    { code: "GU", name: "ગુજરાતી (Gujarati)" },
    { code: "PA", name: "ਪੰਜਾਬੀ (Punjabi)" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-nature glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-md shadow-primary/20"
            >
              <Leaf className="h-5 w-5" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FarmLink<span className="font-extrabold text-accent">AI</span>
            </span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search crops, logistics, cold storage, schemes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-4 py-2 border border-border-nature rounded-full bg-bg-nature/40 dark:bg-card-bg/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Actions Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Identity Switcher (For Demo purposes) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all duration-200"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Role:</span> {currentUser.role}
                <ChevronDown className="h-3 w-3" />
              </button>

              <AnimatePresence>
                {showRoleMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowRoleMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl bg-card-bg border border-border-nature shadow-xl p-2 z-50 overflow-hidden"
                    >
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 px-3 py-1.5 border-b border-border-nature mb-1">
                        Demo View Dashboard
                      </div>
                      {(["Farmer", "Buyer", "Transport", "Warehouse", "Admin"] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(r)}
                          className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            currentUser.role === r 
                              ? "bg-primary text-white" 
                              : "hover:bg-bg-nature text-text-charcoal"
                          }`}
                        >
                          <span>{r} Dashboard</span>
                          {currentUser.role === r && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Wallet Balance Display */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-accent/15 border border-accent/20 rounded-full text-xs font-semibold text-primary">
              <Wallet className="h-3.5 w-3.5" />
              <span>₹{currentUser.walletBalance.toLocaleString("en-IN")}</span>
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLanguageMenu(!showLanguageMenu);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
              >
                <Globe className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {showLanguageMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowLanguageMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-48 max-h-60 overflow-y-auto rounded-2xl bg-card-bg border border-border-nature shadow-xl p-1.5 z-50"
                    >
                      {languages.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLang(l.code);
                            setShowLanguageMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            lang === l.code 
                              ? "bg-secondary/10 text-primary" 
                              : "hover:bg-bg-nature text-text-charcoal"
                          }`}
                        >
                          {l.name}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Messages Indicator */}
            <Link href="/chat" className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all relative">
              <MessageSquare className="h-5 w-5" />
              {activeChatRoomsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card-bg" />
              )}
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                  setShowLanguageMenu(false);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white ring-2 ring-card-bg">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-80 rounded-2xl bg-card-bg border border-border-nature shadow-xl p-2 z-50"
                    >
                      <div className="flex items-center justify-between border-b border-border-nature pb-2 px-3 pt-1">
                        <span className="font-bold text-xs">Notifications</span>
                        <span className="text-[10px] text-primary hover:underline cursor-pointer" onClick={markNotificationsAsRead}>
                          Mark all read
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-gray-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-2 rounded-xl text-xs hover:bg-bg-nature transition-all border border-transparent ${
                                !n.read ? "bg-primary/5 border-primary/5" : ""
                              }`}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-semibold text-text-charcoal">{n.title}</span>
                                <span className="text-[9px] text-gray-400 shrink-0">{n.time}</span>
                              </div>
                              <p className="text-gray-500 text-[11px] mt-0.5 leading-relaxed">{n.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                  setShowLanguageMenu(false);
                }}
                className="flex items-center gap-1.5 focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8.5 w-8.5 rounded-full object-cover ring-2 ring-primary/20 border border-white hover:ring-primary/50 transition-all duration-200"
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-card-bg border border-border-nature shadow-xl p-2 z-50"
                    >
                      <div className="p-3 border-b border-border-nature">
                        <div className="font-bold text-xs text-text-charcoal leading-none">{currentUser.name}</div>
                        <div className="text-[10px] text-gray-400 mt-1">{currentUser.email}</div>
                        <div className="text-[10px] text-primary font-bold mt-1.5 bg-primary/5 px-2 py-0.5 rounded-full inline-block">
                          {currentUser.role} Profile
                        </div>
                      </div>

                      <div className="p-1.5 space-y-1">
                        <Link 
                          href="/dashboard" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-charcoal rounded-xl hover:bg-bg-nature transition-all"
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <span>My Dashboard</span>
                        </Link>
                        <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-charcoal lg:hidden">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-gray-400" />
                            <span>Wallet</span>
                          </div>
                          <span className="text-primary font-extrabold">₹{currentUser.walletBalance.toLocaleString("en-IN")}</span>
                        </div>
                        <Link 
                          href="/auth" 
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        >
                          <LogOut className="h-4 w-4 text-red-500" />
                          <span>Sign Out / Re-auth</span>
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
