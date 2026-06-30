import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CropService } from "@/services/db.services";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const crop = await CropService.getCropById(id);

    if (!crop) {
      return NextResponse.json({ success: false, error: "Crop harvest listing not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: crop });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const { id } = await params;
    const crop = await CropService.getCropById(id);

    if (!crop) {
      return NextResponse.json({ success: false, error: "Crop listing not found" }, { status: 404 });
    }

    // Only owner farmer can update price or stock
    if (crop.farmerId !== (session.user as any).id) {
      return NextResponse.json({ success: false, error: "Forbidden. Access denied." }, { status: 403 });
    }

    const body = await req.json();
    const updatedCrop = await CropService.updateCropListing(id, {
      price: body.price,
      quantity: body.quantity,
      status: body.status
    });

    return NextResponse.json({ success: true, data: updatedCrop });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const { id } = await params;
    const crop = await CropService.getCropById(id);

    if (!crop) {
      return NextResponse.json({ success: false, error: "Crop listing not found" }, { status: 404 });
    }

    // Only owner farmer can delete
    if (crop.farmerId !== (session.user as any).id) {
      return NextResponse.json({ success: false, error: "Forbidden. Access denied." }, { status: 403 });
    }

    await CropService.deleteCropListing(id);
    return NextResponse.json({ success: true, message: "Listing deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
