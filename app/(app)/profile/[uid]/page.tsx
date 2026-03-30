"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Grid3x3, Film, Bookmark, Settings, UserCheck, UserPlus } from "lucide-react";
import { getUser, getPosts, checkFollow, toggleFollow, updateUser, uploadMedia } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { ProfileSkeleton, GridSkeleton } from "@/components/ui/Skeleton";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { cn, formatCount } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type Tab = "posts" | "reels" | "saved";

interface AppUser { uid: string; username: string; displayName: string; photoURL: string | null; bio: string; role: string; followersCount: number; followingCount: number; postsCount: number; isVerified: boolean; createdAt: string; }
interface AppPost { _id: string; uid: string; text: string; mediaUrl?: string; mediaType: string; likesCount: number; createdAt: string; }

export default function ProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const { user: currentUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [posts, setPosts] = useState<AppPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("posts");
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const isOwn = currentUser?.uid === uid;

  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      const [u, isF] = await Promise.all([
        getUser(uid),
        currentUser && !isOwn ? checkFollow(uid, currentUser.uid) : Promise.resolve(false),
      ]);
      setProfile(u);
      setFollowing(isF as boolean);
      setLoading(false);
    };
    load();
  }, [uid, currentUser, isOwn]);

  useEffect(() => {
    if (!profile) return;
    setPostsLoading(true);
    const loadPosts = async () => {
      const { posts: all } = await getPosts({ authorUid: uid, limit: 30 });
      if (tab === "reels") setPosts(all.filter((p: AppPost) => p.mediaType === "video"));
      else setPosts(all.filter((p: AppPost) => p.mediaType !== "video"));
      setPostsLoading(false);
    };
    loadPosts();
  }, [tab, uid, profile]);

  const handleFollow = async () => {
    if (!currentUser || isOwn) return;
    setFollowLoading(true);
    const action = following ? "unfollow" : "follow";
    await toggleFollow(uid, currentUser.uid, action);
    setFollowing(!following);
    setProfile((p) => p ? { ...p, followersCount: p.followersCount + (following ? -1 : 1) } : p);
    setFollowLoading(false);
  };

  const handleSaveProfile = async (data: { displayName: string; username: string; bio: string; website: string; photoFile?: File }) => {
    if (!currentUser) return;
    let photoURL = profile?.photoURL;
    if (data.photoFile) {
      const result = await uploadMedia(data.photoFile, "avatars");
      photoURL = result.url;
    }
    const updated = await updateUser(currentUser.uid, { displayName: data.displayName, username: data.username, bio: data.bio, website: data.website, photoURL });
    setProfile((p) => p ? { ...p, ...updated } : p);
    await refreshUser();
    setEditOpen(false);
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile) return <div className="flex items-center justify-center min-h-screen"><p className="text-ptm-text-muted">User not found</p></div>;

  const tabs: { id: Tab; icon: typeof Grid3x3; label: string }[] = [
    { id: "posts", icon: Grid3x3, label: "Posts" },
    { id: "reels", icon: Film, label: "Reels" },
    ...(isOwn ? [{ id: "saved" as Tab, icon: Bookmark, label: "Saved" }] : []),
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="h-40 bg-gradient-to-br from-ptm-accent/30 via-ptm-purple/20 to-ptm-pink/30 mesh-bg" />
      <div className="px-5 pb-5">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <Avatar src={profile.photoURL} name={profile.displayName} size="xl" ring className="border-4 border-ptm-bg" />
            {profile.isVerified && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-ptm-accent rounded-full flex items-center justify-center border-2 border-ptm-bg"><span className="text-white text-xs">✓</span></div>}
          </div>
          {isOwn ? (
            <Button variant="secondary" size="sm" icon={<Settings className="w-4 h-4" />} onClick={() => setEditOpen(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant={following ? "secondary" : "primary"} size="sm" loading={followLoading} icon={following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />} onClick={handleFollow}>
                {following ? "Following" : "Follow"}
              </Button>
              <Link href={`/messages?uid=${uid}`}><Button variant="secondary" size="sm">Message</Button></Link>
            </div>
          )}
        </div>

        <h1 className="font-display text-2xl font-bold text-ptm-text">{profile.displayName}</h1>
        <p className="text-ptm-text-muted text-sm">@{profile.username}</p>
        {profile.bio && <p className="mt-3 text-ptm-text text-sm leading-relaxed">{profile.bio}</p>}
        {profile.createdAt && <p className="text-ptm-text-dim text-xs mt-2">Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}</p>}

        <div className="flex gap-6 mt-4">
          {[{ label: "Posts", value: profile.postsCount ?? 0 }, { label: "Followers", value: profile.followersCount }, { label: "Following", value: profile.followingCount }].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-display text-xl font-bold text-ptm-text">{formatCount(value)}</p>
              <p className="text-ptm-text-muted text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex border-b border-ptm-border sticky top-0 bg-ptm-bg z-10">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)} className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative", tab === id ? "text-ptm-text" : "text-ptm-text-muted hover:text-ptm-text")}>
            <Icon className="w-4 h-4" />{label}
            {tab === id && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ptm-accent" />}
          </button>
        ))}
      </div>

      <div className="p-1">
        {postsLoading ? <GridSkeleton /> : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-5xl">{tab === "posts" ? "📸" : tab === "reels" ? "🎬" : "🔖"}</div>
            <p className="text-ptm-text-muted">{tab === "posts" ? "No posts yet" : tab === "reels" ? "No reels yet" : "No saved posts"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            <AnimatePresence>
              {posts.map((post, i) => (
                <motion.div key={post._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="aspect-square bg-ptm-surface relative overflow-hidden group cursor-pointer">
                  {post.mediaUrl ? (
                    post.mediaType === "video" ? <video src={post.mediaUrl} className="w-full h-full object-cover" muted /> : <Image src={post.mediaUrl} alt="Post" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-ptm-card p-4"><p className="text-ptm-text-muted text-xs text-center line-clamp-4">{post.text}</p></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-3 text-white"><span className="text-sm font-semibold">♥ {formatCount(post.likesCount)}</span></div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {editOpen && profile && (
        <EditProfileModal user={profile} onClose={() => setEditOpen(false)} onSave={handleSaveProfile} />
      )}
    </div>
  );
}
