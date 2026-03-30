// Central API client — all calls go through here
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// ─── Auth ────────────────────────────────────────────────────────────────────
export const syncUser = (data: { uid: string; email: string; displayName: string; photoURL: string | null }) =>
  api.post("/auth", data).then((r) => r.data.user);

// ─── Users ───────────────────────────────────────────────────────────────────
export const getUser = (uid: string) => api.get(`/users/${uid}`).then((r) => r.data.user);
export const updateUser = (uid: string, data: object) => api.patch(`/users/${uid}`, data).then((r) => r.data.user);
export const searchUsers = (q: string) => api.get(`/users/search?q=${encodeURIComponent(q)}`).then((r) => r.data.users);
export const getSuggestedUsers = (excludeUid: string) => api.get(`/users/suggested?exclude=${excludeUid}`).then((r) => r.data.users);
export const checkFollow = (uid: string, followerId: string) => api.get(`/users/${uid}/follow?followerId=${followerId}`).then((r) => r.data.isFollowing);
export const toggleFollow = (uid: string, followerId: string, action: "follow" | "unfollow") =>
  api.post(`/users/${uid}/follow`, { followerId, action }).then((r) => r.data);

// ─── Posts ───────────────────────────────────────────────────────────────────
export const getPosts = (params: { cursor?: string; uid?: string; authorUid?: string; communityId?: string; limit?: number }) =>
  api.get("/posts", { params }).then((r) => r.data);
export const getPost = (id: string) => api.get(`/posts/${id}`).then((r) => r.data.post);
export const createPost = (data: object) => api.post("/posts", data).then((r) => r.data.post);
export const deletePost = (id: string, uid: string) => api.delete(`/posts/${id}`, { data: { uid } });
export const getReels = (params: { cursor?: string; uid?: string }) => api.get("/posts/reels", { params }).then((r) => r.data);
export const getSavedPosts = (uid: string) => api.get("/posts", { params: { savedBy: uid } }).then((r) => r.data);

// ─── Likes & Saves ────────────────────────────────────────────────────────────
export const toggleLike = (postId: string, uid: string, action: "like" | "unlike") =>
  api.post(`/posts/${postId}/like`, { uid, action }).then((r) => r.data);
export const toggleSave = (postId: string, uid: string, action: "save" | "unsave") =>
  api.post(`/posts/${postId}/save`, { uid, action }).then((r) => r.data);

// ─── Comments ─────────────────────────────────────────────────────────────────
export const getComments = (postId: string) => api.get(`/posts/${postId}/comments`).then((r) => r.data.comments);
export const addComment = (postId: string, uid: string, text: string) =>
  api.post(`/posts/${postId}/comments`, { uid, text }).then((r) => r.data.comment);

// ─── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications = (uid: string) => api.get(`/notifications?uid=${uid}`).then((r) => r.data.notifications);
export const markNotificationRead = (uid: string, notificationId: string) =>
  api.patch("/notifications", { uid, notificationId });
export const markAllNotificationsRead = (uid: string) => api.patch("/notifications", { uid });

// ─── Messages ──────────────────────────────────────────────────────────────────
export const getConversations = (uid: string) => api.get(`/conversations?uid=${uid}`).then((r) => r.data.conversations);
export const getOrCreateConversation = (uid1: string, uid2: string) =>
  api.post("/conversations", { uid1, uid2 }).then((r) => r.data.conversationId);
export const getMessages = (conversationId: string) =>
  api.get(`/conversations/${conversationId}/messages`).then((r) => r.data.messages);
export const sendMessage = (conversationId: string, senderId: string, text: string) =>
  api.post(`/conversations/${conversationId}/messages`, { senderId, text }).then((r) => r.data.message);

// ─── Communities ───────────────────────────────────────────────────────────────
export const getCommunities = (uid?: string) =>
  api.get("/communities", { params: uid ? { uid } : {} }).then((r) => r.data.communities);
export const getCommunity = (id: string, uid?: string) =>
  api.get(`/communities/${id}`, { params: uid ? { uid } : {} }).then((r) => r.data.community);
export const toggleCommunity = (id: string, uid: string, action: "join" | "leave") =>
  api.post(`/communities/${id}/join`, { uid, action }).then((r) => r.data);

// ─── Stories ───────────────────────────────────────────────────────────────────
export const getStories = () => api.get("/stories").then((r) => r.data.stories);
export const createStory = (data: object) => api.post("/stories", data).then((r) => r.data.story);

// ─── Reports ───────────────────────────────────────────────────────────────────
export const reportContent = (reporterId: string, targetType: string, targetId: string, reason: string) =>
  api.post("/reports", { reporterId, targetType, targetId, reason });
export const getReports = () => api.get("/reports").then((r) => r.data.reports);
export const updateReport = (data: object) => api.patch("/reports", data);

// ─── Upload ────────────────────────────────────────────────────────────────────
export const uploadMedia = async (file: File, folder = "posts", onProgress?: (p: number) => void) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const res = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
    },
  });
  return res.data as { url: string; publicId: string; resourceType: "image" | "video"; thumbnailUrl?: string };
};
