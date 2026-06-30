"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, X, Send, Mic, Volume2, VolumeX, Sparkles, 
  TrendingUp, ScanEye, UserCheck, Languages, ArrowRight, PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  isAudio?: boolean;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "bot", text: "Namaste! I am FarmLink AI assistant. How can I help you increase yield or find buyers today?" }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, scanResult, isScanning]);

  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Find regional languages support if possible
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (textToSend?: string) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: "user" as const, text: msg }];
    setMessages(newMessages);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      let replyText = "I have recorded your request. Let me analyze that for you.";
      
      const lower = msg.toLowerCase();
      if (lower.includes("price") || lower.includes("predict")) {
        replyText = "🌾 [AI Price Predictor]: Market trends indicate Basmati Rice demand will grow by 12% next month. Current Mandi prices are ₹65/kg, predicted to hit ₹72/kg by third week. Harvest and store now, sell in late July.";
      } else if (lower.includes("disease") || lower.includes("leaf") || lower.includes("scan")) {
        replyText = "🍃 [AI Disease Diagnosis]: Please click the 'Leaf Scan' button to upload a leaf photograph. I will scan for Potato Blight, Rice Blast, and Rust.";
      } else if (lower.includes("buyer") || lower.includes("sell")) {
        replyText = "🤝 [AI Buyer Match]: I have identified 3 certified bulk buyers near Warangal matching your basmati rice: 1) Reliance Fresh (Mumbai) - 1.2 tons at ₹68/kg, 2) AgroCorp Procurement - 2 tons at ₹66/kg. You can chat with them directly!";
      } else if (lower.includes("weather") || lower.includes("rain")) {
        replyText = "⛈️ [AI Weather Suggestion]: Thunderstorms predicted in your area on July 2nd. Suggest delaying wheat fertilizer sprays until July 4th to prevent nutrient runoff.";
      } else if (lower.includes("scheme") || lower.includes("loan")) {
        replyText = "🏛️ [AI Scheme Match]: Based on your profile, you are eligible for the solar pump subsidy (PM-KUSUM) covering 60% of purchase costs. You can apply in the Government Schemes section on your dashboard.";
      }

      setMessages(prev => [...prev, { sender: "bot" as const, text: replyText }]);
      speakText(replyText);
    }, 1000);
  };

  // Simulate Voice Command
  const startVoiceSimulation = () => {
    setIsRecording(true);
    setInputMessage("Recording voice command...");
    
    setTimeout(() => {
      setIsRecording(false);
      const voiceInputs = [
        "What is the predicted price of Rice next week?",
        "Find nearby transport trucks for Hyderabad",
        "Scan leaf disease on tomato plant",
        "Tell me about solar pump schemes"
      ];
      const randomInput = voiceInputs[Math.floor(Math.random() * voiceInputs.length)];
      setInputMessage(randomInput);
    }, 2000);
  };

  // Simulate leaf scan upload
  const handleLeafScan = (diseaseType: string) => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      if (diseaseType === "tomato") {
        setScanResult(JSON.stringify({
          crop: "Tomato",
          disease: "Early Blight (Alternaria solani)",
          confidence: "94.8%",
          remedy: "Spray Copper Fungicide. Remove infected lower leaves immediately. Avoid overhead watering to reduce foliage humidity.",
          product: "BioShield Organic Fungicide (₹320) - Available in marketplace."
        }));
      } else {
        setScanResult(JSON.stringify({
          crop: "Rice / Paddy",
          disease: "Rice Blast (Magnaporthe oryzae)",
          confidence: "88.2%",
          remedy: "Ensure balanced nitrogen fertilizers. Flood fields slightly deeper to suppress fungal spores. Apply Tricyclazole spray.",
          product: "CropProtect BlastShield (₹450) - Available in marketplace."
        }));
      }
    }, 3000);
  };

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30 focus:outline-none"
        >
          <Bot className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white ring-2 ring-white">
            AI
          </span>
        </motion.button>
      </div>

      {/* Chat Window Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-24 right-6 w-[360px] sm:w-[400px] h-[520px] rounded-3xl border border-border-nature bg-card-bg/95 dark:bg-card-bg/90 shadow-2xl z-50 overflow-hidden flex flex-col glass"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1">
                    FarmLink Smart AI <Sparkles className="h-3 w-3 text-accent animate-pulse-slow" />
                  </h3>
                  <p className="text-[10px] text-green-100">Regional Voice Assistant Active</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-1.5 rounded-lg hover:bg-white/20 transition-all ${ttsEnabled ? "bg-white/20" : ""}`}
                  title="Text to Speech Reader"
                >
                  {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 opacity-70" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompts Container */}
            <div className="px-3 py-2 border-b border-border-nature/50 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-bg-nature/30">
              <button 
                onClick={() => handleSendMessage("Predict price of Basmati Rice")}
                className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-card-bg border border-border-nature rounded-full text-[10px] font-bold text-gray-500 hover:text-primary whitespace-nowrap transition-all"
              >
                <TrendingUp className="h-3 w-3 text-primary" />
                Price Forecast
              </button>
              <button 
                onClick={() => handleSendMessage("Find bulk buyers for wheat")}
                className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-card-bg border border-border-nature rounded-full text-[10px] font-bold text-gray-500 hover:text-primary whitespace-nowrap transition-all"
              >
                <UserCheck className="h-3 w-3 text-primary" />
                Find Buyers
              </button>
              <button 
                onClick={() => handleSendMessage("Suggest weather instructions for harvesting")}
                className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-card-bg border border-border-nature rounded-full text-[10px] font-bold text-gray-500 hover:text-primary whitespace-nowrap transition-all"
              >
                <Sparkles className="h-3 w-3 text-primary" />
                Harvest Tip
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div 
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      m.sender === "user"
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white dark:bg-card-bg text-text-charcoal border border-border-nature rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* AI Leaf Scan portal */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-3 text-xs">
                <div className="font-bold flex items-center gap-1 text-primary text-[11px] mb-1.5">
                  <ScanEye className="h-3.5 w-3.5" />
                  AI Crop Health Diagnostics
                </div>
                <p className="text-[10px] text-gray-500 mb-2">Simulate scanning crop leaf disease by choosing a mock crop sample below:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLeafScan("tomato")}
                    className="flex-1 py-1 px-2 bg-white dark:bg-card-bg border border-border-nature hover:border-primary rounded-xl text-[10px] font-semibold text-center text-text-charcoal transition-all"
                  >
                    🍅 Tomato Blight
                  </button>
                  <button
                    onClick={() => handleLeafScan("rice")}
                    className="flex-1 py-1 px-2 bg-white dark:bg-card-bg border border-border-nature hover:border-primary rounded-xl text-[10px] font-semibold text-center text-text-charcoal transition-all"
                  >
                    🌾 Rice Blast
                  </button>
                </div>
              </div>

              {/* Scan Loader */}
              {isScanning && (
                <div className="bg-white dark:bg-card-bg border border-border-nature rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
                  <div className="h-10 w-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                  <div className="text-[10px] font-bold text-gray-500 animate-pulse">
                    AI Lens scanning cellular structure...
                  </div>
                </div>
              )}

              {/* Scan Results Card */}
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-card-bg border border-accent rounded-2xl p-3.5 shadow-sm space-y-2"
                >
                  {(() => {
                    const data = JSON.parse(scanResult);
                    return (
                      <>
                        <div className="flex justify-between items-center border-b border-border-nature pb-1.5">
                          <span className="font-bold text-xs text-primary">{data.crop} Report</span>
                          <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            Confidence: {data.confidence}
                          </span>
                        </div>
                        <div className="text-[11px] font-extrabold text-red-600">
                          Disease: {data.disease}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          <strong>AI Recommendation:</strong> {data.remedy}
                        </p>
                        <div className="pt-1.5 border-t border-border-nature text-[10px] font-semibold text-primary flex items-center justify-between">
                          <span>{data.product}</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border-nature/50 bg-white/50 dark:bg-card-bg/50 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={startVoiceSimulation}
                  className={`p-2 rounded-full transition-all shrink-0 ${
                    isRecording 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-gray-100 hover:bg-primary/10 text-gray-500 hover:text-primary"
                  }`}
                  title="Simulate Voice Input"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  placeholder={isRecording ? "Listening to query..." : "Ask AI chatbot..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isRecording}
                  className="flex-1 bg-bg-nature/50 dark:bg-card-bg/20 border border-border-nature rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-text-charcoal"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  className="p-2 rounded-full bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-all shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="text-[9px] text-gray-400 text-center mt-1.5 flex items-center justify-center gap-1">
                <Languages className="h-3 w-3" />
                Supports English, Telugu, Hindi, Tamil, Kannada, Marathi & Punjabi
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
