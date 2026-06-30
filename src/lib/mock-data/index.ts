export interface MockFarm {
  id: string;
  name: string;
  location: string;
  owner: string;
  size: string; // e.g. "5 Hectares"
  rating: number;
  mainCrop: string;
  certifiedOrganic: boolean;
}

export interface MockCrop {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  location: string;
  distance: string;
  farmerName: string;
  rating: number;
  image: string;
  description: string;
}

export interface MockOrder {
  id: string;
  items: string;
  total: number;
  buyerName: string;
  status: "Pending" | "Confirmed" | "In Transit" | "Delivered";
  date: string;
}

export interface MockTransaction {
  id: string;
  type: "Deposit" | "Withdrawal" | "Payment" | "Payout";
  amount: number;
  date: string;
  status: "Success" | "Pending" | "Failed";
  description: string;
}

export const mockFarms: MockFarm[] = [
  { id: "f1", name: "Green Valley Basmati Fields", location: "Karnal, Haryana", owner: "Sukhdev Singh", size: "4.5 Hectares", rating: 4.8, mainCrop: "Basmati Rice", certifiedOrganic: true },
  { id: "f2", name: "Sagar Sharbati Orchards", location: "Sehore, Madhya Pradesh", owner: "Rajesh Patidar", size: "8.0 Hectares", rating: 4.6, mainCrop: "Sharbati Wheat", certifiedOrganic: true },
  { id: "f3", name: "Sahyadri Onion Estates", location: "Nashik, Maharashtra", owner: "Devanand Patil", size: "3.2 Hectares", rating: 4.7, mainCrop: "Red Onions", certifiedOrganic: false },
  { id: "f4", name: "Ratnagiri Alphonso Groves", location: "Ratnagiri, Maharashtra", owner: "Vasant Rao", size: "12 Hectares", rating: 4.9, mainCrop: "Alphonso Mangoes", certifiedOrganic: true }
];

export const mockCrops: MockCrop[] = [
  {
    id: "crop_01",
    name: "Organic Basmati Rice",
    category: "Grains",
    price: 65,
    originalPrice: 72,
    quantity: 1200,
    location: "Karnal, Haryana",
    distance: "12 km",
    farmerName: "Sukhdev Singh",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80",
    description: "Premium long-grain Basmati Rice, cultivated using fully organic compost."
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
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80",
    description: "Lustrous, heavy grains of Sharbati wheat, hand-harvested."
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
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1508747703725-719ae2c73ee0?w=500&auto=format&fit=crop&q=80",
    description: "Pungent Nashik red onions, fully cured with tight skins."
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
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80",
    description: "Naturally ripened Ratnagiri Alphonso mangoes."
  }
];

export const mockOrders: MockOrder[] = [
  { id: "ord_101", items: "Organic Basmati Rice (1200kg)", total: 78000, buyerName: "Reliance Fresh", status: "Delivered", date: "24 June 2026" },
  { id: "ord_102", items: "Red Desi Onions (500kg)", total: 12000, buyerName: "AgroCorp Mandi", status: "In Transit", date: "28 June 2026" },
  { id: "ord_103", items: "Golden Sharbati Wheat (2000kg)", total: 64000, buyerName: "BigBasket Hub", status: "Confirmed", date: "29 June 2026" }
];

export const mockTransactions: MockTransaction[] = [
  { id: "tx_901", type: "Deposit", amount: 15000, date: "20 June 2026", status: "Success", description: "Direct bank transfer deposit" },
  { id: "tx_902", type: "Payout", amount: 78000, date: "25 June 2026", status: "Success", description: "Basmati rice batch payment payout" },
  { id: "tx_903", type: "Withdrawal", amount: 10000, date: "27 June 2026", status: "Success", description: "Mandi cashier cash withdrawal" },
  { id: "tx_904", type: "Payment", amount: 2400, date: "29 June 2026", status: "Pending", description: "Logistics truck booking reservation" }
];
