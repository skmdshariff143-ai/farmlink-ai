import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/services/ai.services";
import { z } from "zod";

const recommendationSchema = z.object({
  soilType: z.string().min(2, "Soil type description is required"),
  waterAvailability: z.enum(["High", "Medium", "Low"])
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const body = await req.json();
    const result = recommendationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const { soilType, waterAvailability } = result.data;
    const recommendations = await AIService.getSmartRecommendations(soilType, waterAvailability);

    return NextResponse.json({ success: true, data: recommendations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
