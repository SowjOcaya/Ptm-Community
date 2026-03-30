// MongoDB-based types (using _id strings instead of Firestore DocumentReference)

export interface AppUser {
  _id?: string;
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  website?: string;
  role: "user" | "admin" | "banned";
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = "image" | "video" | "none";

export interface AppPost {
  _id: string;
  uid: string;
  communityId?: string;
  text: string;
  mediaUrl?: string;
  mediaType: MediaType;
  mediaPublicId?: string;
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  savedCount: number;
  createdAt: string;
  updatedAt: string;
  author?: Partial<AppUser>;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface AppComment {
  _id: string;
  postId: string;
  uid: string;
  text: string;
  createdAt: string;
  author?: Partial<AppUser>;
}

export type NotificationType = "like" | "comment" | "follow" | "message" | "mention";

export interface AppNotification {
  _id: string;
  uid: string;
  type: NotificationType;
  sourceUserId: string;
  postId?: string;
  message: string;
  read: boolean;
  createdAt: string;
  sourceUser?: Partial<AppUser>;
}

export interface AppConversation {
  _id: string;
  members: string[];
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId: string;
  otherUser?: Partial<AppUser>;
}

export interface AppMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  seen: boolean;
  createdAt: string;
}

export interface AppCommunity {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  creatorId: string;
  membersCount: number;
  createdAt: string;
  isMember?: boolean;
}

export interface AppStory {
  _id: string;
  uid: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  expiresAt: string;
  createdAt: string;
  author?: Partial<AppUser>;
}
