import { create } from "zustand";

interface AppPost {
  _id: string;
  uid: string;
  text: string;
  mediaUrl?: string;
  mediaType: "image" | "video" | "none";
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  savedCount: number;
  createdAt: string;
  author?: {
    uid: string;
    username: string;
    displayName: string;
    photoURL: string | null;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

interface AppNotification {
  _id: string;
  uid: string;
  type: string;
  sourceUserId: string;
  postId?: string;
  message: string;
  read: boolean;
  createdAt: string;
  sourceUser?: { uid: string; displayName: string; photoURL: string | null };
}

interface UIStore {
  createPostOpen: boolean;
  setCreatePostOpen: (open: boolean) => void;

  notifications: AppNotification[];
  unreadCount: number;
  setNotifications: (n: AppNotification[]) => void;

  feedPosts: AppPost[];
  setFeedPosts: (posts: AppPost[]) => void;
  prependPost: (post: AppPost) => void;
  updatePostLike: (id: string, liked: boolean, delta: number) => void;
  updatePostSave: (id: string, saved: boolean) => void;
  removePost: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  createPostOpen: false,
  setCreatePostOpen: (open) => set({ createPostOpen: open }),

  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length }),

  feedPosts: [],
  setFeedPosts: (feedPosts) => set({ feedPosts }),
  prependPost: (post) => set((s) => ({ feedPosts: [post, ...s.feedPosts] })),
  updatePostLike: (id, liked, delta) =>
    set((s) => ({
      feedPosts: s.feedPosts.map((p) =>
        p._id === id ? { ...p, isLiked: liked, likesCount: p.likesCount + delta } : p
      ),
    })),
  updatePostSave: (id, saved) =>
    set((s) => ({
      feedPosts: s.feedPosts.map((p) => (p._id === id ? { ...p, isSaved: saved } : p)),
    })),
  removePost: (id) => set((s) => ({ feedPosts: s.feedPosts.filter((p) => p._id !== id) })),
}));
