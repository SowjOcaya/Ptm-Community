import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import { Report } from "@/lib/models/index";

export async function GET() {
  try {
    await connectDB();
    const reports = await Report.find({ status: "pending" }).sort({ createdAt: -1 }).limit(50).lean();
    const uids = [...new Set(reports.map((r) => r.reporterId))];
    const users = await User.find({ uid: { $in: uids } }).lean();
    const userMap = new Map(users.map((u) => [u.uid, u]));
    return NextResponse.json({
      reports: reports.map((r) => ({ ...r, _id: String(r._id), reporter: userMap.get(r.reporterId) ?? null })),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { reporterId, targetType, targetId, reason } = await req.json();
    if (!reporterId || !targetType || !targetId || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const report = await Report.create({ reporterId, targetType, targetId, reason });
    const r = JSON.parse(JSON.stringify(report)); return NextResponse.json({ report: { ...r, _id: String(report._id) } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { reportId, status, deletePost: shouldDelete, banUid } = await req.json();
    if (reportId) await Report.findByIdAndUpdate(reportId, { status });
    if (shouldDelete) await Post.findByIdAndDelete(shouldDelete);
    if (banUid) await User.findOneAndUpdate({ uid: banUid }, { role: "banned" });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
