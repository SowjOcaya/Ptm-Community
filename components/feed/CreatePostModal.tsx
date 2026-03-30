"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Video, Send, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "@/lib/auth-context";
import { useUIStore } from "@/store/ui-store";
import { createPost, uploadMedia } from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CreatePostModal() {
  const { user } = useAuth();
  const { createPostOpen, setCreatePostOpen, prependPost } = useUIStore();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [], "video/*": [] }, maxFiles: 1, maxSize: 100 * 1024 * 1024,
  });

  const handleClose = () => {
    if (uploading) return;
    setCreatePostOpen(false);
    setText(""); setFile(null); setPreview(null); setProgress(0);
  };

  const handleSubmit = async () => {
    if (!user || (!text.trim() && !file)) return;
    setUploading(true);
    try {
      let mediaUrl, mediaType: "image"|"video"|"none" = "none", mediaPublicId, thumbnailUrl;
      if (file) {
        const result = await uploadMedia(file, "posts", setProgress);
        mediaUrl = result.url;
        mediaType = result.resourceType;
        mediaPublicId = result.publicId;
        thumbnailUrl = result.thumbnailUrl;
      }
      const post = await createPost({ uid: user.uid, text: text.trim(), mediaUrl, mediaType, mediaPublicId, thumbnailUrl });
      prependPost({ ...post, author: user, isLiked: false, isSaved: false });
      toast.success("Post created! 🎉");
      handleClose();
    } catch { toast.error("Failed to create post"); }
    finally { setUploading(false); }
  };

  return (
    <AnimatePresence>
      {createPostOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50 bg-ptm-card border border-ptm-border rounded-4xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ptm-border">
              <h2 className="font-display text-lg font-bold text-ptm-text">Create Post</h2>
              <button onClick={handleClose} disabled={uploading} className="p-2 rounded-xl text-ptm-text-muted hover:text-ptm-text hover:bg-ptm-surface transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar src={user?.photoURL} name={user?.displayName} size="md" />
                <div><p className="font-semibold text-ptm-text text-sm">{user?.displayName}</p><p className="text-ptm-text-dim text-xs">@{user?.username}</p></div>
              </div>

              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What's on your mind?" rows={3} className="w-full bg-transparent text-ptm-text placeholder:text-ptm-text-dim outline-none resize-none text-base leading-relaxed" maxLength={2000} />

              {preview && (
                <div className="relative rounded-2xl overflow-hidden bg-ptm-surface">
                  {file?.type.startsWith("video/") ? <video src={preview} className="w-full max-h-64 object-cover" controls /> : <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />}
                  <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white"><X className="w-4 h-4" /></button>
                </div>
              )}

              {!preview && (
                <div {...getRootProps()} className={cn("border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all", isDragActive ? "border-ptm-accent bg-ptm-accent/5" : "border-ptm-border hover:border-ptm-accent/50 hover:bg-ptm-surface/50")}>
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-ptm-text-dim" />
                  <p className="text-ptm-text-muted text-sm">{isDragActive ? "Drop it here!" : "Drag & drop or click to add photo/video"}</p>
                  <p className="text-ptm-text-dim text-xs mt-1">Max 100MB</p>
                </div>
              )}

              {uploading && progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-ptm-text-muted"><span>Uploading...</span><span>{progress}%</span></div>
                  <div className="h-1.5 bg-ptm-border rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-ptm-accent to-ptm-purple" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-ptm-border">
              <div className="flex gap-2">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl text-ptm-text-muted hover:text-ptm-accent hover:bg-ptm-accent/10 cursor-pointer transition-colors text-sm">
                  <ImageIcon className="w-4 h-4" /> Photo
                  <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
                </label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl text-ptm-text-muted hover:text-ptm-purple hover:bg-ptm-purple/10 cursor-pointer transition-colors text-sm">
                  <Video className="w-4 h-4" /> Video
                  <input type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }} />
                </label>
              </div>
              <Button onClick={handleSubmit} disabled={!((text.trim() || file) && !uploading)} loading={uploading} icon={<Send className="w-4 h-4" />} size="md">Post</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
