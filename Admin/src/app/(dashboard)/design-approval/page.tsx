"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, Clock, User, CheckCircle, XCircle, Hourglass } from "lucide-react";

const initialDesigns = [
  {
    id: "DSN-2024-101",
    title: "Summer Campaign Brochure",
    client: "Kantipur Media",
    designer: "Aarav Sharma",
    submittedDate: "2024-03-10",
    status: "Pending",
    image: "https://picsum.photos/seed/design1/600/400",
  },
  {
    id: "DSN-2024-102",
    title: "Product Launch Banner",
    client: "Ncell Axiata",
    designer: "Sita Verma",
    submittedDate: "2024-03-09",
    status: "Pending",
    image: "https://picsum.photos/seed/design2/600/400",
  },
  {
    id: "DSN-2024-103",
    title: "Corporate Identity Pack",
    client: "Panchakanya Group",
    designer: "Rohan Gupta",
    submittedDate: "2024-03-08",
    status: "Approved",
    image: "https://picsum.photos/seed/design3/600/400",
  },
];

const STATUS_CONFIG = {
  Pending: { label: "Pending", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", ring: "ring-1 ring-amber-200/60", dot: "bg-amber-500", icon: Hourglass },
  Approved: { label: "Approved", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-1 ring-emerald-200/60", dot: "bg-emerald-500", icon: CheckCircle },
  Rejected: { label: "Rejected", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", ring: "ring-1 ring-red-200/60", dot: "bg-red-500", icon: XCircle },
};

export default function DesignApprovalPage() {
  const { toast } = useToast();
  const [designs, setDesigns] = useState(initialDesigns);
  const [selectedDesign, setSelectedDesign] = useState<typeof initialDesigns[0] | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleApprove = (id: string) => {
    setDesigns(designs.map((d) => (d.id === id ? { ...d, status: "Approved" } : d)));
    toast({ title: "Design Approved ✓", description: "The design has been approved for printing." });
    setIsViewOpen(false);
  };

  const handleReject = (id: string) => {
    setDesigns(designs.map((d) => (d.id === id ? { ...d, status: "Rejected" } : d)));
    toast({ title: "Design Rejected", description: "Designer will be notified.", variant: "destructive" });
    setIsViewOpen(false);
  };

  const stats = {
    pending: designs.filter((d) => d.status === "Pending").length,
    approved: designs.filter((d) => d.status === "Approved").length,
    rejected: designs.filter((d) => d.status === "Rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Design Approval</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Review and approve designs before sending to print.
          </p>
        </div>
        {/* Status summary */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-semibold text-slate-900 dark:text-white">{stats.pending}</span>
            <span className="text-slate-500">pending</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-900 dark:text-white">{stats.approved}</span>
            <span className="text-slate-500">approved</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="font-semibold text-slate-900 dark:text-white">{stats.rejected}</span>
            <span className="text-slate-500">rejected</span>
          </div>
        </div>
      </div>

      {/* Design Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {designs.map((design) => {
          const cfg = STATUS_CONFIG[design.status as keyof typeof STATUS_CONFIG];
          return (
            <Card key={design.id} className="group overflow-hidden transition-all hover:shadow-md">
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={design.image}
                  alt={design.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Status badge */}
                <div className="absolute right-3 top-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2 bg-white/95 text-slate-900 hover:bg-white shadow-lg"
                    onClick={() => { setSelectedDesign(design); setIsViewOpen(true); }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Full Review
                  </Button>
                </div>
              </div>

              {/* Info */}
              <CardHeader className="p-4 pb-0">
                <CardTitle className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {design.title}
                </CardTitle>
                <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {design.designer}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {design.submittedDate}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2.5">
                <p className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{design.client}</span>
                  {" · "}
                  <span className="font-mono">{design.id}</span>
                </p>
              </CardContent>

              <CardFooter className="gap-2 border-t border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => { setSelectedDesign(design); setIsViewOpen(true); }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Review
                </Button>
                {design.status === "Pending" && (
                  <>
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApprove(design.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 gap-1.5"
                      onClick={() => handleReject(design.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Review Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">{selectedDesign?.title}</DialogTitle>
            <DialogDescription>
              Submitted by <strong>{selectedDesign?.designer}</strong> for {selectedDesign?.client} · {selectedDesign?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100 shadow-inner dark:bg-slate-800">
            {selectedDesign && (
              <img
                src={selectedDesign.image}
                alt={selectedDesign.title}
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            {selectedDesign?.status === "Pending" && (
              <>
                <Button variant="destructive" className="gap-2" onClick={() => selectedDesign && handleReject(selectedDesign.id)}>
                  <X className="h-4 w-4" /> Reject
                </Button>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => selectedDesign && handleApprove(selectedDesign.id)}>
                  <Check className="h-4 w-4" /> Approve Design
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
