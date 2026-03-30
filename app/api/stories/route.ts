import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import { Story } from "@/lib/models/index";

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    const stories = await Story.find({ expiresAt: { $gt: now } }).sort({ createdAt: -1 }).limit(30).lean();

    const uids = [...new Set(stories.map((s) => s.uid))];
    const authors = await User.find({ uid: { $in: uids } }).lean();
    const authorMap = new Map(authors.map((a) => [a.uid, a]));

    return NextResponse.json({
      stories: stories.map((s) => ({ ...s, _id: String(s._id), author: authorMap.get(s.uid) ?? null })),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { uid, mediaUrl, mediaType, mediaPublicId } = await req.json();
    if (!uid || !mediaUrl) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const story = await Story.create({ uid, mediaUrl, mediaType, mediaPublicId, expiresAt, viewedBy: [] });
    const s = JSON.parse(JSON.stringify(story)); return NextResponse.json({ story: { ...s, _id: String(story._id) } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
