import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Post from "@/lib/models/Post";
import { Like, Notification } from "@/lib/models/index";

// POST /api/posts/[id]/like  { uid, action: "like"|"unlike" }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: postId } = await params;
    const { uid, action } = await req.json();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (action === "like") {
      await Like.findOneAndUpdate(
        { postId, uid },
        { postId, uid },
        { upsert: true }
      );
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

      // Create notification (don't notify yourself)
      if (post.uid !== uid) {
        await Notification.create({
          uid: post.uid,
          type: "like",
          sourceUserId: uid,
          postId,
          message: "liked your post",
        });
      }
    } else {
      const deleted = await Like.findOneAndDelete({ postId, uid });
      if (deleted) {
        await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      }
    }

    const isLiked = !!(await Like.findOne({ postId, uid }));
    const updated = await Post.findById(postId).lean();
    return NextResponse.json({ isLiked, likesCount: updated?.likesCount ?? 0 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/posts/[id]/like?uid=
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: postId } = await params;
    const uid = req.nextUrl.searchParams.get("uid");
    if (!uid) return NextResponse.json({ isLiked: false });
    const exists = await Like.findOne({ postId, uid });
    return NextResponse.json({ isLiked: !!exists });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
