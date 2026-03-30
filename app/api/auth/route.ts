import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { uid, email, displayName, photoURL } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate unique username from displayName
    const baseUsername = (displayName ?? email.split("@")[0])
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || "user";

    // Check if user already exists
    let user = await User.findOne({ uid });

    if (!user) {
      // Make username unique
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }

      user = await User.create({
        uid,
        username,
        displayName: displayName ?? "User",
        email,
        photoURL: photoURL ?? null,
        bio: "",
        role: "user",
      });
    } else {
      // Update photo if changed
      if (photoURL && user.photoURL !== photoURL) {
        user.photoURL = photoURL;
        await user.save();
      }
    }

    const u = user.toJSON(); return NextResponse.json({ user: { ...u, _id: String(u._id) } });
  } catch (error) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
