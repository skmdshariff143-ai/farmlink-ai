import { create } from "zustand";
import { persist } from "zustand/middleware";

// Roles
export type UserRole = "Farmer" | "Buyer" | "Transport" | "Warehouse" | "Admin";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar: string;
  location: string;
  walletBalance: number;
}

export interface CropListing {
  id: string;
  name: string;
  category: string;
  price: number; // per kg
  originalPrice?: number;
  quantity: number; // in kg
  location: string;
  distance?: string;
  farmerName: string;
  farmerId: string;
  rating: number;
  image: string;
  description: string;
  status: "Available" | "Sold Out";
  createdAt: string;
}

export interface OrderItem {
  listingId: string;
  name: string;
  price: number;
  quantity: number;
  farmerName: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  buyerName: string;
  buyerId: string;
  status: "Pending" | "Confirmed" | "In Transit" | "Delivered";
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  trackingStep: number; // 0: ordered, 1: packed, 2: transit, 3: completed
  deliveryDate: string;
  createdAt: string;
}

export interface TransportBooking {
  id: string;
  driverName: string;
  vehicleNo: string;
  vehicleType: string;
  route: string;
  price: number;
  status: "Assigned" | "In Transit" | "Completed";
  date: string;
}

export interface WarehouseBooking {
  id: string;
  warehouseName: string;
  type: "Cold Storage" | "Dry Storage";
  capacity: number; // tons
  price: number; // per month
  status: "Booked" | "Completed";
  startDate: string;
  duration: number; // months
}

export interface GovernmentScheme {
  id: string;
  title: string;
  description: string;
  subsidy: string;
  eligibility: string;
  enrolled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  unlocked: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  image?: string;
  audio?: boolean;
}

export interface ChatRoom {
  id: string;
  participantName: string;
  participantRole: string;
  participantAvatar: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastActive: string;
  online: boolean;
}

export interface FarmNotification {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  time: string;
  read: boolean;
}

interface FarmState {
  // Session / Profile
  currentUser: UserProfile;
  isAuthenticated: boolean;
  setCurrentUser: (user: UserProfile) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;

  // Marketplace
  listings: CropListing[];
  addListing: (listing: Omit<CropListing, "id" | "createdAt" | "status">) => void;
  updateListingStock: (id: string, newQty: number) => void;
  syncListings: (listings: CropListing[]) => void;

  // Cart
  cart: OrderItem[];
  addToCart: (item: OrderItem) => void;
  removeFromCart: (listingId: string) => void;
  updateCartQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;

  // Orders
  orders: Order[];
  createOrder: (paymentMethod: string) => void;
  updateOrderStatus: (id: string, status: Order["status"], step: number) => void;
  syncOrders: (orders: Order[]) => void;

  // Bookings
  transportBookings: TransportBooking[];
  addTransportBooking: (booking: Omit<TransportBooking, "id" | "status">) => void;
  updateTransportStatus: (id: string, status: TransportBooking["status"]) => void;

  warehouseBookings: WarehouseBooking[];
  addWarehouseBooking: (booking: Omit<WarehouseBooking, "id" | "status">) => void;

  // Chat
  chatRooms: ChatRoom[];
  addMessage: (roomId: string, senderId: string, senderName: string, text: string, image?: string, audio?: boolean) => void;
  createChatRoom: (name: string, role: string, avatar: string) => string;

  // Notifications
  notifications: FarmNotification[];
  addNotification: (title: string, body: string, type: FarmNotification["type"]) => void;
  markNotificationsAsRead: () => void;

  // Schemes
  schemes: GovernmentScheme[];
  enrollInScheme: (id: string) => void;

  // Gamification
  dailyRewardClaimed: boolean;
  claimDailyReward: () => void;
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  referralsCount: number;
  referralCode: string;
  addReferral: () => void;
}

const defaultUser: UserProfile = {
  id: "user_01",
  name: "Ram Singh",
  phone: "+91 98765 43210",
  email: "ram.singh@farmlink.ai",
  role: "Farmer",
  avatar: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80",
  location: "Warangal, Telangana",
  walletBalance: 12450.0,
};

