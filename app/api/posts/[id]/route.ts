import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const post = await Post.findById(id).lean();
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const author = await User.findOne({ uid: post.uid }).lean();
    return NextResponse.json({ post: { ...post, _id: String(post._id), author } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { uid } = await req.json();
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const requestingUser = await User.findOne({ uid }).lean();
    const isOwner = post.uid === uid;
    const isAdmin = requestingUser?.role === "admin";
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await post.deleteOne();
    await User.findOneAndUpdate({ uid: post.uid }, { $inc: { postsCount: -1 } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
