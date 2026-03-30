import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const q = req.nextUrl.searchParams.get("q") ?? "";
    if (!q.trim()) return NextResponse.json({ users: [] });

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { displayName: { $regex: q, $options: "i" } },
      ],
      role: { $ne: "banned" },
    })
      .limit(10)
      .lean();

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
