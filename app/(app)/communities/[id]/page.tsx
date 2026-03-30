"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCommunity, getPosts, getUser, toggleCommunity } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import PostCard from "@/components/feed/PostCard";
import Button from "@/components/ui/Button";
import { Skeleton, PostSkeleton } from "@/components/ui/Skeleton";
import { formatCount } from "@/lib/utils";

interface Community { _id: string; name: string; slug: string; description: string; coverImage?: string; membersCount: number; isMember?: boolean; }
interface Post { _id: string; uid: string; text: string; mediaUrl?: string; mediaType: "image"|"video"|"none"; thumbnailUrl?: string; likesCount: number; commentsCount: number; savedCount: number; createdAt: string; author?: { uid: string; username: string; displayName: string; photoURL: string | null }; isLiked?: boolean; isSaved?: boolean; }

export default function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([
      getCommunity(id, user.uid),
      getPosts({ communityId: id, uid: user.uid, limit: 20 }),
    ]).then(([comm, { posts }]) => {
      setCommunity(comm);
      setPosts(posts);
    }).finally(() => { setLoading(false); setPostsLoading(false); });
  }, [id, user]);

  const handleJoinLeave = async () => {
    if (!user || !community) return;
    setJoining(true);
    const action = community.isMember ? "leave" : "join";
    await toggleCommunity(community._id, user.uid, action);
    setCommunity((c) => c ? { ...c, isMember: !c.isMember, membersCount: c.membersCount + (action === "join" ? 1 : -1) } : c);
    setJoining(false);
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-48 rounded-3xl" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
    </div>
  );

  if (!community) return <div className="flex items-center justify-center min-h-screen"><p className="text-ptm-text-muted">Community not found</p></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-4 pt-4">
        <Link href="/communities" className="inline-flex items-center gap-2 text-ptm-text-muted hover:text-ptm-text transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Communities
        </Link>
      </div>

      <div className="relative h-48 mt-4 mx-4 rounded-3xl overflow-hidden bg-gradient-to-br from-ptm-accent/20 via-ptm-purple/20 to-ptm-pink/20">
        {community.coverImage && <Image src={community.coverImage} alt={community.name} fill className="object-cover" unoptimized />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{community.name}</h1>
            <div className="flex items-center gap-1.5 text-white/70 text-sm mt-1"><Users className="w-4 h-4" /><span>{formatCount(community.membersCount)} members</span></div>
          </div>
          <Button variant={community.isMember ? "secondary" : "primary"} size="sm" loading={joining} onClick={handleJoinLeave}>
            {community.isMember ? "Leave" : "Join"}
          </Button>
        </div>
      </div>

      {community.description && <div className="px-4 py-4"><p className="text-ptm-text-muted text-sm leading-relaxed">{community.description}</p></div>}

      <div className="px-4 pb-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-ptm-text">Posts</h2>
        {postsLoading ? <><PostSkeleton /><PostSkeleton /></> :
        posts.length === 0 ? (
          <div className="text-center py-12"><p className="text-ptm-text-muted">No posts in this community yet.</p></div>
        ) : posts.map((post, i) => (
          <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <PostCard post={post} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
