"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Plus, MoreHorizontal, Layout, Eye, Edit, Download } from "lucide-react";

const initialTemplates = [
  { id: "TMP-001", title: "Modern Corporate Business Card", category: "Business Cards", dimensions: "3.5 x 2 in", downloads: 1240, status: "Active", image: "https://picsum.photos/seed/businesscard1/400/250", lastUpdated: "2024-03-01" },
  { id: "TMP-002", title: "Minimalist Restaurant Menu", category: "Menus", dimensions: "8.5 x 11 in", downloads: 856, status: "Active", image: "https://picsum.photos/seed/menu1/400/500", lastUpdated: "2024-02-28" },
  { id: "TMP-003", title: "Tech Conference Flyer", category: "Flyers", dimensions: "A4", downloads: 2105, status: "Featured", image: "https://picsum.photos/seed/flyer1/400/500", lastUpdated: "2024-03-05" },
  { id: "TMP-004", title: "Wedding Invitation Suite", category: "Invitations", dimensions: "5 x 7 in", downloads: 543, status: "Active", image: "https://picsum.photos/seed/wedding1/400/300", lastUpdated: "2024-02-15" },
  { id: "TMP-005", title: "Real Estate Brochure", category: "Brochures", dimensions: "Tri-fold", downloads: 980, status: "Active", image: "https://picsum.photos/seed/brochure1/400/300", lastUpdated: "2024-03-08" },
  { id: "TMP-006", title: "Product Label – Organic Honey", category: "Labels", dimensions: "3 x 2 in", downloads: 320, status: "New", image: "https://picsum.photos/seed/label1/400/250", lastUpdated: "2024-03-10" },
  { id: "TMP-007", title: "Gym Membership Card", category: "ID Cards", dimensions: "CR80", downloads: 150, status: "Active", image: "https://picsum.photos/seed/idcard1/400/250", lastUpdated: "2024-01-20" },
  { id: "TMP-008", title: "Coffee Shop Loyalty Card", category: "Business Cards", dimensions: "3.5 x 2 in", downloads: 2200, status: "Popular", image: "https://picsum.photos/seed/loyalty1/400/250", lastUpdated: "2024-03-02" },
];

const STATUS_BADGE: Record<string, string> = {
  Featured: "bg-amber-500 text-white",
  New: "bg-blue-500 text-white",
  Popular: "bg-rose-500 text-white",
};

const categories = ["All", "Business Cards", "Flyers", "Brochures", "Menus", "Invitations", "Labels"];

export default function TemplateLibraryPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: "", category: "Business Cards", dimensions: "" });

  const handleUploadTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const template = {
      id: `TMP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTemplate.title, category: newTemplate.category,
      dimensions: newTemplate.dimensions, downloads: 0, status: "New",
      image: `https://picsum.photos/seed/${newTemplate.title.replace(/\s/g, "")}/400/300`,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setTemplates([template, ...templates]);
    setIsUploadOpen(false);
    setNewTemplate({ title: "", category: "Business Cards", dimensions: "" });
    toast({ title: "Template Uploaded", description: `${template.title} has been added to the library.` });
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Template Library</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Manage and organize design templates for your clients.
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              Upload Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>Upload New Template</DialogTitle>
              <DialogDescription>Add a new design template to the library.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadTemplate} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={newTemplate.title} onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })} placeholder="Template name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0061FF] focus:ring-2 focus:ring-[#0061FF]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                >
                  {categories.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input id="dimensions" placeholder="e.g. 3.5 x 2 in" value={newTemplate.dimensions} onChange={(e) => setNewTemplate({ ...newTemplate, dimensions: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="file">Upload File</Label>
                <Input id="file" type="file" />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                <Button type="submit">Upload Template</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "border-[#0061FF] bg-[#0061FF] text-white shadow-sm shadow-blue-600/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Search + filter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition-all focus:border-[#0061FF] focus:ring-2 focus:ring-[#0061FF]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0" onClick={() => toast({ title: "Filter", description: "Advanced filters coming soon." })}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
          <div className="mb-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <Layout className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600 dark:text-slate-400">No templates found</p>
          <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group overflow-hidden transition-all hover:shadow-md">
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={template.image}
                  alt={template.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Hover actions overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-md transition-transform hover:scale-105" title="Preview">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-md transition-transform hover:scale-105" title="Edit">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {/* Status badge */}
                {STATUS_BADGE[template.status] && (
                  <div className="absolute left-2.5 top-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-sm ${STATUS_BADGE[template.status]}`}>
                      {template.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <CardContent className="p-4">
                <div className="mb-2.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {template.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {template.category} · {template.dimensions}
                    </p>
                  </div>
                  <button className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1 font-medium text-slate-500">
                    <Download className="h-3 w-3" />
                    <span>{template.downloads.toLocaleString()} uses</span>
                  </div>
                  <span>Updated {template.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
