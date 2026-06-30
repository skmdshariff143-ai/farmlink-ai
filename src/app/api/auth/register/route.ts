import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be valid"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["FARMER", "BUYER", "TRANSPORT", "WAREHOUSE", "ADMIN"]),
  location: z.string().min(3, "Location is required")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, email, password, role, location } = result.data;

    // Check unique constraints
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { email }]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Phone number or email is already registered" },
        { status: 409 }
      );
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role,
        location,
        walletBalance: role === "BUYER" ? 100000 : 0 // Pre-fund buyers with mock 1 Lakh
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
