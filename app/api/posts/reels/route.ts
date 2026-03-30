import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import { Like } from "@/lib/models/index";

// GET /api/posts/reels?cursor=&uid=
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const cursor = req.nextUrl.searchParams.get("cursor");
    const uid = req.nextUrl.searchParams.get("uid");
    const limit = 5;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { mediaType: "video" };
    if (cursor) filter.createdAt = { $lt: new Date(cursor) };

    const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(limit + 1).lean();
    const hasMore = posts.length > limit;
    const items = posts.slice(0, limit);

    const uids = [...new Set(items.map((p) => p.uid))];
    const authors = await User.find({ uid: { $in: uids } }).lean();
    const authorMap = new Map(authors.map((a) => [a.uid, a]));

    let likedSet = new Set<string>();
    if (uid) {
      const likes = await Like.find({ uid, postId: { $in: items.map((p) => String(p._id)) } }).lean();
      likedSet = new Set(likes.map((l) => l.postId));
    }

    const enriched = items.map((p) => ({
      ...p,
      _id: String(p._id),
      author: authorMap.get(p.uid) ?? null,
      isLiked: likedSet.has(String(p._id)),
    }));

    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;
    return NextResponse.json({ posts: enriched, nextCursor, hasMore });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
