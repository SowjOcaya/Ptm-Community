"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, VolumeX, Volume2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toggleLike } from "@/lib/api";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import CommentsSection from "@/components/feed/CommentsSection";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface ReelPost { _id: string; uid: string; text: string; mediaUrl?: string; thumbnailUrl?: string; likesCount: number; commentsCount: number; createdAt: string; author?: { uid: string; username: string; displayName: string; photoURL: string | null }; isLiked?: boolean; }

interface Props { reel: ReelPost; isActive: boolean; onLikeToggle: (liked: boolean, delta: number) => void; }

export default function ReelItem({ reel, isActive, onLikeToggle }: Props) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(reel.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(reel.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [heartPos, setHeartPos] = useState<{ x: number; y: number } | null>(null);
  const tapRef = useRef<NodeJS.Timeout | null>(null);
  const tapCount = useRef(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) v.play().catch(() => {});
    else { v.pause(); v.currentTime = 0; }
  }, [isActive]);

  const handleLike = useCallback(async () => {
    if (!user) return;
    const newLiked = !liked;
    const delta = newLiked ? 1 : -1;
    setLiked(newLiked); setLikesCount((c) => c + delta); onLikeToggle(newLiked, delta);
    try { await toggleLike(reel._id, user.uid, newLiked ? "like" : "unlike"); }
    catch { setLiked(!newLiked); setLikesCount((c) => c - delta); onLikeToggle(!newLiked, -delta); }
  }, [liked, user, reel._id, onLikeToggle]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    tapCount.current += 1;
    if (tapRef.current) clearTimeout(tapRef.current);
    tapRef.current = setTimeout(() => {
      if (tapCount.current >= 2) {
        if (!liked) handleLike();
        const rect = e.currentTarget.getBoundingClientRect();
        setHeartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setTimeout(() => setHeartPos(null), 900);
      }
      tapCount.current = 0;
    }, 300);
  };

  const formatCount = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full" onClick={handleTap}>
        <video ref={videoRef} src={reel.mediaUrl} className="w-full h-full object-cover" loop muted={muted} playsInline preload={isActive ? "auto" : "none"} poster={reel.thumbnailUrl} />
        <AnimatePresence>
          {heartPos && (
            <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.8 }} className="absolute pointer-events-none" style={{ left: heartPos.x - 40, top: heartPos.y - 40 }}>
              <Heart className="w-20 h-20 text-ptm-pink fill-ptm-pink drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="absolute bottom-0 left-0 right-16 p-5 pb-8">
        <Link href={`/profile/${reel.uid}`} className="flex items-center gap-3 mb-3">
          <Avatar src={reel.author?.photoURL} name={reel.author?.displayName} size="sm" ring />
          <p className="text-white font-semibold text-sm">@{reel.author?.username}</p>
        </Link>
        {reel.text && <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{reel.text}</p>}
        <p className="text-white/50 text-xs mt-1">{reel.createdAt ? formatDistanceToNow(new Date(reel.createdAt), { addSuffix: true }) : ""}</p>
      </div>

      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
        <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", liked ? "bg-ptm-pink/20" : "bg-black/40")}>
            <Heart className={cn("w-6 h-6", liked ? "fill-ptm-pink text-ptm-pink" : "text-white")} />
          </div>
          <span className="text-white text-xs font-medium">{formatCount(likesCount)}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center"><MessageCircle className="w-6 h-6 text-white" /></div>
          <span className="text-white text-xs font-medium">{formatCount(reel.commentsCount)}</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.8 }} onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/reels?id=${reel._id}`); toast.success("Link copied!"); }} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center"><Share2 className="w-6 h-6 text-white" /></div>
          <span className="text-white text-xs font-medium">Share</span>
        </motion.button>

        <motion.button whileTap={{ scale: 0.8 }} onClick={() => setMuted(!muted)} className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
          {muted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 z-10" onClick={() => setShowComments(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute bottom-0 left-0 right-0 z-20 bg-ptm-surface rounded-t-3xl max-h-[70%] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-ptm-border sticky top-0 bg-ptm-surface">
                <h3 className="font-semibold text-ptm-text">Comments</h3>
                <button onClick={() => setShowComments(false)} className="text-ptm-text-muted">✕</button>
              </div>
              <CommentsSection postId={reel._id} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
