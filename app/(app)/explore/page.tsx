"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, TrendingUp, Users } from "lucide-react";
import { searchUsers, getSuggestedUsers, getPosts } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/index";
import Image from "next/image";
import Link from "next/link";
import { formatCount } from "@/lib/utils";

function ExploreContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [users, setUsers] = useState<{ uid: string; displayName: string; username: string; photoURL: string | null; followersCount: number; bio: string }[]>([]);
  const [trending, setTrending] = useState<{ _id: string; mediaUrl?: string; mediaType: string; text: string; likesCount: number }[]>([]);
  const [suggested, setSuggested] = useState<{ uid: string; displayName: string; username: string; photoURL: string | null; followersCount: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getPosts({ limit: 12 }).then((d) => setTrending(d.posts.filter((p: { mediaUrl?: string }) => p.mediaUrl))),
      getSuggestedUsers(user.uid).then(setSuggested),
    ]).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setUsers([]); return; }
    setSearching(true);
    searchUsers(debouncedQuery).then(setUsers).finally(() => setSearching(false));
  }, [debouncedQuery]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ptm-text-dim" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users, posts, topics..." className="w-full bg-ptm-card border border-ptm-border rounded-2xl pl-12 pr-4 py-3.5 text-ptm-text text-sm placeholder:text-ptm-text-dim outline-none focus:border-ptm-accent transition-colors" />
        {query && <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-ptm-text-dim hover:text-ptm-text">✕</button>}
      </div>

      {isSearching ? (
        <div className="space-y-2">
          {searching ? [1,2,3].map((i) => <div key={i} className="flex gap-3 p-4"><Skeleton className="w-12 h-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></div>) :
          users.length === 0 ? (
            <div className="text-center py-16"><div className="text-4xl mb-3">🔍</div><p className="text-ptm-text-muted">No results for &quot;{query}&quot;</p></div>
          ) : users.map((u, i) => (
            <motion.div key={u.uid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/profile/${u.uid}`} className="flex items-center gap-3 p-4 bg-ptm-card border border-ptm-border rounded-2xl hover:border-ptm-accent transition-colors">
                <Avatar src={u.photoURL} name={u.displayName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ptm-text truncate">{u.displayName}</p>
                  <p className="text-ptm-text-muted text-sm">@{u.username}</p>
                  {u.bio && <p className="text-ptm-text-dim text-xs truncate mt-0.5">{u.bio}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-ptm-text text-sm font-medium">{formatCount(u.followersCount)}</p>
                  <p className="text-ptm-text-dim text-xs">followers</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {!loading && suggested.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-ptm-accent" /><h2 className="font-display text-lg font-bold text-ptm-text">Suggested Creators</h2></div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {suggested.map((u, i) => (
                  <motion.div key={u.uid} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex-shrink-0">
                    <Link href={`/profile/${u.uid}`} className="flex flex-col items-center gap-2 p-3 bg-ptm-card border border-ptm-border rounded-2xl w-28 hover:border-ptm-accent transition-colors">
                      <Avatar src={u.photoURL} name={u.displayName} size="lg" />
                      <p className="font-semibold text-ptm-text text-xs truncate w-full text-center">{u.displayName}</p>
                      <p className="text-ptm-text-dim text-[10px]">{formatCount(u.followersCount)} followers</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {!loading && trending.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-ptm-purple" /><h2 className="font-display text-lg font-bold text-ptm-text">Trending</h2></div>
              <div className="grid grid-cols-3 gap-1.5">
                {trending.slice(0, 9).map((post, i) => (
                  <motion.div key={post._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className={`bg-ptm-card relative overflow-hidden rounded-xl group cursor-pointer ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                    {post.mediaUrl && post.mediaType === "image" && <Image src={post.mediaUrl} alt="" fill className="object-cover" unoptimized />}
                    {post.mediaUrl && post.mediaType === "video" && <video src={post.mediaUrl} className="w-full h-full object-cover" muted />}
                    {!post.mediaUrl && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ptm-accent/20 to-ptm-purple/20 p-3"><p className="text-ptm-text text-xs text-center line-clamp-3">{post.text}</p></div>}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-start p-2">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-white text-xs font-medium">♥ {formatCount(post.likesCount)}</p></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {loading && <div className="space-y-6"><div className="flex gap-3 overflow-x-hidden">{[1,2,3,4].map((i) => <Skeleton key={i} className="w-28 h-40 flex-shrink-0 rounded-2xl" />)}</div><div className="grid grid-cols-3 gap-1.5">{[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div></div>}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return <Suspense fallback={<div className="p-8 text-center text-ptm-text-muted">Loading...</div>}><ExploreContent /></Suspense>;
}
