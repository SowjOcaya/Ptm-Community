import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import { Conversation } from "@/lib/models/index";

// GET /api/conversations?uid=
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const uid = req.nextUrl.searchParams.get("uid");
    if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

    const conversations = await Conversation.find({ members: uid })
      .sort({ lastMessageAt: -1 })
      .limit(30)
      .lean();

    const otherUids = conversations.map((c) => c.members.find((m) => m !== uid) ?? "");
    const others = await User.find({ uid: { $in: otherUids } }).lean();
    const otherMap = new Map(others.map((u) => [u.uid, u]));

    const enriched = conversations.map((c) => ({
      ...c,
      _id: String(c._id),
      otherUser: otherMap.get(c.members.find((m) => m !== uid) ?? "") ?? null,
    }));

    return NextResponse.json({ conversations: enriched });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/conversations  { uid1, uid2 } — get or create
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { uid1, uid2 } = await req.json();
    if (!uid1 || !uid2) return NextResponse.json({ error: "Missing uids" }, { status: 400 });

    const members = [uid1, uid2].sort();
    
    // Try to find existing conversation
    const existing = await Conversation.findOne({ members }).lean();
    if (existing) {
      return NextResponse.json({ conversationId: String(existing._id) });
    }

    // Create new one — use lean-compatible approach
    const created = new Conversation({ members, lastMessage: "", lastMessageAt: new Date(), lastMessageSenderId: uid1 });
    await created.save();

    return NextResponse.json({ conversationId: String(created._id) });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
