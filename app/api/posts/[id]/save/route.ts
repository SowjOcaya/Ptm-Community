import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Post from "@/lib/models/Post";
import { Save } from "@/lib/models/index";

// POST /api/posts/[id]/save  { uid, action: "save"|"unsave" }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: postId } = await params;
    const { uid, action } = await req.json();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (action === "save") {
      await Save.findOneAndUpdate({ postId, uid }, { postId, uid }, { upsert: true });
      await Post.findByIdAndUpdate(postId, { $inc: { savedCount: 1 } });
    } else {
      const deleted = await Save.findOneAndDelete({ postId, uid });
      if (deleted) await Post.findByIdAndUpdate(postId, { $inc: { savedCount: -1 } });
    }

    const isSaved = !!(await Save.findOne({ postId, uid }));
    return NextResponse.json({ isSaved });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
