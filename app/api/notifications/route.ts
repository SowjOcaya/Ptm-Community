import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import { Notification } from "@/lib/models/index";

// GET /api/notifications?uid=
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const uid = req.nextUrl.searchParams.get("uid");
    if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

    const notifications = await Notification.find({ uid })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const sourceUids = [...new Set(notifications.map((n) => n.sourceUserId))];
    const sources = await User.find({ uid: { $in: sourceUids } }).lean();
    const sourceMap = new Map(sources.map((u) => [u.uid, u]));

    const enriched = notifications.map((n) => ({
      ...n,
      _id: String(n._id),
      sourceUser: sourceMap.get(n.sourceUserId) ?? null,
    }));

    return NextResponse.json({ notifications: enriched });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/notifications  { uid, notificationId? } — mark read
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { uid, notificationId } = await req.json();
    if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } else {
      await Notification.updateMany({ uid, read: false }, { read: true });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
