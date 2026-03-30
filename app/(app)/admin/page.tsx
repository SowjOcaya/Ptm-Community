"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, XCircle, Trash2, Ban } from "lucide-react";
import { getReports, updateReport } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface Report { _id: string; reporterId: string; targetType: string; targetId: string; reason: string; status: string; createdAt: string; reporter?: { displayName: string; photoURL: string | null }; }

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") { router.replace("/feed"); return; }
    getReports().then(setReports).finally(() => setLoading(false));
  }, [user, router]);

  const handle = async (reportId: string, action: "resolve" | "dismiss" | "deletePost" | "banUser", extra?: string) => {
    try {
      if (action === "resolve") await updateReport({ reportId, status: "resolved" });
      else if (action === "dismiss") await updateReport({ reportId, status: "dismissed" });
      else if (action === "deletePost" && extra) await updateReport({ reportId, status: "resolved", deletePost: extra });
      else if (action === "banUser" && extra) await updateReport({ reportId, status: "resolved", banUid: extra });
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      toast.success("Done");
    } catch { toast.error("Failed"); }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-ptm-amber/10 flex items-center justify-center"><Shield className="w-5 h-5 text-ptm-amber" /></div>
        <div><h1 className="font-display text-2xl font-bold text-ptm-text">Admin Panel</h1><p className="text-ptm-text-muted text-sm">Moderation Dashboard</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{ label: "Pending Reports", value: reports.length, color: "text-ptm-amber", bg: "bg-ptm-amber/10", icon: AlertTriangle }].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-ptm-card border border-ptm-border rounded-3xl p-5 flex items-center gap-3 col-span-3 md:col-span-1">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", bg)}><Icon className={cn("w-5 h-5", color)} /></div>
            <div><p className="font-display text-xl font-bold text-ptm-text">{value}</p><p className="text-ptm-text-muted text-xs">{label}</p></div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? [1,2,3].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />) :
        reports.length === 0 ? (
          <div className="text-center py-20"><CheckCircle className="w-16 h-16 mx-auto text-ptm-green mb-4" /><h3 className="font-display text-xl font-bold text-ptm-text">All clear!</h3><p className="text-ptm-text-muted mt-2">No pending reports</p></div>
        ) : reports.map((report, i) => (
          <motion.div key={report._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-ptm-card border border-ptm-border rounded-3xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Avatar src={report.reporter?.photoURL} name={report.reporter?.displayName} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ptm-text text-sm">{report.reporter?.displayName ?? "User"}</span>
                    <span className="text-ptm-text-dim text-xs">reported a</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", report.targetType === "post" ? "bg-ptm-accent/10 text-ptm-accent" : "bg-ptm-pink/10 text-ptm-pink")}>{report.targetType}</span>
                  </div>
                  <p className="text-ptm-text-muted text-sm mt-1"><span className="font-medium">Reason:</span> {report.reason}</p>
                  <p className="text-ptm-text-dim text-xs mt-1">{report.createdAt ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true }) : ""}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {report.targetType === "post" && <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => handle(report._id, "deletePost", report.targetId)}>Delete Post</Button>}
                {report.targetType === "user" && <Button variant="danger" size="sm" icon={<Ban className="w-3.5 h-3.5" />} onClick={() => handle(report._id, "banUser", report.targetId)}>Ban User</Button>}
                <Button variant="ghost" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => handle(report._id, "resolve")}>Resolve</Button>
                <Button variant="ghost" size="sm" icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => handle(report._id, "dismiss")}>Dismiss</Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
