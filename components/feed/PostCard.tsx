"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Trash2, Flag, Play } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toggleLike, toggleSave, deletePost, reportContent } from "@/lib/api";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import CommentsSection from "@/components/feed/CommentsSection";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface PostAuthor { uid: string; username: string; displayName: string; photoURL: string | null; }
interface Post {
  _id: string; uid: string; text: string; mediaUrl?: string; mediaType: "image"|"video"|"none";
  thumbnailUrl?: string; likesCount: number; commentsCount: number; savedCount: number;
  createdAt: string; author?: PostAuthor; isLiked?: boolean; isSaved?: boolean;
}

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const { updatePostLike, updatePostSave, removePost } = useUIStore();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [saved, setSaved] = useState(post.isSaved ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const handleLike = useCallback(async () => {
    if (!user) return;
    const newLiked = !liked;
    const delta = newLiked ? 1 : -1;
    setLiked(newLiked);
    setLikesCount((c) => c + delta);
    updatePostLike(post._id, newLiked, delta);
    if (newLiked) { setHeartAnim(true); setTimeout(() => setHeartAnim(false), 600); }
    try {
      await toggleLike(post._id, user.uid, newLiked ? "like" : "unlike");
    } catch {
      setLiked(!newLiked); setLikesCount((c) => c - delta); updatePostLike(post._id, !newLiked, -delta);
    }
  }, [liked, user, post._id, updatePostLike]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    const newSaved = !saved;
    setSaved(newSaved);
    updatePostSave(post._id, newSaved);
    try {
      await toggleSave(post._id, user.uid, newSaved ? "save" : "unsave");
      toast.success(newSaved ? "Post saved!" : "Removed from saved");
    } catch {
      setSaved(!newSaved); updatePostSave(post._id, !newSaved);
    }
  }, [saved, user, post._id, updatePostSave]);

  const handleDelete = async () => {
    if (!user) return;
    try {
      await deletePost(post._id, user.uid);
      removePost(post._id);
      toast.success("Post deleted");
    } catch { toast.error("Failed to delete"); }
    setMenuOpen(false);
  };

  const handleReport = async () => {
    if (!user) return;
    try {
      await reportContent(user.uid, "post", post._id, "Inappropriate content");
      toast.success("Reported");
    } catch { toast.error("Failed to report"); }
    setMenuOpen(false);
  };

  const relTime = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "";
  const isOwner = user?.uid === post.uid;

  const formatCount = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);

  return (
    <motion.article layout className="bg-ptm-card border border-ptm-border rounded-3xl overflow-hidden hover:border-ptm-muted transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <Link href={`/profile/${post.uid}`} className="flex items-center gap-3 group">
          <Avatar src={post.author?.photoURL} name={post.author?.displayName} size="md" />
          <div>
            <p className="font-semibold text-ptm-text text-sm group-hover:text-ptm-accent transition-colors">{post.author?.displayName ?? "User"}</p>
            <p className="text-ptm-text-dim text-xs">@{post.author?.username} · {relTime}</p>
          </div>
        </Link>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl text-ptm-text-muted hover:text-ptm-text hover:bg-ptm-surface transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-10 z-20 bg-ptm-surface border border-ptm-border rounded-2xl shadow-card overflow-hidden min-w-[140px]">
                  {isOwner ? (
                    <button onClick={handleDelete} className="flex items-center gap-2 w-full px-4 py-3 text-ptm-pink hover:bg-ptm-card text-sm">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  ) : (
                    <button onClick={handleReport} className="flex items-center gap-2 w-full px-4 py-3 text-ptm-text-muted hover:bg-ptm-card text-sm">
                      <Flag className="w-4 h-4" /> Report
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {post.text && <div className="px-5 pb-3"><p className="text-ptm-text text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p></div>}

      {post.mediaUrl && post.mediaType === "image" && (
        <div className="relative w-full aspect-[4/3] bg-ptm-surface mt-2">
          <Image src={post.mediaUrl} alt="Post" fill className="object-cover" unoptimized />
        </div>
      )}

      {post.mediaUrl && post.mediaType === "video" && (
        <div className="relative w-full aspect-video bg-black mt-2 cursor-pointer" onClick={() => setVideoPlaying(!videoPlaying)}>
          <video src={post.mediaUrl} className="w-full h-full object-cover" controls={videoPlaying} playsInline poster={post.thumbnailUrl} />
          {!videoPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center"><Play className="w-6 h-6 text-white ml-1" /></div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 p-4 pt-3">
        <div className="relative">
          <AnimatePresence>
            {heartAnim && (
              <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="w-5 h-5 text-ptm-pink fill-ptm-pink" />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileTap={{ scale: 0.85 }} onClick={handleLike} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors", liked ? "text-ptm-pink bg-ptm-pink/10" : "text-ptm-text-muted hover:text-ptm-pink hover:bg-ptm-pink/10")}>
            <Heart className={cn("w-5 h-5", liked && "fill-ptm-pink")} />
            <span>{formatCount(likesCount)}</span>
          </motion.button>
        </div>

        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setCommentsOpen(!commentsOpen)} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors", commentsOpen ? "text-ptm-accent bg-ptm-accent/10" : "text-ptm-text-muted hover:text-ptm-accent hover:bg-ptm-accent/10")}>
          <MessageCircle className="w-5 h-5" />
          <span>{formatCount(post.commentsCount)}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.85 }} onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/post/${post._id}`); toast.success("Link copied!"); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-ptm-text-muted hover:text-ptm-purple hover:bg-ptm-purple/10 text-sm font-medium transition-colors">
          <Share2 className="w-5 h-5" />
        </motion.button>

        <motion.button whileTap={{ scale: 0.85 }} onClick={handleSave} className={cn("flex items-center gap-1.5 ml-auto px-3 py-2 rounded-xl text-sm font-medium transition-colors", saved ? "text-ptm-amber bg-ptm-amber/10" : "text-ptm-text-muted hover:text-ptm-amber hover:bg-ptm-amber/10")}>
          <Bookmark className={cn("w-5 h-5", saved && "fill-ptm-amber")} />
        </motion.button>
      </div>

      <AnimatePresence>
        {commentsOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-ptm-border">
            <CommentsSection postId={post._id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
