"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

interface ProfileUser { uid: string; displayName: string; username: string; bio: string; photoURL: string | null; website?: string; }

interface Props {
  user: ProfileUser;
  onClose: () => void;
  onSave: (data: { displayName: string; username: string; bio: string; website: string; photoFile?: File }) => Promise<void>;
}

export default function EditProfileModal({ user, onClose, onSave }: Props) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [website, setWebsite] = useState(user.website ?? "");
  const [previewURL, setPreviewURL] = useState<string | null>(user.photoURL);
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPreviewURL(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ displayName: displayName.trim(), username: username.trim().toLowerCase(), bio: bio.trim(), website: website.trim(), photoFile });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-ptm-card border border-ptm-border rounded-4xl overflow-hidden shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ptm-border">
            <h2 className="font-display text-lg font-bold">Edit Profile</h2>
            <button onClick={onClose} className="p-2 rounded-xl text-ptm-text-muted hover:text-ptm-text hover:bg-ptm-surface"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar src={previewURL} name={displayName} size="xl" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Camera className="w-6 h-6 text-white" /></button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              </div>
            </div>

            {[
              { label: "Display Name", value: displayName, onChange: setDisplayName, placeholder: "Your name" },
              { label: "Username", value: username, onChange: setUsername, placeholder: "username", prefix: "@" },
              { label: "Website", value: website, onChange: setWebsite, placeholder: "https://example.com" },
            ].map(({ label, value, onChange, placeholder, prefix }) => (
              <div key={label}>
                <label className="text-ptm-text-muted text-xs font-medium mb-1.5 block">{label}</label>
                <div className="flex items-center bg-ptm-surface border border-ptm-border rounded-2xl px-4 py-3 focus-within:border-ptm-accent transition-colors">
                  {prefix && <span className="text-ptm-text-dim mr-1">{prefix}</span>}
                  <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 bg-transparent text-ptm-text text-sm outline-none" />
                </div>
              </div>
            ))}

            <div>
              <label className="text-ptm-text-muted text-xs font-medium mb-1.5 block">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself..." rows={3} maxLength={150} className="w-full bg-ptm-surface border border-ptm-border rounded-2xl px-4 py-3 text-ptm-text text-sm outline-none resize-none focus:border-ptm-accent transition-colors" />
              <p className="text-ptm-text-dim text-xs text-right mt-1">{bio.length}/150</p>
            </div>
          </div>

          <div className="px-6 pb-6">
            <Button onClick={handleSave} loading={saving} className="w-full" size="lg">Save Changes</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
