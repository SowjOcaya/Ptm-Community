import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { Community, CommunityMember } from "@/lib/models/index";

// GET /api/communities?uid=
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const uid = req.nextUrl.searchParams.get("uid");
    const communities = await Community.find().sort({ membersCount: -1 }).limit(30).lean();

    let memberSet = new Set<string>();
    if (uid) {
      const memberships = await CommunityMember.find({ uid }).lean();
      memberSet = new Set(memberships.map((m) => m.communityId));
    }

    return NextResponse.json({
      communities: communities.map((c) => ({
        ...c,
        _id: String(c._id),
        isMember: memberSet.has(String(c._id)),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/communities (admin only - for seeding)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const community = await Community.create(body);
    const c = JSON.parse(JSON.stringify(community)); return NextResponse.json({ community: { ...c, _id: String(community._id) } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
