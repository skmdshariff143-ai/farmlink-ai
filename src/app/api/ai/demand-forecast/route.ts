import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/services/ai.services";
import { z } from "zod";

const demandSchema = z.object({
  cropName: z.string().min(2, "Crop name is required"),
  location: z.string().min(3, "Location details are required")
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const body = await req.json();
    const result = demandSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const { cropName, location } = result.data;
    const forecast = await AIService.getDemandForecast(cropName, location);

    return NextResponse.json({ success: true, data: forecast });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
