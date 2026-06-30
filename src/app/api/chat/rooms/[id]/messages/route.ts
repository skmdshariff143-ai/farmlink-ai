import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const { id: roomId } = await params;
    const userId = (session.user as any).id;

    // Verify user belongs to this chat room
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return NextResponse.json({ success: false, error: "Chat room not found" }, { status: 404 });
    }

    if (room.participantA !== userId && room.participantB !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized access to this chat room" }, { status: 403 });
    }

    // Retrieve message list
    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { timestamp: "asc" }
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
