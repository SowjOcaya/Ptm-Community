"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPosts } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUIStore } from "@/store/ui-store";
import PostCard from "@/components/feed/PostCard";
import StoriesBar from "@/components/stories/StoriesBar";
import SuggestedUsers from "@/components/feed/SuggestedUsers";
import { PostSkeleton } from "@/components/ui/Skeleton";
import { RefreshCw } from "lucide-react";

export default function FeedPage() {
  const { user } = useAuth();
  const { feedPosts, setFeedPosts } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadPosts = useCallback(async (reset = false) => {
    if (!user) return;
    try {
      const { posts, nextCursor, hasMore: more } = await getPosts({
        cursor: reset ? undefined : cursorRef.current ?? undefined,
        uid: user.uid,
        limit: 10,
      });
      cursorRef.current = nextCursor;
      setHasMore(more);
      if (reset) setFeedPosts(posts);
      else setFeedPosts([...feedPosts, ...posts]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, feedPosts, setFeedPosts]);

  useEffect(() => { if (user) { setLoading(true); loadPosts(true); } }, [user]); // eslint-disable-line

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        setLoadingMore(true);
        loadPosts();
      }
    }, { threshold: 0.1 });
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]); // eslint-disable-line

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8">
      <StoriesBar />

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold text-ptm-text">Your Feed</h1>
        <button
          onClick={() => { setLoading(true); cursorRef.current = null; loadPosts(true); }}
          className="flex items-center gap-2 text-ptm-text-muted hover:text-ptm-accent transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading && <div className="space-y-4">{[1,2,3].map((i) => <PostSkeleton key={i} />)}</div>}

      {!loading && (
        <AnimatePresence>
          {feedPosts.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 space-y-4">
              <div className="text-6xl">🌟</div>
              <h3 className="font-display text-xl font-bold text-ptm-text">Your feed is empty</h3>
              <p className="text-ptm-text-muted">Create your first post to get started!</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {feedPosts.map((post, i) => (
                <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
                  <PostCard post={post} />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      <div ref={bottomRef} className="py-4">
        {loadingMore && <div className="flex justify-center"><div className="w-6 h-6 border-2 border-ptm-accent border-t-transparent rounded-full animate-spin" /></div>}
        {!hasMore && feedPosts.length > 0 && <p className="text-center text-ptm-text-dim text-sm py-4">You&apos;re all caught up! ✨</p>}
      </div>

      <div className="mt-8 lg:hidden"><SuggestedUsers /></div>
    </div>
  );
}
