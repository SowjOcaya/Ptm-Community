import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const excludeUid = req.nextUrl.searchParams.get("exclude") ?? "";
    const users = await User.find({ uid: { $ne: excludeUid }, role: { $ne: "banned" } })
      .sort({ followersCount: -1 })
      .limit(6)
      .lean();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
