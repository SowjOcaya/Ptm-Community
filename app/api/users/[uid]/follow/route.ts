import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import { Follow } from "@/lib/models/index";

// POST /api/users/[uid]/follow  { followerId, action: "follow"|"unfollow" }
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await connectDB();
    const { uid: followingId } = await params;
    const { followerId, action } = await req.json();

    if (!followerId || followerId === followingId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (action === "follow") {
      await Follow.findOneAndUpdate(
        { followerId, followingId },
        { followerId, followingId },
        { upsert: true }
      );
      await User.findOneAndUpdate({ uid: followerId }, { $inc: { followingCount: 1 } });
      await User.findOneAndUpdate({ uid: followingId }, { $inc: { followersCount: 1 } });
    } else {
      const deleted = await Follow.findOneAndDelete({ followerId, followingId });
      if (deleted) {
        await User.findOneAndUpdate({ uid: followerId }, { $inc: { followingCount: -1 } });
        await User.findOneAndUpdate({ uid: followingId }, { $inc: { followersCount: -1 } });
      }
    }

    const isFollowing = !!(await Follow.findOne({ followerId, followingId }));
    return NextResponse.json({ isFollowing });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/users/[uid]/follow?followerId=xxx
export async function GET(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await connectDB();
    const { uid: followingId } = await params;
    const followerId = req.nextUrl.searchParams.get("followerId");
    if (!followerId) return NextResponse.json({ isFollowing: false });
    const exists = await Follow.findOne({ followerId, followingId });
    return NextResponse.json({ isFollowing: !!exists });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
