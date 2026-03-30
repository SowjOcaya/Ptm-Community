import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  uid: string;
  communityId?: string;
  text: string;
  mediaUrl?: string;
  mediaType: "image" | "video" | "none";
  mediaPublicId?: string; // Cloudinary public_id for deletion
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  savedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    uid: { type: String, required: true, index: true },
    communityId: { type: String, index: true },
    text: { type: String, default: "", maxlength: 2000 },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video", "none"], default: "none" },
    mediaPublicId: { type: String },
    thumbnailUrl: { type: String },
    likesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
    savedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ uid: 1, createdAt: -1 });
PostSchema.index({ mediaType: 1, createdAt: -1 });

const Post: Model<IPost> = mongoose.models.Post ?? mongoose.model<IPost>("Post", PostSchema);
export default Post;