const defaultListings: CropListing[] = [
  {
    id: "crop_01",
    name: "Organic Basmati Rice",
    category: "Grains",
    price: 65, // Rs. per kg
    originalPrice: 72,
    quantity: 1200,
    location: "Karnal, Haryana",
    distance: "12 km",
    farmerName: "Sukhdev Singh",
    farmerId: "user_sukhdev",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80",
    description: "Premium long-grain Basmati Rice, cultivated using fully organic compost. Excellent aroma and non-sticky cooking profile.",
    status: "Available",
    createdAt: "2026-06-28T10:00:00Z",
  },
  {
    id: "crop_02",
    name: "Golden Sharbati Wheat",
    category: "Grains",
    price: 32,
    originalPrice: 35,
    quantity: 4500,
    location: "Sehore, Madhya Pradesh",
    distance: "25 km",
    farmerName: "Rajesh Patidar",
    farmerId: "user_rajesh",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80",
    description: "Lustrous, heavy grains of Sharbati wheat, hand-harvested and dried under sun. Rich in protein content.",
    status: "Available",
    createdAt: "2026-06-29T11:30:00Z",
  },
  {
    id: "crop_03",
    name: "Red Desi Onions",
    category: "Vegetables",
    price: 24,
    originalPrice: 28,
    quantity: 3000,
    location: "Nashik, Maharashtra",
    distance: "8 km",
    farmerName: "Devanand Patil",
    farmerId: "user_devanand",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1508747703725-719ae2c73ee0?w=500&auto=format&fit=crop&q=80",
    description: "Pungent Nashik red onions, fully cured with tight papery skins. Excellent storage life up to 3 months.",
    status: "Available",
    createdAt: "2026-06-29T14:15:00Z",
  },
  {
    id: "crop_04",
    name: "Premium Alphonso Mangoes",
    category: "Fruits",
    price: 250,
    originalPrice: 300,
    quantity: 350,
    location: "Ratnagiri, Maharashtra",
    distance: "42 km",
    farmerName: "Vasant Rao",
    farmerId: "user_vasant",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80",
    description: "Direct-from-orchard Ratnagiri Alphonso. Naturally ripened in straw beds, extremely sweet with rich saffron-colored pulp.",
    status: "Available",
    createdAt: "2026-06-30T01:00:00Z",
  },
  {
    id: "crop_05",
    name: "Organic Turmeric Bulbs",
    category: "Spices",
    price: 110,
    quantity: 800,
    location: "Erode, Tamil Nadu",
    distance: "18 km",
    farmerName: "Karthik Raja",
    farmerId: "user_karthik",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80",
    description: "Erode variety turmeric bulbs with high curcumin content (above 4.5%). Fully washed, dried, and graded.",
    status: "Available",
    createdAt: "2026-06-27T08:20:00Z",
  },
];

const defaultSchemes: GovernmentScheme[] = [
  {
    id: "sch_01",
    title: "PM-KISAN Samman Nidhi",
    description: "Direct income support of ₹6,000 per year in three equal installments to small agricultural families.",
    subsidy: "₹6,000 / year direct benefit transfer",
    eligibility: "Landholding farmers with cultivable land up to 2 hectares.",
    enrolled: true,
  },
  {
    id: "sch_02",
    title: "PM Fasal Bima Yojana (PMFBY)",
    description: "Yield-based crop insurance scheme covering risks from pre-sowing to post-harvest natural disasters.",
    subsidy: "Low premium of 1.5% to 2% for farmers, rest borne by Government",
    eligibility: "All farmers growing notified crops in notified areas.",
    enrolled: false,
  },
  {
    id: "sch_03",
    title: "National Solar Pump Scheme (PM-KUSUM)",
    description: "Installation of solar pumps and grid-connected solar power plants to secure irrigation energy independence.",
    subsidy: "60% government subsidy (30% State + 30% Center)",
    eligibility: "Individual farmers, groups, cooperatives, water user associations.",
    enrolled: false,
  },
];

