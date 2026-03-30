import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { Conversation, Message } from "@/lib/models/index";

// GET /api/conversations/[id]/messages
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: conversationId } = await params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(100).lean();
    return NextResponse.json({ messages: messages.map((m) => ({ ...m, _id: String(m._id) })) });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/conversations/[id]/messages  { senderId, text }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: conversationId } = await params;
    const { senderId, text } = await req.json();

    if (!senderId || !text?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const message = await Message.create({ conversationId, senderId, text: text.trim(), seen: false });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text.trim(),
      lastMessageAt: new Date(),
      lastMessageSenderId: senderId,
    });

    const m = JSON.parse(JSON.stringify(message)); return NextResponse.json({ message: { ...m, _id: String(message._id) } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
