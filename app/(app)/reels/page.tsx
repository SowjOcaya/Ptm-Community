"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getReels } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import ReelItem from "@/components/reels/ReelItem";

interface ReelPost { _id: string; uid: string; text: string; mediaUrl?: string; mediaType: string; thumbnailUrl?: string; likesCount: number; commentsCount: number; createdAt: string; author?: { uid: string; username: string; displayName: string; photoURL: string | null }; isLiked?: boolean; }

export default function ReelsPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState<ReelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cursorRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadReels = useCallback(async () => {
    if (!user) return;
    const { posts, nextCursor } = await getReels({ cursor: cursorRef.current ?? undefined, uid: user.uid });
    cursorRef.current = nextCursor;
    setReels((prev) => [...prev, ...posts]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadReels(); }, [loadReels]);

  useEffect(() => {
    if (currentIndex >= reels.length - 2) loadReels();
  }, [currentIndex, reels.length, loadReels]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-ptm-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!reels.length) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="text-center"><div className="text-5xl mb-4">🎬</div><h3 className="text-white font-display text-xl font-bold">No reels yet</h3><p className="text-white/60 mt-2">Be the first to post a video!</p></div>
    </div>
  );

  return (
    <div ref={containerRef} className="h-screen overflow-y-scroll snap-container no-scrollbar bg-black" onScroll={(e) => {
      const el = e.currentTarget;
      setCurrentIndex(Math.round(el.scrollTop / el.clientHeight));
    }}>
      {reels.map((reel, index) => (
        <div key={reel._id} className="snap-item h-screen">
          <ReelItem reel={reel} isActive={index === currentIndex} onLikeToggle={(liked, delta) => {
            setReels((prev) => prev.map((r) => r._id === reel._id ? { ...r, isLiked: liked, likesCount: r.likesCount + delta } : r));
          }} />
        </div>
      ))}
    </div>
  );
}
