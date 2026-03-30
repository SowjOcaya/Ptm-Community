import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "posts";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    const result = await uploadToCloudinary(buffer, folder, resourceType);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
