import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createRoomSchema = z.object({
  recipientId: z.string().uuid("Invalid recipient user ID")
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Fetch all rooms where the user is either participantA or participantB
    const rooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          { participantA: userId },
          { participantB: userId }
        ]
      },
      orderBy: { lastActive: "desc" }
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const body = await req.json();
    const result = createRoomSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const { recipientId } = result.data;

    if (userId === recipientId) {
      return NextResponse.json({ success: false, error: "Cannot start a chat room with yourself" }, { status: 400 });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) {
      return NextResponse.json({ success: false, error: "Recipient user not found" }, { status: 404 });
    }

    // Check if room already exists
    let room = await prisma.chatRoom.findFirst({
      where: {
        OR: [
          { participantA: userId, participantB: recipientId },
          { participantA: recipientId, participantB: userId }
        ]
      }
    });

    // Create room if not exists
    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          participantA: userId,
          participantB: recipientId,
          lastMessage: "Conversation started"
        }
      });
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
