import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import { Like, Save } from "@/lib/models/index";

// GET /api/posts?cursor=&limit=&uid= (feed)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const cursor = req.nextUrl.searchParams.get("cursor");
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "10"), 20);
    const uid = req.nextUrl.searchParams.get("uid"); // current viewer
    const authorUid = req.nextUrl.searchParams.get("authorUid"); // filter by author
    const communityId = req.nextUrl.searchParams.get("communityId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (authorUid) filter.uid = authorUid;
    if (communityId) filter.communityId = communityId;
    if (cursor) filter.createdAt = { $lt: new Date(cursor) };

    const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(limit + 1).lean();
    const hasMore = posts.length > limit;
    const items = posts.slice(0, limit);

    // Enrich with authors
    const uids = [...new Set(items.map((p) => p.uid))];
    const authors = await User.find({ uid: { $in: uids } }).lean();
    const authorMap = new Map(authors.map((a) => [a.uid, a]));

    // Check liked/saved status for current viewer
    let likedSet = new Set<string>();
    let savedSet = new Set<string>();
    if (uid) {
      const postIds = items.map((p) => String(p._id));
      const [likes, saves] = await Promise.all([
        Like.find({ uid, postId: { $in: postIds } }).lean(),
        Save.find({ uid, postId: { $in: postIds } }).lean(),
      ]);
      likedSet = new Set(likes.map((l) => l.postId));
      savedSet = new Set(saves.map((s) => s.postId));
    }

    const enriched = items.map((p) => ({
      ...p,
      _id: String(p._id),
      author: authorMap.get(p.uid) ?? null,
      isLiked: likedSet.has(String(p._id)),
      isSaved: savedSet.has(String(p._id)),
    }));

    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;
    return NextResponse.json({ posts: enriched, nextCursor, hasMore });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/posts
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { uid, text, mediaUrl, mediaType, mediaPublicId, thumbnailUrl, communityId } = body;

    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!text?.trim() && !mediaUrl) return NextResponse.json({ error: "Post must have content" }, { status: 400 });

    const post = await Post.create({ uid, text: text ?? "", mediaUrl, mediaType: mediaType ?? "none", mediaPublicId, thumbnailUrl, communityId });
    await User.findOneAndUpdate({ uid }, { $inc: { postsCount: 1 } });

    const p = JSON.parse(JSON.stringify(post)); return NextResponse.json({ post: { ...p, _id: String(post._id) } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
