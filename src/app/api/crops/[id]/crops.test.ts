import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET, PATCH, DELETE } from "./route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cropListing: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

describe("Crops Listing CRUD & Role Authorization Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCrop = {
    id: "crop-123",
    name: "Basmati Rice",
    category: "Grains",
    price: 80,
    quantity: 1000,
    location: "Punjab",
    farmerId: "farmer-owner-id",
    image: "rice.png",
    description: "Premium aromatic rice",
    status: "AVAILABLE",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it("GET should retrieve crop listing by ID", async () => {
    (prisma.cropListing.findUnique as any).mockResolvedValueOnce(mockCrop);

    const req = new Request("http://localhost/api/crops/crop-123");
    const params = Promise.resolve({ id: "crop-123" });

    const response = await GET(req, { params });
    const resData = await response.json();

    expect(response.status).toBe(200);
    expect(resData.success).toBe(true);
    expect(resData.data.name).toBe("Basmati Rice");
  });

  it("GET should return 404 if crop listing is not found", async () => {
    (prisma.cropListing.findUnique as any).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/crops/crop-123");
    const params = Promise.resolve({ id: "crop-999" });

    const response = await GET(req, { params });
    const resData = await response.json();

    expect(response.status).toBe(404);
    expect(resData.success).toBe(false);
    expect(resData.error).toContain("not found");
  });

  it("PATCH should allow owner farmer to update listing", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "farmer-owner-id", role: "FARMER" }
    });
    (prisma.cropListing.findUnique as any).mockResolvedValueOnce(mockCrop);
    (prisma.cropListing.update as any).mockResolvedValueOnce({
      ...mockCrop,
      price: 85
    });

    const req = new Request("http://localhost/api/crops/crop-123", {
      method: "PATCH",
      body: JSON.stringify({ price: 85 })
    });
    const params = Promise.resolve({ id: "crop-123" });

    const response = await PATCH(req, { params });
    const resData = await response.json();

    expect(response.status).toBe(200);
    expect(resData.success).toBe(true);
    expect(resData.data.price).toBe(85);
  });

  it("PATCH should reject a BUYER attempting to update farmer listing with 403", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "buyer-user-id", role: "BUYER" }
    });
    (prisma.cropListing.findUnique as any).mockResolvedValueOnce(mockCrop);

    const req = new Request("http://localhost/api/crops/crop-123", {
      method: "PATCH",
      body: JSON.stringify({ price: 85 })
    });
    const params = Promise.resolve({ id: "crop-123" });

    const response = await PATCH(req, { params });
    const resData = await response.json();

    expect(response.status).toBe(403);
    expect(resData.success).toBe(false);
    expect(resData.error).toContain("Forbidden");
  });

  it("PATCH should reject a FARMER attempting to update another farmer's listing with 403", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "another-farmer-id", role: "FARMER" }
    });
    (prisma.cropListing.findUnique as any).mockResolvedValueOnce(mockCrop);

    const req = new Request("http://localhost/api/crops/crop-123", {
      method: "PATCH",
      body: JSON.stringify({ price: 85 })
    });
    const params = Promise.resolve({ id: "crop-123" });

    const response = await PATCH(req, { params });
    const resData = await response.json();

    expect(response.status).toBe(403);
    expect(resData.success).toBe(false);
    expect(resData.error).toContain("Forbidden");
  });

  it("DELETE should allow owner farmer to delete listing", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "farmer-owner-id", role: "FARMER" }
    });
    (prisma.cropListing.findUnique as any).mockResolvedValueOnce(mockCrop);
    (prisma.cropListing.delete as any).mockResolvedValueOnce(mockCrop);

    const req = new Request("http://localhost/api/crops/crop-123", {
      method: "DELETE"
    });
    const params = Promise.resolve({ id: "crop-123" });

    const response = await DELETE(req, { params });
    const resData = await response.json();

    expect(response.status).toBe(200);
    expect(resData.success).toBe(true);
    expect(resData.message).toContain("deleted");
  });

  it("DELETE should reject a BUYER attempting to delete listing with 403", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "buyer-user-id", role: "BUYER" }
    });
    (prisma.cropListing.findUnique as any).mockResolvedValueOnce(mockCrop);

    const req = new Request("http://localhost/api/crops/crop-123", {
      method: "DELETE"
    });
    const params = Promise.resolve({ id: "crop-123" });

    const response = await DELETE(req, { params });
    const resData = await response.json();

    expect(response.status).toBe(403);
    expect(resData.success).toBe(false);
    expect(resData.error).toContain("Forbidden");
  });

  it("DELETE should reject a non-owner FARMER attempting to delete listing with 403", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "another-farmer-id", role: "FARMER" }
    });
    (prisma.cropListing.findUnique as any).mockResolvedValueOnce(mockCrop);

    const req = new Request("http://localhost/api/crops/crop-123", {
      method: "DELETE"
    });
    const params = Promise.resolve({ id: "crop-123" });

    const response = await DELETE(req, { params });
    const resData = await response.json();

    expect(response.status).toBe(403);
    expect(resData.success).toBe(false);
    expect(resData.error).toContain("Forbidden");
  });
});
