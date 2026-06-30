import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CropService } from "@/services/db.services";
import { z } from "zod";

const cropSchema = z.object({
  name: z.string().min(2, "Crop name is required"),
  category: z.string().min(2, "Category is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  quantity: z.number().min(10, "Minimum upload amount is 10kg"),
  image: z.string().url("Valid image URL is required"),
  description: z.string().min(5, "Please provide description details")
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const skip = Number(searchParams.get("skip")) || 0;
    const take = Number(searchParams.get("take")) || 12;

    const crops = await CropService.getCrops({ category, search, skip, take });
    return NextResponse.json({ success: true, data: crops });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "FARMER") {
      return NextResponse.json({ success: false, error: "Unauthorized. Farmer access required." }, { status: 401 });
    }

    const body = await req.json();
    const result = cropSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const crop = await CropService.createCropListing({
      ...result.data,
      farmerId: (session.user as any).id,
      location: (session.user as any).location || "Mandi Hub, India"
    });

    return NextResponse.json({ success: true, data: crop });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
