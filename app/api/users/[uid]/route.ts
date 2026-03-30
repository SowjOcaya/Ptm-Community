import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/models/User";

// GET /api/users/[uid]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await connectDB();
    const { uid } = await params;
    const user = await User.findOne({ uid }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/users/[uid]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    await connectDB();
    const { uid } = await params;
    const body = await req.json();
    const allowed = ["displayName", "username", "bio", "website", "photoURL"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    const user = await User.findOneAndUpdate({ uid }, updates, { new: true }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
