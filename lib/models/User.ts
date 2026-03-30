import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  uid: string; // Firebase UID
  username: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  website: string;
  role: "user" | "admin" | "banned";
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    photoURL: { type: String, default: null },
    bio: { type: String, default: "", maxlength: 150 },
    website: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin", "banned"], default: "user" },
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    postsCount: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ username: "text", displayName: "text" });

const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
export default User;
