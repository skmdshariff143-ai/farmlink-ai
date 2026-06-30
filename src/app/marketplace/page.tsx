"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import AIChatbot from "@/components/layout/AIChatbot";
import { useFarmStore, CropListing, OrderItem } from "@/store/useFarmStore";
import { 
  Search, SlidersHorizontal, ShoppingCart, Heart, MapPin, 
  MessageSquare, Plus, Minus, X, Check, Award, AlertCircle,
  QrCode, Mic
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function MarketplacePage() {
  const router = useRouter();
  const { 
    listings, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    createOrder,
    createChatRoom,
    currentUser
  } = useFarmStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(300);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"options" | "upi" | "success">("options");
  const [checkoutMethod, setCheckoutMethod] = useState("UPI (GPay)");

  // Price ticker rates
  const mandiRates = [
    { name: "Basmati Rice", rate: "₹65/kg", up: true },
    { name: "Sharbati Wheat", rate: "₹32/kg", up: false },
    { name: "Red Onions", rate: "₹24/kg", up: true },
    { name: "Alphonso Mango", rate: "₹250/kg", up: true },
    { name: "Erode Turmeric", rate: "₹110/kg", up: false }
  ];

  // Filters
  const categories = ["All", "Grains", "Vegetables", "Fruits", "Spices"];
  
  const filteredListings = listings.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.category.toLowerCase().includes(search.toLowerCase()) ||
                          c.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    const matchesPrice = c.price <= maxPrice;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleToggleWishlist = (id: string) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const handleChatWithFarmer = (farmerName: string, avatar: string) => {
    // Create or retrieve chat room, then push to chat page
    const id = createChatRoom(farmerName, "Farmer", avatar);
    router.push(`/chat?id=${id}`);
  };

  const handleAddToCart = (c: CropListing) => {
    const item: OrderItem = {
      listingId: c.id,
      name: c.name,
      price: c.price,
      quantity: 100, // default buy quantity is 100kg
      farmerName: c.farmerName
    };
    addToCart(item);
    // Success feedback confetti!
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const triggerCheckout = () => {
    setIsCheckingOut(true);
    setCheckoutStep("options");
  };

  const handleFinalOrderSubmit = () => {
    if (checkoutMethod === "UPI (GPay)") {
      setCheckoutStep("upi");
      // Simulate confirmation after 4 seconds
      setTimeout(() => {
        createOrder(checkoutMethod);
        setCheckoutStep("success");
        confetti({ particleCount: 150, spread: 80 });
      }, 4000);
    } else {
      createOrder(checkoutMethod);
      setCheckoutStep("success");
      confetti({ particleCount: 150, spread: 80 });
    }
  };

  const categoriesColors: Record<string, string> = {
    Grains: "bg-amber-100 text-amber-800",
    Vegetables: "bg-red-100 text-red-800",
    Fruits: "bg-green-100 text-green-800",
    Spices: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <AIChatbot />

      {/* Mandi Live Price Ticker */}
      <div className="bg-primary/5 border-b border-border-nature py-2.5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-primary shrink-0 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            Live Mandi Index
          </div>
          <div className="flex gap-6 animate-pulse-slow overflow-x-auto no-scrollbar py-0.5">
            {mandiRates.map((mr, idx) => (
              <span key={idx} className="text-xs font-semibold flex items-center gap-1 whitespace-nowrap text-text-charcoal">
                {mr.name}: <span className="font-extrabold">{mr.rate}</span>
                <span className={mr.up ? "text-primary text-[10px] font-black" : "text-red-500 text-[10px] font-black"}>
                  {mr.up ? "▲" : "▼"}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl p-5 shadow-sm space-y-5">
            <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Search & Filters
            </h3>

            {/* Smart Search */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1.5">AI Smart Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Query grains, region, farmer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-border-nature rounded-xl text-xs bg-bg-nature/40 dark:bg-card-bg focus:outline-none focus:ring-1 focus:ring-primary text-text-charcoal"
                />
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-3" />
                <Mic className="h-3.5 w-3.5 text-gray-400 absolute right-3 top-3 hover:text-primary cursor-pointer" />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Crops Classification</label>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat 
                      ? "bg-primary text-white shadow-sm" 
                      : "hover:bg-bg-nature text-text-charcoal"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Price slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>Max Price Index</span>
                <span className="text-primary">₹{maxPrice}/kg</span>
              </div>
              <input
                type="range"
                min={10}
                max={400}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary bg-bg-nature dark:bg-card-bg rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Cart summary widget */}
          {cart.length > 0 && (
            <div className="bg-gradient-to-br from-primary/10 to-secondary/5 rounded-3xl p-5 border border-primary/20 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <ShoppingCart className="h-4 w-4" />
                  Your Crop Cart
                </span>
                <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {cart.length} items
                </span>
              </div>
              <div className="text-sm font-black text-text-charcoal">
                Subtotal: ₹{cartTotal.toLocaleString("en-IN")}
              </div>
              <button
                onClick={() => setShowCartDrawer(true)}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                Checkout Securely
              </button>
            </div>
          )}
        </div>

        {/* Right Product Grid */}
        <div className="lg:col-span-9 space-y-6">
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-text-charcoal">Active Crop Inventory</h2>
              <p className="text-[10px] text-gray-400">Showing {filteredListings.length} certified listings direct from verified farms</p>
            </div>
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative p-2 border border-border-nature rounded-2xl bg-white dark:bg-card-bg text-gray-500 hover:text-primary transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {filteredListings.length === 0 ? (
            <div className="py-20 text-center space-y-4 border border-dashed border-border-nature rounded-3xl bg-white dark:bg-card-bg">
              <AlertCircle className="h-10 w-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-text-charcoal">No Crop Matches Found</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">Try resetting your price filter thresholds or category options.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((crop) => (
                <div
                  key={crop.id}
                  className="bg-white dark:bg-card-bg border border-border-nature rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image block */}
                    <div className="relative aspect-video w-full bg-bg-nature">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={crop.image}
                        alt={crop.name}
                        className="object-cover w-full h-full"
                      />
                      
                      {/* Category tag */}
                      <span className={`absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full ${categoriesColors[crop.category] || "bg-gray-100 text-gray-800"}`}>
                        {crop.category}
                      </span>
                      
                      {/* Wishlist toggle */}
                      <button
                        onClick={() => handleToggleWishlist(crop.id)}
                        className="absolute top-3 right-3 p-1.5 bg-white dark:bg-card-bg rounded-full text-gray-400 hover:text-red-500 shadow-md transition-all"
                      >
                        <Heart className={`h-4 w-4 ${wishlist.includes(crop.id) ? "fill-red-500 text-red-500" : ""}`} />
                      </button>
                    </div>

                    {/* Details block */}
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-text-charcoal truncate">{crop.name}</h4>
                        <span className="flex items-center gap-0.5 text-primary text-[9px] font-black bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/10">
                          <Award className="h-3 w-3 shrink-0" />
                          A+ Grade
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-text-charcoal">₹{crop.price}</span>
                        <span className="text-[10px] text-gray-400">/ kg</span>
                        {crop.originalPrice && (
                          <span className="text-xs text-gray-400 line-through ml-1">₹{crop.originalPrice}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{crop.location} ({crop.distance || "12 km"})</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-border-nature pt-3 mt-1.5">
                        <div className="flex items-center gap-1.5">
                          {/* Farmer Contact info */}
                          <div className="text-[10px]">
                            <div className="font-bold text-text-charcoal truncate max-w-[110px]">{crop.farmerName}</div>
                            <div className="text-primary font-bold text-[9px]">Rating: ★ {crop.rating}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleChatWithFarmer(crop.farmerName, "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80")}
                          className="p-1.5 rounded-xl border border-border-nature hover:bg-primary/5 hover:border-primary text-gray-500 hover:text-primary transition-all"
                          title="Chat with farmer"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add action */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => handleAddToCart(crop)}
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add 100kg to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Cart Drawer Panel Overlay */}
      <AnimatePresence>
        {showCartDrawer && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowCartDrawer(false)} />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-white dark:bg-card-bg border-l border-border-nature shadow-2xl z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-1">
                <div className="flex justify-between items-center border-b border-border-nature pb-4">
                  <h3 className="font-extrabold text-sm text-text-charcoal flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Marketplace Cart
                  </h3>
                  <button onClick={() => setShowCartDrawer(false)} className="p-1.5 rounded-xl bg-bg-nature hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="py-20 text-center text-gray-400 text-xs">
                    Your cart is currently empty.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.listingId} className="p-3 bg-bg-nature/40 dark:bg-card-bg/50 border border-border-nature rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-text-charcoal truncate">{item.name}</h4>
                          <span className="text-[9px] text-gray-400">Seller: {item.farmerName}</span>
                          <div className="text-xs font-bold text-primary mt-1">₹{item.price * item.quantity}</div>
                        </div>

                        {/* Quantity triggers */}
                        <div className="flex items-center gap-2 border border-border-nature rounded-xl p-1 bg-white dark:bg-card-bg">
                          <button
                            onClick={() => updateCartQuantity(item.listingId, Math.max(100, item.quantity - 100))}
                            className="p-1 hover:bg-bg-nature rounded text-gray-400 hover:text-text-charcoal"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-extrabold w-12 text-center text-text-charcoal">{item.quantity} kg</span>
                          <button
                            onClick={() => updateCartQuantity(item.listingId, item.quantity + 100)}
                            className="p-1 hover:bg-bg-nature rounded text-gray-400 hover:text-text-charcoal"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.listingId)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtotal section */}
              {cart.length > 0 && (
                <div className="border-t border-border-nature pt-4 space-y-4 shrink-0 bg-white dark:bg-card-bg">
                  <div className="flex justify-between text-xs font-bold text-text-charcoal">
                    <span>Produce Total:</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Tax & Platform fee:</span>
                    <span>Free Promotion</span>
                  </div>
                  <div className="border-t border-border-nature/50 pt-3 flex justify-between font-black text-sm text-primary">
                    <span>Escrow Pay:</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>

                  <button
                    onClick={triggerCheckout}
                    className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Escrow Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                    <p className="text-[10px] text-gray-400">Funds are held in secure escrow until shipping is completed.</p>
                  </div>

                  <div className="space-y-2">
                    {/* Wallet */}
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

                    {/* UPI */}
                    <div 
                      onClick={() => setCheckoutMethod("UPI (GPay)")}
                      className={`p-3 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                        checkoutMethod === "UPI (GPay)" ? "bg-primary/5 border-primary" : "border-border-nature"
                      }`}
                    >
                      <div className="text-xs">
                        <span className="font-bold text-text-charcoal block">UPI (GPay / PhonePe / Paytm)</span>
                        <span className="text-[9px] text-gray-400">Generates instant dynamic QR code</span>
                      </div>
                      {checkoutMethod === "UPI (GPay)" && <Check className="h-4 w-4 text-primary" />}
                    </div>

                    {/* Cash */}
                    <div 
                      onClick={() => setCheckoutMethod("Cash on Delivery")}
                      className={`p-3 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                        checkoutMethod === "Cash on Delivery" ? "bg-primary/5 border-primary" : "border-border-nature"
                      }`}
                    >
                      <div className="text-xs">
                        <span className="font-bold text-text-charcoal block">Cash on Delivery (COD)</span>
                        <span className="text-[9px] text-gray-400">Pay direct at farm pickup point</span>
                      </div>
                      {checkoutMethod === "Cash on Delivery" && <Check className="h-4 w-4 text-primary" />}
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
                      disabled={checkoutMethod === "Farmlink Wallet" && currentUser.walletBalance < cartTotal}
                      className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover disabled:opacity-50 transition-all"
                    >
                      Confirm (₹{cartTotal.toLocaleString("en-IN")})
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === "upi" && (
                <div className="text-center space-y-4 py-4 flex flex-col items-center">
                  <h3 className="font-bold text-xs text-text-charcoal">Scan QR code using GooglePay/PhonePe</h3>
                  <div className="p-4 bg-white border border-border-nature rounded-2xl shadow-sm">
                    <QrCode className="h-36 w-36 text-text-charcoal" />
                  </div>
                  <div className="text-xs text-primary font-bold animate-pulse">
                    Waiting for UPI server authentication...
                  </div>
                  <p className="text-[10px] text-gray-400">Simulating payment completion. Do not refresh this window.</p>
                </div>
              )}

              {checkoutStep === "success" && (
                <div className="text-center space-y-4 py-4 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 text-primary flex items-center justify-center">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-sm text-text-charcoal">Order Securely Escrowed!</h3>
                  <p className="text-[10px] text-gray-500 max-w-xs leading-relaxed">
                    Transaction successful. Payout is held in Escrow wallet. Logistics booking has been initiated. Let's redirect to track shipment.
                  </p>
                  <button
                    onClick={() => {
                      setIsCheckingOut(false);
                      setShowCartDrawer(false);
                      router.push("/dashboard?tab=orders");
                    }}
                    className="px-6 py-2 bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-bold transition-all"
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
