"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/api";
import { useFarmStore } from "@/store/useFarmStore";

export interface CropData {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  location: string;
  image: string;
  description: string;
  farmerId: string;
  status: string;
  farmer?: {
    name: string;
    phone: string;
  };
}

export function useCrops(filters?: { category?: string; search?: string }) {
  const [crops, setCrops] = useState<CropData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sync with client-side store
  const syncStoreListings = useFarmStore((state) => state.syncListings);

  const fetchCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (filters?.category) query.append("category", filters.category);
      if (filters?.search) query.append("search", filters.search);

      const response = await apiClient.get<CropData[]>(`/crops?${query.toString()}`);
      if (response.success && response.data) {
        setCrops(response.data);
        // Sync our global state store
        syncStoreListings(response.data as unknown as Parameters<typeof syncStoreListings>[0]);
      } else {
        setError(response.error || "Failed to fetch crops");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg || "Failed to fetch crops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCrops();
    }, 0);
    return () => clearTimeout(timer);
  }, [filters?.category, filters?.search]);

  const uploadCrop = async (data: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    image: string;
    description: string;
  }) => {
    setLoading(true);
    try {
      const response = await apiClient.post<CropData>("/crops", data);
      if (response.success && response.data) {
        // Optimistic UI update: append new crop list immediately
        setCrops((prev) => [response.data!, ...prev]);
        return true;
      }
      setError(response.error || "Upload failed");
      return false;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCrop = async (id: string, data: { price?: number; quantity?: number; status?: string }) => {
    // Optimistic update
    const previousCrops = [...crops];
    setCrops((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );

    try {
      const response = await apiClient.patch(`/crops/${id}`, data);
      if (!response.success) {
        // Rollback on error
        setCrops(previousCrops);
        setError(response.error || "Failed to update crop");
        return false;
      }
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setCrops(previousCrops);
      setError(errMsg);
      return false;
    }
  };

  const deleteCrop = async (id: string) => {
    // Optimistic delete
    const previousCrops = [...crops];
    setCrops((prev) => prev.filter((c) => c.id !== id));

    try {
      const response = await apiClient.delete(`/crops/${id}`);
      if (!response.success) {
        setCrops(previousCrops);
        setError(response.error || "Failed to delete crop");
        return false;
      }
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setCrops(previousCrops);
      setError(errMsg);
      return false;
    }
  };

  return {
    crops,
    loading,
    error,
    refresh: fetchCrops,
    uploadCrop,
    updateCrop,
    deleteCrop,
  };
}
