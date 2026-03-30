"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Avatar from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";

interface StoryAuthor { uid: string; displayName: string; photoURL: string | null; }
interface Story { _id: string; uid: string; mediaUrl: string; mediaType: "image" | "video"; createdAt: string; expiresAt: string; }

interface StoryViewerProps {
  stories: Story[];
  user?: StoryAuthor;
  onClose: () => void;
}

export default function StoryViewer({ stories, user, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const DURATION = 5000;

  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((i) => i + 1);
          } else {
            onClose();
          }
          return 0;
        }
        return prev + (100 / (DURATION / 100));
      });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentIndex, stories.length, onClose]);

  const goNext = () => {
    if (currentIndex < stories.length - 1) setCurrentIndex((i) => i + 1);
    else onClose();
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const relTime = currentStory?.createdAt
    ? formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })
    : "";

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={onClose}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm h-full max-h-[90vh] rounded-3xl overflow-hidden bg-ptm-bg">
          {/* Progress bars */}
          <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
            {stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <motion.div className="h-full bg-white rounded-full" style={{ width: i < currentIndex ? "100%" : i === currentIndex ? `${progress}%` : "0%" }} />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-3 right-3 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={user?.photoURL} name={user?.displayName} size="sm" ring />
              <div>
                <p className="text-white font-semibold text-sm">{user?.displayName}</p>
                <p className="text-white/60 text-xs">{relTime}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-black/40 text-white"><X className="w-4 h-4" /></button>
          </div>

          {/* Media */}
          {currentStory?.mediaType === "image" ? (
            <Image src={currentStory.mediaUrl} alt="Story" fill className="object-cover" unoptimized />
          ) : currentStory ? (
            <video src={currentStory.mediaUrl} className="w-full h-full object-cover" autoPlay muted playsInline />
          ) : null}

          {/* Navigation */}
          <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-0 top-0 h-full w-1/3 z-10 flex items-center justify-start pl-4">
            {currentIndex > 0 && <ChevronLeft className="w-8 h-8 text-white/60 hover:text-white" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-0 top-0 h-full w-1/3 z-10 flex items-center justify-end pr-4">
            <ChevronRight className="w-8 h-8 text-white/60 hover:text-white" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
