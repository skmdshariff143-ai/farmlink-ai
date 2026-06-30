"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { useFarmStore } from "@/store/useFarmStore";

export interface OrderData {
  id: string;
  buyerId: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingStep: number;
  deliveryDate: string;
  createdAt: string;
  items: {
    id: string;
    listingId: string;
    name: string;
    price: number;
    quantity: number;
    listing: {
      image: string;
    };
  }[];
  buyer?: {
    name: string;
    phone: string;
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state store
  const syncStoreOrders = useFarmStore((state) => state.syncOrders);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<OrderData[]>("/orders");
      if (response.success && response.data) {
        setOrders(response.data);
        // Sync our global store
        syncStoreOrders(response.data as any);
      } else {
        setError(response.error || "Failed to fetch orders");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeOrder = async (data: {
    paymentMethod: string;
    items: { listingId: string; quantity: number; price: number }[];
  }) => {
    setLoading(true);
    try {
      const response = await apiClient.post<OrderData>("/orders", data);
      if (response.success && response.data) {
        setOrders((prev) => [response.data!, ...prev]);
        return response.data;
      }
      setError(response.error || "Order placement failed");
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    // Optimistic status update
    const previousOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );

    try {
      const response = await apiClient.patch(`/orders/${id}`, { status: newStatus });
      if (!response.success) {
        // Rollback
        setOrders(previousOrders);
        setError(response.error || "Failed to update order status");
        return false;
      }
      return true;
    } catch (err: any) {
      setOrders(previousOrders);
      setError(err.message);
      return false;
    }
  };

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    placeOrder,
    updateOrderStatus,
  };
}