const defaultAchievements: Achievement[] = [
  {
    id: "ach_01",
    title: "First Listing",
    description: "Upload your first crop listing on the marketplace.",
    xp: 100,
    icon: "🌱",
    unlocked: true,
  },
  {
    id: "ach_02",
    title: "Bumper Harvest",
    description: "Earn more than ₹50,000 through direct crop orders.",
    xp: 500,
    icon: "🚜",
    unlocked: false,
  },
  {
    id: "ach_03",
    title: "AI Innovator",
    description: "Use the AI Crop Health scanner or AI Price Predictor 5 times.",
    xp: 250,
    icon: "🤖",
    unlocked: false,
  },
  {
    id: "ach_04",
    title: "Green Deliveries",
    description: "Complete 10 successful carbon-offset bookings.",
    xp: 300,
    icon: "🚚",
    unlocked: false,
  },
];

const defaultChatRooms: ChatRoom[] = [
  {
    id: "chat_01",
    participantName: "AgroCorp Procurement (Nikhil)",
    participantRole: "Buyer",
    participantAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    messages: [
      {
        id: "m1",
        senderId: "user_nikhil",
        senderName: "AgroCorp Procurement",
        text: "Greetings Ram! We are interested in purchasing 1000kg of your Organic Basmati Rice. Is the price negotiable if we arrange our own logistics?",
        timestamp: "09:15 AM",
      },
      {
        id: "m2",
        senderId: "user_01",
        senderName: "Ram Singh",
        text: "Namaste Nikhil. Yes, if you pick it up directly from our farm store, I can offer a discount of ₹3 per kg.",
        timestamp: "09:20 AM",
      },
    ],
    lastMessage: "Namaste Nikhil. Yes, if you pick it up directly...",
    lastActive: "09:20 AM",
    online: true,
  },
  {
    id: "chat_02",
    participantName: "Express Logistics (Harpreet)",
    participantRole: "Transport",
    participantAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    messages: [
      {
        id: "t1",
        senderId: "user_harpreet",
        senderName: "Express Logistics",
        text: "Hi, I have assigned a 5-ton truck for your grain pickup tomorrow. Will the roads handle the vehicle width?",
        timestamp: "Yesterday",
      },
    ],
    lastMessage: "Hi, I have assigned a 5-ton truck...",
    lastActive: "Yesterday",
    online: false,
  },
];

