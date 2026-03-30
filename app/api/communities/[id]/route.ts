import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { Community, CommunityMember } from "@/lib/models/index";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const uid = req.nextUrl.searchParams.get("uid");
    const community = await Community.findById(id).lean();
    if (!community) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isMember = uid ? !!(await CommunityMember.findOne({ communityId: id, uid })) : false;
    return NextResponse.json({ community: { ...community, _id: String(community._id), isMember } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
