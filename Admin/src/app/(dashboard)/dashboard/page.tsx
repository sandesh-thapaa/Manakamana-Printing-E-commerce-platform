"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Palette,
  Fingerprint,
  ShieldCheck,
  FileOutput,
  ChevronRight,
  Copy,
  Check,
  Package,
  ArrowUpRight,
  Activity,
} from "lucide-react";

const recentOrders = [
  { id: "#ORD-7721", client: "Kantipur Media", service: "Brochure Printing", amount: "NPR 15,000", status: "Processing", statusColor: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60" },
  { id: "#ORD-7722", client: "Ncell Axiata", service: "Vinyl Banners", amount: "NPR 45,000", status: "Placed", statusColor: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60" },
  { id: "#ORD-7723", client: "Panchakanya Group", service: "Business Cards", amount: "NPR 5,500", status: "Delivered", statusColor: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60" },
  { id: "#ORD-7724", client: "Surya Nepal", service: "Annual Report", amount: "NPR 82,000", status: "Processing", statusColor: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60" },
  { id: "#ORD-7725", client: "CloudFactory", service: "Stickers", amount: "NPR 3,200", status: "Placed", statusColor: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60" },
];

const statCards = [
  {
    label: "Total Revenue",
    value: "रू 4,50,000",
    trend: "+12.5% from last month",
    trendColor: "text-emerald-600",
    trendIcon: TrendingUp,
    icon: TrendingUp,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-l-emerald-500",
  },
  {
    label: "Active Orders",
    value: "124",
    trend: "8 scheduled for today",
    trendColor: "text-slate-500",
    trendIcon: Clock,
    icon: Package,
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-l-blue-500",
  },
  {
    label: "Pending Registrations",
    value: "12",
    trend: "4 urgent requests",
    trendColor: "text-amber-600",
    trendIcon: AlertTriangle,
    icon: AlertTriangle,
    iconBg: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-l-amber-500",
  },
  {
    label: "Unverified Designs",
    value: "08",
    trend: "Needs immediate review",
    trendColor: "text-[#0061FF]",
    trendIcon: Palette,
    icon: Palette,
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-[#0061FF] dark:text-[#4D97FF]",
    borderColor: "border-l-[#0061FF]",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [generatedId, setGeneratedId] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateId = () => {
    const id = `DSN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedId(id);
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedId);
    setIsCopied(true);
    toast({ title: "Copied!", description: `Design ID ${generatedId} copied to clipboard.` });
  };

  const handleExportReport = () => {
    toast({ title: "Report Exported", description: "Monthly report exported to CSV." });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Welcome back — here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className={`border-l-4 ${stat.borderColor}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </h3>
                  <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${stat.trendColor}`}>
                    <stat.trendIcon className="h-3 w-3" />
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <div className={`shrink-0 rounded-xl p-2.5 ${stat.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                  Recent Orders
                </CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">Latest 5 orders across all clients</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-[#0061FF] hover:text-[#0050D5]" onClick={() => router.push("/orders")}>
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Order ID</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Client</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Service</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {order.id}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white">
                        {order.client}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                        {order.service}
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-white">
                        {order.amount}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="group flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-all hover:border-[#0061FF]/30 hover:bg-[#0061FF]/[0.03] dark:border-slate-800 dark:hover:border-[#0061FF]/40"
                    onClick={handleGenerateId}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBF2FF] text-[#0061FF] dark:bg-[#0061FF]/20">
                        <Fingerprint className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Generate Design ID</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generated Design ID</DialogTitle>
                    <DialogDescription>Use this unique ID for tracking new design projects.</DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="link" className="sr-only">Design ID</Label>
                      <Input id="link" defaultValue={generatedId} readOnly className="font-mono" />
                    </div>
                    <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={copyToClipboard}>
                      {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <p className="text-xs text-slate-500">This ID is valid for 24 hours.</p>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <button
                className="group flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-all hover:border-[#0061FF]/30 hover:bg-[#0061FF]/[0.03] dark:border-slate-800 dark:hover:border-[#0061FF]/40"
                onClick={() => router.push("/registration-requests")}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBF2FF] text-[#0061FF] dark:bg-[#0061FF]/20">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Approve New Client</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                className="group flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition-all hover:border-[#0061FF]/30 hover:bg-[#0061FF]/[0.03] dark:border-slate-800 dark:hover:border-[#0061FF]/40"
                onClick={handleExportReport}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBF2FF] text-[#0061FF] dark:bg-[#0061FF]/20">
                    <FileOutput className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Export Monthly Report</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </CardContent>
          </Card>

          {/* System Health */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0061FF] to-[#0040CC] p-5 text-white shadow-lg shadow-blue-600/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -right-2 h-32 w-32 rounded-full bg-white/5" />
            <div className="relative">
              <div className="mb-1 flex items-center gap-2">
                <Activity className="h-4 w-4 text-white/80" />
                <h2 className="text-sm font-semibold">System Health</h2>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-white/70">
                All printing servers operating normally with 99.9% uptime.
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[94%] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-white/60">
                <span>Load Capacity</span>
                <span className="text-white/90">94% Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
