import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import { Comment, Notification } from "@/lib/models/index";

// GET /api/posts/[id]/comments
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: postId } = await params;
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 }).limit(50).lean();

    const uids = [...new Set(comments.map((c) => c.uid))];
    const authors = await User.find({ uid: { $in: uids } }).lean();
    const authorMap = new Map(authors.map((a) => [a.uid, a]));

    const enriched = comments.map((c) => ({
      ...c,
      _id: String(c._id),
      author: authorMap.get(c.uid) ?? null,
    }));

    return NextResponse.json({ comments: enriched });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments  { uid, text }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: postId } = await params;
    const { uid, text } = await req.json();

    if (!uid || !text?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const post = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const comment = await Comment.create({ postId, uid, text: text.trim() });
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Notify post owner
    if (post.uid !== uid) {
      await Notification.create({
        uid: post.uid,
        type: "comment",
        sourceUserId: uid,
        postId,
        message: "commented on your post",
      });
    }

    const author = await User.findOne({ uid }).lean();
    return NextResponse.json({
      comment: { ...JSON.parse(JSON.stringify(comment)), _id: String(comment._id), author },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