const defaultNotifications: FarmNotification[] = [
  {
    id: "not_01",
    title: "Market Price Alert 📈",
    body: "Basmati rice prices increased by ₹4/kg in your local mandi today. Update your listing to maximize profits!",
    type: "success",
    time: "10 mins ago",
    read: false,
  },
  {
    id: "not_02",
    title: "Weather Warning ⛈️",
    body: "Heavy thunder showers predicted in Warangal for tomorrow. Protect your harvested yield in dry storage.",
    type: "warning",
    time: "2 hours ago",
    read: false,
  },
];

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      currentUser: defaultUser,
      isAuthenticated: true,
      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: true }),
      updateProfile: (profile) =>
        set((state) => ({
          currentUser: { ...state.currentUser, ...profile },
        })),
      setRole: (role) =>
        set((state) => {
          let updatedBalance = state.currentUser.walletBalance;
          let updatedName = state.currentUser.name;
          let updatedAvatar = state.currentUser.avatar;
          let updatedLocation = state.currentUser.location;

          // Switch identities nicely for demonstration
          if (role === "Farmer") {
            updatedName = "Ram Singh";
            updatedAvatar = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80";
            updatedLocation = "Warangal, Telangana";
            updatedBalance = 12450.0;
          } else if (role === "Buyer") {
            updatedName = "Reliance Fresh Retail";
            updatedAvatar = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80";
            updatedLocation = "Mumbai, Maharashtra";
            updatedBalance = 150000.0;
          } else if (role === "Transport") {
            updatedName = "Devender Logistics";
            updatedAvatar = "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80";
            updatedLocation = "Indore, Madhya Pradesh";
            updatedBalance = 4200.0;
          } else if (role === "Warehouse") {
            updatedName = "Apex Agri Cold Storage";
            updatedAvatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80";
            updatedLocation = "Karnal, Haryana";
            updatedBalance = 24500.0;
          } else if (role === "Admin") {
            updatedName = "Super Admin Team";
            updatedAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";
            updatedLocation = "New Delhi, India";
            updatedBalance = 99999.0;
          }

          return {
            currentUser: {
              ...state.currentUser,
              role,
              name: updatedName,
              avatar: updatedAvatar,
              location: updatedLocation,
              walletBalance: updatedBalance,
            },
          };
        }),
      logout: () => set({ isAuthenticated: false }),

      // Listings
      listings: defaultListings,
      addListing: (listing) =>
        set((state) => {
          const newListing: CropListing = {
            ...listing,
            id: `crop_${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: "Available",
          };
          return {
            listings: [newListing, ...state.listings],
          };
        }),
      updateListingStock: (id, newQty) =>
        set((state) => ({
          listings: state.listings.map((l) =>
            l.id === id
              ? { ...l, quantity: newQty, status: newQty <= 0 ? "Sold Out" : "Available" }
              : l
          ),
        })),
      syncListings: (listings) => set({ listings }),

      // Cart
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existingIdx = state.cart.findIndex((c) => c.listingId === item.listingId);
          if (existingIdx > -1) {
            const updated = [...state.cart];
            updated[existingIdx].quantity += item.quantity;
            return { cart: updated };
          }
          return { cart: [...state.cart, item] };
        }),
      removeFromCart: (listingId) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.listingId !== listingId),
        })),
      updateCartQuantity: (listingId, quantity) =>
        set((state) => ({
          cart: state.cart.map((c) => (c.listingId === listingId ? { ...c, quantity } : c)),
        })),
      clearCart: () => set({ cart: [] }),

      // Orders
      orders: [
        {
          id: "ord_101",
          items: [
            {
              listingId: "crop_05",
              name: "Organic Turmeric Bulbs",
              price: 110,
              quantity: 200,
              farmerName: "Karthik Raja",
            },
          ],
          total: 22000,
          buyerName: "Reliance Fresh Retail",
          buyerId: "user_01",
          status: "Confirmed",
          paymentMethod: "UPI (GPay)",
          paymentStatus: "Paid",
          trackingStep: 1,
          deliveryDate: "03 July 2026",
          createdAt: "2026-06-29T10:00:00Z",
        },
      ],
      createOrder: (paymentMethod) =>
        set((state) => {
          if (state.cart.length === 0) return {};
          const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

          const newOrder: Order = {
            id: `ord_${Date.now().toString().slice(-6)}`,
            items: state.cart,
            total,
            buyerId: state.currentUser.id,
            buyerName: state.currentUser.name,
            status: "Pending",
            paymentMethod,
            paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
            trackingStep: 0,
            deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            createdAt: new Date().toISOString(),
          };

          // Subtract wallet balance if paid via wallet
          let newBalance = state.currentUser.walletBalance;
          if (paymentMethod === "Farmlink Wallet" && newBalance >= total) {
            newBalance -= total;
          }

          // Trigger achievement tracking
          const isAIInnovator = state.achievements.find((a) => a.id === "ach_02");

          return {
            orders: [newOrder, ...state.orders],
            cart: [],
            currentUser: {
              ...state.currentUser,
              walletBalance: newBalance,
            },
          };
        }),
      updateOrderStatus: (id, status, step) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status, trackingStep: step } : o
          ),
        })),
      syncOrders: (orders) => set({ orders }),

      // Bookings
      transportBookings: [
        {
          id: "tr_01",
          driverName: "Sandeep Kumar",
          vehicleNo: "HR 38 YT 4589",
          vehicleType: "Tata Ace (1.5 Ton)",
          route: "Warangal to Hyderabad Mandi",
          price: 2400,
          status: "In Transit",
          date: "30 June 2026",
        },
      ],
      addTransportBooking: (booking) =>
        set((state) => {
          const newBooking: TransportBooking = {
            ...booking,
            id: `tr_${Date.now().toString().slice(-4)}`,
            status: "Assigned",
          };
          return {
            transportBookings: [newBooking, ...state.transportBookings],
          };
        }),
      updateTransportStatus: (id, status) =>
        set((state) => ({
          transportBookings: state.transportBookings.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
        })),

      warehouseBookings: [
        {
          id: "wh_01",
          warehouseName: "Apex Cold Storage (A1)",
          type: "Cold Storage",
          capacity: 10,
          price: 4500,
          status: "Booked",
          startDate: "01 July 2026",
          duration: 3,
        },
      ],
      addWarehouseBooking: (booking) =>
        set((state) => {
          const newWHBooking: WarehouseBooking = {
            ...booking,
            id: `wh_${Date.now().toString().slice(-4)}`,
            status: "Booked",
          };
          return {
            warehouseBookings: [newWHBooking, ...state.warehouseBookings],
          };
        }),

      // Chat
      chatRooms: defaultChatRooms,
      addMessage: (roomId, senderId, senderName, text, image, audio) =>
        set((state) => {
          const updatedRooms = state.chatRooms.map((room) => {
            if (room.id === roomId) {
              const newMsg: ChatMessage = {
                id: `msg_${Date.now()}`,
                senderId,
                senderName,
                text: image ? "Attached an image" : audio ? "Sent a voice message" : text,
                timestamp: new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                image,
                audio,
              };

              // If it's a text message and sent by user, queue a simulator reply
              return {
                ...room,
                messages: [...room.messages, newMsg],
                lastMessage: newMsg.text,
                lastActive: newMsg.timestamp,
              };
            }
            return room;
          });
          return { chatRooms: updatedRooms };
        }),
      createChatRoom: (name, role, avatar) => {
        const id = `chat_${Date.now()}`;
        set((state) => {
          const exists = state.chatRooms.find((r) => r.participantName === name);
          if (exists) return {}; // already exists

          const newRoom: ChatRoom = {
            id,
            participantName: name,
            participantRole: role,
            participantAvatar: avatar,
            messages: [],
            lastMessage: "Chat started",
            lastActive: "Just now",
            online: true,
          };
          return {
            chatRooms: [newRoom, ...state.chatRooms],
          };
        });
        return id;
      },

      // Notifications
      notifications: defaultNotifications,
      addNotification: (title, body, type) =>
        set((state) => {
          const newNot: FarmNotification = {
            id: `not_${Date.now()}`,
            title,
            body,
            type,
            time: "Just now",
            read: false,
          };
          return {
            notifications: [newNot, ...state.notifications],
          };
        }),
      markNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      // Schemes
      schemes: defaultSchemes,
      enrollInScheme: (id) =>
        set((state) => ({
          schemes: state.schemes.map((s) => (s.id === id ? { ...s, enrolled: true } : s)),
        })),

      // Gamification
      dailyRewardClaimed: false,
      claimDailyReward: () =>
        set((state) => {
          if (state.dailyRewardClaimed) return {};
          const reward = 150.0; // ₹150 daily incentive
          const newBalance = state.currentUser.walletBalance + reward;

          return {
            dailyRewardClaimed: true,
            currentUser: {
              ...state.currentUser,
              walletBalance: newBalance,
            },
          };
        }),
      achievements: defaultAchievements,
      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.map((a) => (a.id === id ? { ...a, unlocked: true } : a)),
        })),
      referralsCount: 4,
      referralCode: "FL-RAM-782",
      addReferral: () =>
        set((state) => {
          const newCount = state.referralsCount + 1;
          const incentive = 250.0; // ₹250 per referral
          const newBalance = state.currentUser.walletBalance + incentive;
          return {
            referralsCount: newCount,
            currentUser: {
              ...state.currentUser,
              walletBalance: newBalance,
            },
          };
        }),
    }),
    {
      name: "farmlink-store-v2",
    }
  )
);
