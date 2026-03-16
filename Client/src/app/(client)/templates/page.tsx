"use client";

import { useState } from "react";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { notify } from "@/utils/notifications";
import { sendWhatsApp, buildCustomDesignMessage } from "@/utils/whatsapp";
import { SERVICES } from "@/constants";
import { FiUploadCloud, FiGrid, FiEdit3, FiChevronRight } from "react-icons/fi";
import Image from "next/image";

const categoryIcons: Record<string, string> = {
    "Visiting Cards": "🪪",
    "Letterheads": "📋",
    "Envelopes": "✉️",
    "ID Cards": "🎫",
    "Garment Tags": "🏷️",
};

const getCategoryTheme = (category: string) => {
    switch (category) {
        case "Visiting Cards": return "bg-[#fde8e8]";
        case "Letterheads": return "bg-[#e8f0fe]";
        case "Envelopes": return "bg-[#fef3e8]";
        case "ID Cards": return "bg-[#e8fdf0]";
        case "Garment Tags": return "bg-[#fde8ff]";
        default: return "bg-[#f1f5f9]";
    }
};

type Tab = "free" | "custom";

export default function TemplatesPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<Tab>("free");
    const [activeCategory, setActiveCategory] = useState("All");
    const [customDesignType, setCustomDesignType] = useState("");
    const [customDesignFile, setCustomDesignFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    const categories = ["All", ...TEMPLATE_CATEGORIES];
    const filtered = activeCategory === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === activeCategory);

    const handleDownload = (imageSrc: string, name: string) => {
        const link = document.createElement("a");
        link.href = imageSrc;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        notify.success(`"${name}" download started!`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setCustomDesignFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleRemoveFile = () => {
        setCustomDesignFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleCustomDesign = async () => {
        if (!customDesignType) {
            notify.error("Please select a design type first.");
            return;
        }
        if (!customDesignFile) {
            notify.error("Please attach your design image file.");
            return;
        }

        setIsSending(true);

        // Try to copy image to clipboard so user can paste in WhatsApp
        try {
            const arrayBuffer = await customDesignFile.arrayBuffer();
            const clipboardItem = new ClipboardItem({
                [customDesignFile.type]: new Blob([arrayBuffer], { type: customDesignFile.type }),
            });
            await navigator.clipboard.write([clipboardItem]);
            notify.success("✅ Image copied to clipboard! Paste it (Ctrl+V) in the WhatsApp chat.");
        } catch {
            // Clipboard API may be blocked — fall back to instructions
            notify.whatsapp("WhatsApp will open now. Please manually attach your design image in the chat.");
        }

        const message = buildCustomDesignMessage({
            clientId: user?.clientId || "N/A",
            designType: customDesignType,
            fileName: customDesignFile.name,
        });

        setTimeout(() => {
            sendWhatsApp(message);
            setIsSending(false);
        }, 900);
    };

    const sidebarItems: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
        {
            id: "free",
            label: "Free Design Templates",
            icon: <FiGrid className="w-5 h-5" />,
            description: "Browse & download ready-made templates",
        },
        {
            id: "custom",
            label: "Submit Custom Design",
            icon: <FiEdit3 className="w-5 h-5" />,
            description: "Upload your own design & send to admin",
        },
    ];

    return (
        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
            {/* Page Header */}
            <div className="text-center pb-2 mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Design Centre</h2>
                <div className="h-[4px] mt-3 rounded-full w-20 sm:w-28 md:w-32 bg-blue-500 my-4 mx-auto" />
                <p className="max-w-full md:max-w-xl text-center mx-auto text-[#64748b] text-[0.93rem] md:text-[0.875rem] mt-1.5">
                    Browse our free professional templates or submit your own custom design to get started.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[0.7rem] font-semibold tracking-[0.08em] text-[#94a3b8] uppercase">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-[#1a56db]">Design Centre</span>
                </div>
            </div>

            {/* Two-column layout: Sidebar + Content */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* ── Sidebar ── */}
                <aside className="lg:w-64 xl:w-72 shrink-0">
                    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-gradient-to-r from-[#1a56db] to-[#2563eb]">
                            <p className="text-white font-bold text-[0.8rem] uppercase tracking-widest">Options</p>
                        </div>
                        <nav className="p-2 flex flex-row lg:flex-col gap-2">
                            {sidebarItems.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group cursor-pointer ${isActive
                                            ? "bg-gradient-to-r from-[#1a56db] to-[#2563eb] text-white shadow-md"
                                            : "hover:bg-[#f1f5f9] text-[#475569]"
                                            }`}
                                    >
                                        <span className={`shrink-0 ${isActive ? "text-white" : "text-[#1a56db]"}`}>
                                            {item.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-[0.8rem] leading-tight ${isActive ? "text-white" : "text-[#0f172a]"}`}>
                                                {item.label}
                                            </p>
                                            <p className={`text-[0.68rem] mt-0.5 hidden sm:block ${isActive ? "text-blue-100" : "text-[#94a3b8]"}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                        <FiChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-white translate-x-0.5" : "text-[#cbd5e1] group-hover:text-[#1a56db]"}`} />
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Info card */}
                        <div className="mx-3 mb-3 p-3 bg-[#f0f4ff] rounded-xl border border-[#c7d9fd]">
                            <p className="text-[0.72rem] font-semibold text-[#1a56db] mb-1">💡 Tip</p>
                            <p className="text-[0.7rem] text-[#475569] leading-relaxed">
                                Download a free template, customize it, then submit it as a Custom Design!
                            </p>
                        </div>
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <div className="flex-1 min-w-0">

                    {/* ══ FREE TEMPLATES TAB ══ */}
                    {activeTab === "free" && (
                        <div>
                            {/* Tab header */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a56db] to-[#2563eb] flex items-center justify-center">
                                    <FiGrid className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[1.05rem] text-[#0f172a]">Free Design Templates</h3>
                                    <p className="text-[0.75rem] text-[#64748b]">Download and customize for your brand</p>
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-2 flex-wrap mb-6">
                                {categories.map((cat) => {
                                    const isActive = activeCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-3 py-1 md:px-[1.125rem] md:py-[0.4rem] rounded-[50px] font-semibold text-[0.78rem] cursor-pointer transition-all duration-200 border-[1.5px] ${isActive
                                                ? "border-transparent bg-gradient-to-r from-[#1a56db] to-[#2563eb] text-white"
                                                : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-gray-50"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Template Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                                {filtered.map((template) => (
                                    <div key={template.id} className="card overflow-hidden">
                                        <div className={`h-[110px] sm:h-[130px] ${getCategoryTheme(template.category)} flex flex-col items-center justify-center gap-2 relative overflow-hidden cursor-pointer`}>
                                            {template.image ? (
                                                <Image src={template.image} alt={template.name} fill className="object-cover" />
                                            ) : (
                                                <>
                                                    <span className="text-[2rem] sm:text-[2.2rem]">{categoryIcons[template.category] || "📄"}</span>
                                                    <span className="text-[0.6rem] bg-black/[0.06] px-2 py-0.5 rounded font-semibold text-[#475569]">TEMPLATE</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="p-2.5 sm:p-3.5">
                                            <h3 className="font-bold text-[0.83rem] text-[#0f172a] mb-1">{template.name}</h3>
                                            <p className="text-[0.68rem] text-[#e91e8c] font-semibold mb-3">Free Design Available</p>
                                            <button
                                                className="btn-primary w-full py-1.5 px-2 text-[0.7rem] font-bold"
                                                onClick={() => template.image
                                                    ? handleDownload(template.image, template.name)
                                                    : notify.error("No image available to download.")
                                                }
                                            >
                                                ⬇ Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTA to switch to custom tab */}
                            <div className="mt-8 p-4 bg-gradient-to-r from-[#f0f4ff] to-[#fde8ff] rounded-2xl border border-[#c7d9fd] flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex-1">
                                    <p className="font-bold text-[0.9rem] text-[#0f172a]">Have your own design ready?</p>
                                    <p className="text-[0.78rem] text-[#64748b] mt-0.5">Upload it and send directly to our admin via WhatsApp.</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab("custom")}
                                    className="btn-primary py-2 px-5 text-[0.82rem] whitespace-nowrap shrink-0"
                                >
                                    🎨 Submit Custom Design →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══ CUSTOM DESIGN TAB ══ */}
                    {activeTab === "custom" && (
                        <div>
                            {/* Tab header */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center">
                                    <FiEdit3 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[1.05rem] text-[#0f172a]">Submit Custom Design</h3>
                                    <p className="text-[0.75rem] text-[#64748b]">Upload your finalized design & send to admin via WhatsApp</p>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
                                {["⬇️ Download a template", "✏️ Edit in design software", "💬 Upload & Send to admin"].map((step, i) => (
                                    <div key={i} className="bg-white rounded-xl p-4 text-center border border-[#e2e8f0] shadow-sm">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a56db] to-[#2563eb] text-white text-[0.72rem] font-bold flex items-center justify-center mx-auto mb-2">
                                            {i + 1}
                                        </div>
                                        <div className="text-[0.82rem] font-semibold text-[#0f172a]">{step}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Form card */}
                            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 sm:p-7">

                                {/* Design Type */}
                                <div className="form-group mb-5">
                                    <label className="form-label">Design Type <span className="text-red-500">*</span></label>
                                    <select
                                        value={customDesignType}
                                        onChange={(e) => setCustomDesignType(e.target.value)}
                                        className="form-input appearance-none"
                                    >
                                        <option value="">Select design type…</option>
                                        {SERVICES.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>

                                {/* File Upload */}
                                <div className="form-group mb-6">
                                    <label className="form-label">Attach Design Image <span className="text-red-500">*</span></label>

                                    {!customDesignFile ? (
                                        <label className="flex flex-col items-center justify-center gap-2 py-10 px-4 rounded-xl border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc] cursor-pointer hover:border-[#1a56db] hover:bg-[#eff6ff] transition-colors">
                                            <FiUploadCloud className="w-8 h-8 text-[#1a56db]" />
                                            <span className="text-[0.85rem] font-semibold text-[#475569]">Click to upload your design</span>
                                            <span className="text-[0.72rem] text-[#94a3b8]">PNG, JPG, PDF up to 10MB</span>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    ) : (
                                        <div className="rounded-xl border border-[#c7d9fd] bg-[#f0f4ff] p-4 flex gap-4 items-start">
                                            {/* Image preview */}
                                            {previewUrl && (
                                                <img
                                                    src={previewUrl}
                                                    alt="Design preview"
                                                    className="w-20 h-20 object-cover rounded-lg border border-[#e2e8f0] shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-[0.85rem] text-[#0f172a] truncate">{customDesignFile.name}</p>
                                                <p className="text-[0.72rem] text-[#64748b] mt-0.5">
                                                    {(customDesignFile.size / 1024).toFixed(1)} KB &bull; Ready to send
                                                </p>
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <span className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                        ✓ File selected
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleRemoveFile}
                                                className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-[#94a3b8] hover:text-red-500 transition-colors cursor-pointer"
                                                title="Remove file"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* WhatsApp note */}
                                <div className="flex items-start gap-3 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl mb-6">
                                    <span className="text-lg shrink-0">📋</span>
                                    <p className="text-[0.78rem] text-[#166534] leading-relaxed">
                                        <strong>How it works:</strong> When you click Send, your image will be <strong>copied to clipboard</strong> automatically and WhatsApp will open. Just <strong>paste (Ctrl+V)</strong> the image directly in the chat before sending the message.
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleCustomDesign}
                                        disabled={isSending}
                                        className="btn-primary flex-1 py-3 px-6 text-[0.88rem] font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSending ? "⏳ Opening WhatsApp…" : "💬 Send Design via WhatsApp"}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("free")}
                                        className="py-3 px-5 rounded-xl border border-[#e2e8f0] text-[0.82rem] font-semibold text-[#475569] hover:bg-[#f8fafc] transition-colors cursor-pointer"
                                    >
                                        ← Back to Templates
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
