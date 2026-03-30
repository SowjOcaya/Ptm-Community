import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { Community, CommunityMember } from "@/lib/models/index";

// POST /api/communities/[id]/join  { uid, action: "join"|"leave" }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: communityId } = await params;
    const { uid, action } = await req.json();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (action === "join") {
      await CommunityMember.findOneAndUpdate(
        { communityId, uid },
        { communityId, uid, joinedAt: new Date() },
        { upsert: true }
      );
      await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: 1 } });
    } else {
      const deleted = await CommunityMember.findOneAndDelete({ communityId, uid });
      if (deleted) await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: -1 } });
    }

    const isMember = !!(await CommunityMember.findOne({ communityId, uid }));
    return NextResponse.json({ isMember });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
