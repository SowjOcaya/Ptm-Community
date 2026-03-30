import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Like ────────────────────────────────────────────────────────────────────
export interface ILike extends Document {
  postId: string;
  uid: string;
  createdAt: Date;
}
const LikeSchema = new Schema<ILike>({ postId: { type: String, required: true }, uid: { type: String, required: true }, }, { timestamps: true });
LikeSchema.index({ postId: 1, uid: 1 }, { unique: true });
export const Like: Model<ILike> = mongoose.models.Like ?? mongoose.model<ILike>("Like", LikeSchema);

// ─── Save ────────────────────────────────────────────────────────────────────
export interface ISave extends Document {
  postId: string;
  uid: string;
  createdAt: Date;
}
const SaveSchema = new Schema<ISave>({ postId: { type: String, required: true }, uid: { type: String, required: true }, }, { timestamps: true });
SaveSchema.index({ postId: 1, uid: 1 }, { unique: true });
SaveSchema.index({ uid: 1, createdAt: -1 });
export const Save: Model<ISave> = mongoose.models.Save ?? mongoose.model<ISave>("Save", SaveSchema);

// ─── Comment ─────────────────────────────────────────────────────────────────
export interface IComment extends Document {
  postId: string;
  uid: string;
  text: string;
  createdAt: Date;
}
const CommentSchema = new Schema<IComment>({ postId: { type: String, required: true, index: true }, uid: { type: String, required: true }, text: { type: String, required: true, maxlength: 500 }, }, { timestamps: true });
CommentSchema.index({ postId: 1, createdAt: 1 });
export const Comment: Model<IComment> = mongoose.models.Comment ?? mongoose.model<IComment>("Comment", CommentSchema);

// ─── Follow ──────────────────────────────────────────────────────────────────
export interface IFollow extends Document {
  followerId: string;
  followingId: string;
  createdAt: Date;
}
const FollowSchema = new Schema<IFollow>({ followerId: { type: String, required: true }, followingId: { type: String, required: true }, }, { timestamps: true });
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1 });
export const Follow: Model<IFollow> = mongoose.models.Follow ?? mongoose.model<IFollow>("Follow", FollowSchema);

// ─── Conversation ─────────────────────────────────────────────────────────────
export interface IConversation extends Document {
  members: string[];
  lastMessage: string;
  lastMessageAt: Date;
  lastMessageSenderId: string;
  createdAt: Date;
}
const ConversationSchema = new Schema<IConversation>({ members: [{ type: String }], lastMessage: { type: String, default: "" }, lastMessageAt: { type: Date, default: Date.now }, lastMessageSenderId: { type: String, default: "" }, }, { timestamps: true });
ConversationSchema.index({ members: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
export const Conversation: Model<IConversation> = mongoose.models.Conversation ?? mongoose.model<IConversation>("Conversation", ConversationSchema);

// ─── Message ──────────────────────────────────────────────────────────────────
export interface IMessage extends Document {
  conversationId: string;
  senderId: string;
  text: string;
  seen: boolean;
  createdAt: Date;
}
const MessageSchema = new Schema<IMessage>({ conversationId: { type: String, required: true, index: true }, senderId: { type: String, required: true }, text: { type: String, required: true }, seen: { type: Boolean, default: false }, }, { timestamps: true });
MessageSchema.index({ conversationId: 1, createdAt: 1 });
export const Message: Model<IMessage> = mongoose.models.Message ?? mongoose.model<IMessage>("Message", MessageSchema);

// ─── Notification ─────────────────────────────────────────────────────────────
export interface INotification extends Document {
  uid: string;
  type: "like" | "comment" | "follow" | "message" | "mention";
  sourceUserId: string;
  postId?: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
const NotificationSchema = new Schema<INotification>({ uid: { type: String, required: true, index: true }, type: { type: String, enum: ["like","comment","follow","message","mention"], required: true }, sourceUserId: { type: String, required: true }, postId: { type: String }, message: { type: String, required: true }, read: { type: Boolean, default: false }, }, { timestamps: true });
NotificationSchema.index({ uid: 1, createdAt: -1 });
NotificationSchema.index({ uid: 1, read: 1 });
export const Notification: Model<INotification> = mongoose.models.Notification ?? mongoose.model<INotification>("Notification", NotificationSchema);

// ─── Community ────────────────────────────────────────────────────────────────
export interface ICommunity extends Document {
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  creatorId: string;
  membersCount: number;
  createdAt: Date;
}
const CommunitySchema = new Schema<ICommunity>({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true, lowercase: true }, description: { type: String, default: "" }, coverImage: { type: String }, creatorId: { type: String, required: true }, membersCount: { type: Number, default: 0 }, }, { timestamps: true });
export const Community: Model<ICommunity> = mongoose.models.Community ?? mongoose.model<ICommunity>("Community", CommunitySchema);

// ─── CommunityMember ──────────────────────────────────────────────────────────
export interface ICommunityMember extends Document {
  communityId: string;
  uid: string;
  joinedAt: Date;
}
const CommunityMemberSchema = new Schema<ICommunityMember>({ communityId: { type: String, required: true }, uid: { type: String, required: true }, joinedAt: { type: Date, default: Date.now }, });
CommunityMemberSchema.index({ communityId: 1, uid: 1 }, { unique: true });
export const CommunityMember: Model<ICommunityMember> = mongoose.models.CommunityMember ?? mongoose.model<ICommunityMember>("CommunityMember", CommunityMemberSchema);

// ─── Story ────────────────────────────────────────────────────────────────────
export interface IStory extends Document {
  uid: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  mediaPublicId?: string;
  expiresAt: Date;
  viewedBy: string[];
  createdAt: Date;
}
const StorySchema = new Schema<IStory>({ uid: { type: String, required: true, index: true }, mediaUrl: { type: String, required: true }, mediaType: { type: String, enum: ["image","video"], required: true }, mediaPublicId: { type: String }, expiresAt: { type: Date, required: true, index: true }, viewedBy: [{ type: String }], }, { timestamps: true });
export const Story: Model<IStory> = mongoose.models.Story ?? mongoose.model<IStory>("Story", StorySchema);

// ─── Report ───────────────────────────────────────────────────────────────────
export interface IReport extends Document {
  reporterId: string;
  targetType: "post" | "user" | "comment";
  targetId: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: Date;
}
const ReportSchema = new Schema<IReport>({ reporterId: { type: String, required: true }, targetType: { type: String, enum: ["post","user","comment"], required: true }, targetId: { type: String, required: true }, reason: { type: String, required: true }, status: { type: String, enum: ["pending","resolved","dismissed"], default: "pending" }, }, { timestamps: true });
ReportSchema.index({ status: 1, createdAt: -1 });
export const Report: Model<IReport> = mongoose.models.Report ?? mongoose.model<IReport>("Report", ReportSchema);
