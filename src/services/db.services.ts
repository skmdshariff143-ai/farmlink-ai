import { prisma } from "@/lib/prisma";
import { Role, ListingStatus, OrderStatus } from "@prisma/client";

// ========================================================
// 1. USER & PROFILE SERVICES
// ========================================================
export const UserService = {
  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  },

  async updateUserProfile(id: string, data: { name?: string; email?: string; location?: string; phone?: string }) {
    return prisma.user.update({
      where: { id },
      data
    });
  },

  async getRoleAnalytics() {
    const userCount = await prisma.user.count();
    const listingCount = await prisma.cropListing.count();
    const orderCount = await prisma.order.count();
    const salesTotal = await prisma.order.aggregate({
      _sum: { total: true }
    });

    return {
      users: userCount,
      listings: listingCount,
      orders: orderCount,
      sales: salesTotal._sum.total ?? 0
    };
  }
};

// ========================================================
// 2. CROP / HARVEST SERVICES
// ========================================================
export const CropService = {
  async createCropListing(data: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    location: string;
    farmerId: string;
    image: string;
    description: string;
  }) {
    return prisma.cropListing.create({
      data: {
        name: data.name,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
        location: data.location,
        image: data.image,
        description: data.description,
        farmerId: data.farmerId,
        status: ListingStatus.AVAILABLE
      }
    });
  },

  async getCrops(filters?: { category?: string; search?: string; take?: number; skip?: number }) {
    return prisma.cropListing.findMany({
      where: {
        status: ListingStatus.AVAILABLE,
        ...(filters?.category && { category: filters.category }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } }
          ]
        })
      },
      take: filters?.take ?? 10,
      skip: filters?.skip ?? 0,
      orderBy: { createdAt: "desc" },
      include: {
        farmer: {
          select: { name: true, phone: true }
        }
      }
    });
  },

  async getCropById(id: string) {
    return prisma.cropListing.findUnique({
      where: { id },
      include: { farmer: true }
    });
  },

  async updateCropListing(id: string, data: { price?: number; quantity?: number; status?: ListingStatus }) {
    return prisma.cropListing.update({
      where: { id },
      data
    });
  },

  async deleteCropListing(id: string) {
    return prisma.cropListing.delete({
      where: { id }
    });
  }
};

// ========================================================
// 3. ORDER ESCROW SERVICES
// ========================================================
export const OrderService = {
  async createOrder(data: {
    buyerId: string;
    paymentMethod: string;
    items: { listingId: string; quantity: number; price: number }[];
  }) {
    let orderTotal = 0;
    
    // Calculate total price
    data.items.forEach(item => {
      orderTotal += item.price * item.quantity;
    });

    return prisma.$transaction(async (tx) => {
      // 1. Create central order row
      const order = await tx.order.create({
        data: {
          buyerId: data.buyerId,
          total: orderTotal,
          paymentMethod: data.paymentMethod,
          status: OrderStatus.PENDING,
          deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN")
        }
      });

      // 2. Create individual order item specs and adjust inventory
      for (const item of data.items) {
        const crop = await tx.cropListing.findUnique({
          where: { id: item.listingId }
        });

        if (!crop || crop.quantity < item.quantity) {
          throw new Error(`Insufficient stock for crop: ${crop?.name || item.listingId}`);
        }

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            listingId: item.listingId,
            name: crop.name,
            quantity: item.quantity,
            price: item.price
          }
        });

        await tx.cropListing.update({
          where: { id: item.listingId },
          data: {
            quantity: crop.quantity - item.quantity,
            status: crop.quantity - item.quantity <= 0 ? ListingStatus.SOLD_OUT : ListingStatus.AVAILABLE
          }
        });
      }

      return order;
    });
  },

  async getOrders(userId: string, role: Role) {
    if (role === Role.ADMIN) {
      return prisma.order.findMany({
        include: { items: { include: { listing: true } }, buyer: true }
      });
    }

    if (role === Role.BUYER) {
      return prisma.order.findMany({
        where: { buyerId: userId },
        include: { items: { include: { listing: true } } }
      });
    }

    // Farmers retrieve orders mapping their specific crop listings
    return prisma.order.findMany({
      where: {
        items: {
          some: {
            listing: { farmerId: userId }
          }
        }
      },
      include: { items: { include: { listing: true } }, buyer: true }
    });
  },

  async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { listing: true } }, buyer: true }
    });
  },

  async updateOrderStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }
};

// ========================================================
// 4. ESCROW PAYMENT SERVICES
// ========================================================
export const PaymentService = {
  async initiatePayment(orderId: string, amount: number, method: string) {
    return prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        status: "Pending"
      }
    });
  },

  async verifyPayment(paymentId: string, status: "Paid" | "Failed") {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status }
    });

    if (status === "Paid") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "Paid" }
      });
    }

    return payment;
  }
};
