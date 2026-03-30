"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const recentOrders = [
  {
    id: "#ORD-7721",
    client: "Kantipur Media",
    service: "Brochure Printing",
    amount: "NPR 15,000",
    status: "Processing",
    statusColor: "bg-blue-100 text-blue-600",
  },
  {
    id: "#ORD-7722",
    client: "Ncell Axiata",
    service: "Vinyl Banners",
    amount: "NPR 45,000",
    status: "Placed",
    statusColor: "bg-amber-100 text-amber-600",
  },
  {
    id: "#ORD-7723",
    client: "Panchakanya Group",
    service: "Business Cards",
    amount: "NPR 5,500",
    status: "Delivered",
    statusColor: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "#ORD-7724",
    client: "Surya Nepal",
    service: "Annual Report",
    amount: "NPR 82,000",
    status: "Processing",
    statusColor: "bg-blue-100 text-blue-600",
  },
  {
    id: "#ORD-7725",
    client: "CloudFactory",
    service: "Stickers",
    amount: "NPR 3,200",
    status: "Placed",
    statusColor: "bg-amber-100 text-amber-600",
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
    toast({
      title: "Copied to clipboard",
      description: `Design ID ${generatedId} copied to clipboard.`,
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Report Exported",
      description: "Monthly report has been successfully exported to CSV.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0061FF]">
          Operations Overview
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard Command Center
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor revenue, orders, approvals, and production readiness in one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
          <CardContent className="p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Revenue (NPR)
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              रू 450,000
            </h3>
            <div className="mt-2 flex items-center text-xs font-medium text-emerald-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
          <CardContent className="p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Orders
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              124
            </h3>
            <div className="mt-2 flex items-center text-xs font-medium text-slate-500">
              <Clock className="mr-1 h-3 w-3" />
              <span>8 scheduled for today</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
          <CardContent className="p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Registrations
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              12
            </h3>
            <div className="mt-2 flex items-center text-xs font-medium text-amber-500">
              <AlertTriangle className="mr-1 h-3 w-3" />
              <span>4 urgent requests</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
          <CardContent className="p-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unverified Designs
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              08
            </h3>
            <div className="mt-2 flex items-center text-xs font-medium text-[#0061FF]">
              <Palette className="mr-1 h-3 w-3" />
              <span>Needs immediate review</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Orders
            </h2>
            <Button variant="link" className="text-[#0061FF]" onClick={() => router.push("/orders")}>
              View All
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Client Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Service Type
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {order.client}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {order.service}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.statusColor}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions & System Health */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    className="group flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    onClick={handleGenerateId}
                  >
                    <div className="flex items-center gap-3">
                      <Fingerprint className="text-[#0061FF]" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Generate Design ID
                      </span>
                    </div>
                    <ChevronRight className="text-slate-400 transition-transform group-hover:translate-x-1" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Design ID</DialogTitle>
                    <DialogDescription>
                      Use this unique ID for tracking new design projects.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">
                        Link
                      </Label>
                      <Input
                        id="link"
                        defaultValue={generatedId}
                        readOnly
                      />
                    </div>
                    <Button type="submit" size="sm" className="px-3" onClick={copyToClipboard}>
                      <span className="sr-only">Copy</span>
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <DialogDescription className="text-xs">
                      This ID is valid for 24 hours.
                    </DialogDescription>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <button 
                className="group flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                onClick={() => router.push("/registration-requests")}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-[#0061FF]" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Approve New Client
                  </span>
                </div>
                <ChevronRight className="text-slate-400 transition-transform group-hover:translate-x-1" />
              </button>

              <button 
                className="group flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                onClick={handleExportReport}
              >
                <div className="flex items-center gap-3">
                  <FileOutput className="text-[#0061FF]" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Export Monthly Report
                  </span>
                </div>
                <ChevronRight className="text-slate-400 transition-transform group-hover:translate-x-1" />
              </button>
            </CardContent>
          </Card>

          <div className="rounded-xl bg-gradient-to-br from-[#0057e6] to-[#003da8] p-6 text-white shadow-lg shadow-blue-700/30">
            <h2 className="mb-2 text-base font-bold">System Health</h2>
            <p className="mb-4 text-xs text-white/80">
              All printing servers are operating normally with 99.9% uptime.
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[94%] bg-white"></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-80">
              <span>Load Capacity</span>
              <span>94% Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
