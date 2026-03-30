import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  thumbnailUrl?: string;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ptm-community/${folder}`,
        resource_type: resourceType,
        transformation: resourceType === "image"
          ? [{ quality: "auto", fetch_format: "auto" }]
          : undefined,
      },
      (error, result) => {
        if (error || !result) return reject(error);
        const isVideo = result.resource_type === "video";
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: isVideo ? "video" : "image",
          thumbnailUrl: isVideo
            ? cloudinary.url(result.public_id, {
                resource_type: "video",
                format: "jpg",
                transformation: [{ start_offset: "0" }],
              })
            : undefined,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType: "image" | "video" = "image"): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
