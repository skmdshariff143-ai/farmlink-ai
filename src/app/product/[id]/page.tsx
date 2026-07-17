"use client";

import React, { useState, Suspense, use } from "react";
import Navbar from "@/components/layout/Navbar";
import AIChatbot from "@/components/layout/AIChatbot";
import { useFarmStore, CropListing, OrderItem } from "@/store/useFarmStore";
import { useSocket } from "@/hooks/useSocket";
import { 
  ArrowLeft, MapPin, Award, ShieldCheck, MessageSquare, 
  ShoppingCart, Heart, QrCode, Check, AlertCircle, Plus, Minus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function ProductDetailContent({ params }: ProductPageProps) {
  const router = useRouter();
  
  // Unwrap promise params
  const { id } = use(params);

  const { 
    listings, 
    addToCart, 
    createOrder,
    createChatRoom,
    currentUser
  } = useFarmStore();

  // Find listing or fallback to crop_01
  const crop = listings.find((c) => c.id === id) || listings[0];
  
  const [qty, setQty] = useState(100); // buy qty starting at 100kg
  const [liked, setLiked] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"options" | "upi" | "success">("options");
  const [checkoutMethod, setCheckoutMethod] = useState("UPI (GPay)");
  const [bidAmountInput, setBidAmountInput] = useState("");

  // Wire up the live bidding Socket.IO hook
  const {
    connected,
    bidTick,
    emitBid,
    bidError,
    rateLimitError,
    clearBidError,
    clearRateLimitError
  } = useSocket(
    id ? { listingId: id, userContext: { id: currentUser.id, name: currentUser.name } } : {}
  );

  const currentPrice = bidTick && bidTick.listingId === crop.id ? bidTick.bidAmount : crop.price;

  if (!crop) {
    return (
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6 text-center text-xs">
        <div className="space-y-3">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h3 className="font-bold text-text-charcoal text-sm">Product Not Found</h3>
          <button onClick={() => router.push("/marketplace")} className="px-4 py-2 bg-primary text-white rounded-xl">
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmountInput);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    emitBid(crop.id, crop.name, amount);
    setBidAmountInput("");
  };

  const handleAddToCart = () => {
    const item: OrderItem = {
      listingId: crop.id,
      name: crop.name,
      price: currentPrice,
      quantity: qty,
      farmerName: crop.farmerName
    };
    addToCart(item);
    confetti({ particleCount: 30, spread: 60 });
    addNotificationLocal("Success! 🎉", `${qty}kg of ${crop.name} added to cart.`);
  };

  const addNotificationLocal = (title: string, body: string) => {
    // Add toast feedback locally
  };

  const handleChat = () => {
    const chatRoomId = createChatRoom(crop.farmerName, "Farmer", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80");
    router.push(`/chat?id=${chatRoomId}`);
  };

  const totalPrice = currentPrice * qty;

  const handleFinalOrderSubmit = () => {
    if (checkoutMethod === "UPI (GPay)") {
      setCheckoutStep("upi");
      setTimeout(() => {
        // Trigger order in Zustand
        const item: OrderItem = {
          listingId: crop.id,
          name: crop.name,
          price: currentPrice,
          quantity: qty,
          farmerName: crop.farmerName
        };
        addToCart(item);
        createOrder(checkoutMethod);
        setCheckoutStep("success");
        confetti({ particleCount: 100, spread: 60 });
      }, 3000);
    } else {
      const item: OrderItem = {
        listingId: crop.id,
        name: crop.name,
        price: currentPrice,
        quantity: qty,
        farmerName: crop.farmerName
      };
      addToCart(item);
      createOrder(checkoutMethod);
      setCheckoutStep("success");
      confetti({ particleCount: 100, spread: 60 });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AIChatbot />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        
        {/* Back Link */}
        <button 
          onClick={() => router.push("/marketplace")}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace catalog
        </button>

        {/* Product Details Card */}
        <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          {/* Left image block */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-bg-nature">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={crop.image}
              alt={crop.name}
              className="object-cover w-full h-full"
            />
            <button
              onClick={() => setLiked(!liked)}
              className="absolute top-3 right-3 p-2 bg-white dark:bg-card-bg rounded-full text-gray-400 hover:text-red-500 shadow-md transition-all"
            >
              <Heart className={`h-4.5 w-4.5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>

          {/* Right text specs block */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                  {crop.category}
                </span>
                <span className="flex items-center gap-0.5 text-primary text-[9px] font-black bg-primary/5 px-2 py-0.5 rounded-md border border-primary/15">
                  <Award className="h-3.5 w-3.5 shrink-0" />
                  A+ Certified Organic
                </span>
              </div>

              <h2 className="text-xl font-black text-text-charcoal leading-tight">{crop.name}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-text-charcoal">₹{currentPrice}</span>
                <span className="text-xs text-gray-400">/ kg</span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">{crop.description}</p>
              
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Harvest Location: {crop.location} ({crop.distance || "12 km"})</span>
              </div>
            </div>

            {/* Buying Action Section */}
            <div className="space-y-4 pt-3 border-t border-border-nature">
              {/* Live Bidding Section */}
              <div className="border border-border-nature rounded-2xl p-4 bg-bg-nature/10 space-y-3">
                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-black">
                  <span className="flex items-center gap-1">🔨 Live Bidding Console</span>
                  <span className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-orange-500"}`} />
                    {connected ? "Live connected" : "Reconnecting..."}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={bidAmountInput}
                    onChange={(e) => setBidAmountInput(e.target.value)}
                    placeholder={`Enter bid (> ₹${currentPrice})`}
                    className="flex-1 px-3 py-2 border border-border-nature rounded-xl text-xs bg-white dark:bg-card-bg text-text-charcoal font-semibold"
                  />
                  <button
                    onClick={handlePlaceBid}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
                  >
                    Place Bid
                  </button>
                </div>

                {bidError && (
                  <div className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-xl flex justify-between items-center border border-red-200">
                    <span>⚠️ {bidError}</span>
                    <button onClick={clearBidError} className="text-red-400 hover:text-red-600">✕</button>
                  </div>
                )}
                
                {rateLimitError && (
                  <div className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-xl flex justify-between items-center border border-red-200">
                    <span>⚠️ {rateLimitError}</span>
                    <button onClick={clearRateLimitError} className="text-red-400 hover:text-red-600">✕</button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">Purchase Volume</span>
                <div className="flex items-center gap-2 border border-border-nature rounded-xl p-1 bg-white dark:bg-card-bg">
                  <button
                    onClick={() => setQty(Math.max(100, qty - 100))}
                    className="p-1 hover:bg-bg-nature rounded text-gray-400 hover:text-text-charcoal"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-black w-14 text-center text-text-charcoal">{qty} kg</span>
                  <button
                    onClick={() => setQty(qty + 100)}
                    className="p-1 hover:bg-bg-nature rounded text-gray-400 hover:text-text-charcoal"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline text-xs font-bold text-text-charcoal">
                <span>Contract Total:</span>
                <span className="text-lg font-black text-primary">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleChat}
                  className="py-2.5 border border-border-nature hover:border-primary hover:text-primary rounded-xl text-xs font-bold text-gray-500 transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="h-4 w-4" />
                  Bargain price
                </button>
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Checkout Dialog Overlay */}
      <AnimatePresence>
        {isCheckingOut && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent" />
              
              {checkoutStep === "options" && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="font-extrabold text-sm text-text-charcoal">Select Escrow Payment</h3>
                  </div>
                  {process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-[10px] text-center font-bold">
                      ℹ️ Demo mode — payments are simulated, no real transactions occur.
                    </div>
                  )}

                  <div className="space-y-2">
                    <div 
                      onClick={() => setCheckoutMethod("Farmlink Wallet")}
                      className={`p-3 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                        checkoutMethod === "Farmlink Wallet" ? "bg-primary/5 border-primary" : "border-border-nature"
                      }`}
                    >
                      <div className="text-xs">
                        <span className="font-bold text-text-charcoal block">Farmlink Escrow Wallet</span>
                        <span className="text-[9px] text-gray-400">Balance: ₹{currentUser.walletBalance.toLocaleString("en-IN")}</span>
                      </div>
                      {checkoutMethod === "Farmlink Wallet" && <Check className="h-4 w-4 text-primary" />}
                    </div>

                    <div 
                      onClick={() => setCheckoutMethod("UPI (GPay)")}
                      className={`p-3 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                        checkoutMethod === "UPI (GPay)" ? "bg-primary/5 border-primary" : "border-border-nature"
                      }`}
                    >
                      <div className="text-xs">
                        <span className="font-bold text-text-charcoal block">UPI (GPay / PhonePe)</span>
                      </div>
                      {checkoutMethod === "UPI (GPay)" && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="flex-1 py-2.5 border border-border-nature rounded-xl text-xs font-bold text-gray-400 hover:bg-bg-nature transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFinalOrderSubmit}
                      className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold"
                    >
                      Confirm (₹{totalPrice.toLocaleString("en-IN")})
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === "upi" && (
                <div className="text-center space-y-4 py-4 flex flex-col items-center">
                  <h3 className="font-bold text-xs text-text-charcoal">Scan QR code using GPay</h3>
                  <div className="p-4 bg-white border border-border-nature rounded-2xl shadow-sm">
                    <QrCode className="h-32 w-32 text-text-charcoal" />
                  </div>
                  <div className="text-xs text-primary font-bold animate-pulse">
                    Waiting for UPI server authentication...
                  </div>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="text-center space-y-4 py-4 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 text-primary flex items-center justify-center">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-sm text-text-charcoal">Order Securely Escrowed!</h3>
                  <button
                    onClick={() => {
                      setIsCheckingOut(false);
                      router.push("/buyer?tab=orders");
                    }}
                    className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold"
                  >
                    Track Order
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-nature flex items-center justify-center p-6">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
