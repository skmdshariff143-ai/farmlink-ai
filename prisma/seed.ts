import { PrismaClient, Role, ListingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

/*
 * ==============================================================================
 * ⚠️ LOUD WARNING: DANGER ZONE ⚠️
 * ==============================================================================
 * THIS SEED SCRIPT IS FOR DEVELOPMENT AND TESTING ONLY!
 * RUNNING THIS SCRIPT WILL OVERWRITE OR ADD DATA TO YOUR DATABASE.
 * NEVER, UNDER ANY CIRCUMSTANCES, RUN THIS SCRIPT AGAINST A PRODUCTION DATABASE.
 * ==============================================================================
 */

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed with mock/fake data...");

  // Clean existing tables to prevent duplicate key errors
  await prisma.bid.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cropListing.deleteMany();
  await prisma.user.deleteMany();

  // Create hashed passwords
  const devPasswordHash = await bcrypt.hash("devpassword123", 12);

  // 1. Seed Users (Farmers and Buyers)
  const farmer1 = await prisma.user.create({
    data: {
      name: "Ramesh Kumar (Fake Farmer)",
      phone: "+919876543210",
      email: "ramesh.fake.farmer@example.com",
      password: devPasswordHash,
      role: Role.FARMER,
      location: "Ludhiana, Punjab",
      walletBalance: 15000.0,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    }
  });

  const farmer2 = await prisma.user.create({
    data: {
      name: "Savitri Devi (Fake Farmer)",
      phone: "+919876543211",
      email: "savitri.fake.farmer@example.com",
      password: devPasswordHash,
      role: Role.FARMER,
      location: "Nashik, Maharashtra",
      walletBalance: 22000.0,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
    }
  });

  const buyer1 = await prisma.user.create({
    data: {
      name: "Big Retail Corp (Fake Buyer)",
      phone: "+919876543212",
      email: "buyer.retail.corp@example.com",
      password: devPasswordHash,
      role: Role.BUYER,
      location: "New Delhi, Delhi",
      walletBalance: 500000.0,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    }
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: "Local Mandi Agent (Fake Buyer)",
      phone: "+919876543213",
      email: "buyer.local.mandi@example.com",
      password: devPasswordHash,
      role: Role.BUYER,
      location: "Pune, Maharashtra",
      walletBalance: 85000.0,
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"
    }
  });

  await prisma.user.create({
    data: {
      name: "Farmlink Admin (Fake)",
      phone: "+919876543214",
      email: "admin.farmlink@example.com",
      password: devPasswordHash,
      role: Role.ADMIN,
      location: "Bangalore, Karnataka",
      walletBalance: 0.0
    }
  });

  console.log("✓ Seeded Users (Farmers, Buyers, Admin)");

  // 2. Seed Crop Listings
  const listing1 = await prisma.cropListing.create({
    data: {
      name: "Organic Basmati Paddy",
      category: "Grains",
      price: 65.5,
      quantity: 5000,
      location: "Ludhiana, Punjab",
      farmerId: farmer1.id,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
      description: "Premium grade long grain basmati rice paddy, organic certified.",
      status: ListingStatus.AVAILABLE
    }
  });

  await prisma.cropListing.create({
    data: {
      name: "Fresh Red Onions",
      category: "Vegetables",
      price: 24.0,
      quantity: 12000,
      location: "Nashik, Maharashtra",
      farmerId: farmer2.id,
      image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400",
      description: "Harvested fresh, dry onion bulbs, medium sizes, ideal for transport.",
      status: ListingStatus.AVAILABLE
    }
  });

  await prisma.cropListing.create({
    data: {
      name: "Alphonso Mangoes",
      category: "Fruits",
      price: 180.0,
      quantity: 2000,
      location: "Ratnagiri, Maharashtra",
      farmerId: farmer2.id,
      image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
      description: "Export quality Ratnagiri Alphonso mangoes, handpicked box packs.",
      status: ListingStatus.AVAILABLE
    }
  });

  console.log("✓ Seeded Crop Listings");

  // 3. Seed Bids
  await prisma.bid.create({
    data: {
      listingId: listing1.id,
      bidderId: buyer1.id,
      bidderName: buyer1.name,
      amount: 67.0
    }
  });

  await prisma.bid.create({
    data: {
      listingId: listing1.id,
      bidderId: buyer2.id,
      bidderName: buyer2.name,
      amount: 68.5
    }
  });

  console.log("✓ Seeded Crop Bids");

  // 4. Seed Chat Rooms & Messages
  const chatRoom = await prisma.chatRoom.create({
    data: {
      id: "room-farmer1-buyer1",
      participantA: farmer1.id,
      participantB: buyer1.id,
      lastActive: new Date()
    }
  });

  await prisma.chatMessage.create({
    data: {
      roomId: chatRoom.id,
      senderId: buyer1.id,
      senderName: buyer1.name,
      text: "Hello Ramesh, is the paddy ready for transport?",
      audio: false
    }
  });

  await prisma.chatMessage.create({
    data: {
      roomId: chatRoom.id,
      senderId: farmer1.id,
      senderName: farmer1.name,
      text: "Yes, the packaging is completed. Certified Grade-A paddy.",
      audio: false
    }
  });

  console.log("✓ Seeded Chat Rooms & Messages");
  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
