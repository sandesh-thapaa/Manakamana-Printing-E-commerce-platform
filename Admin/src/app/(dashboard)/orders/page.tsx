"use client";

import { useState } from "react";
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
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  Truck,
} from "lucide-react";

const initialOrders = [
  { id: "ORD-7721", client: "Kantipur Media", service: "Brochure Printing", amount: "NPR 15,000", date: "2024-03-10", dueDate: "2024-03-15", status: "Processing", priority: "High" },
  { id: "ORD-7722", client: "Ncell Axiata", service: "Vinyl Banners", amount: "NPR 45,000", date: "2024-03-09", dueDate: "2024-03-12", status: "Placed", priority: "Medium" },
  { id: "ORD-7723", client: "Panchakanya Group", service: "Business Cards", amount: "NPR 5,500", date: "2024-03-08", dueDate: "2024-03-10", status: "Delivered", priority: "Low" },
  { id: "ORD-7724", client: "Surya Nepal", service: "Annual Report", amount: "NPR 82,000", date: "2024-03-08", dueDate: "2024-03-20", status: "Designing", priority: "High" },
  { id: "ORD-7725", client: "CloudFactory", service: "Stickers", amount: "NPR 3,200", date: "2024-03-07", dueDate: "2024-03-14", status: "Printing", priority: "Medium" },
  { id: "ORD-7726", client: "Daraz Nepal", service: "Packaging Boxes", amount: "NPR 120,000", date: "2024-03-06", dueDate: "2024-03-25", status: "Placed", priority: "High" },
  { id: "ORD-7727", client: "Pathao", service: "Rider Vests", amount: "NPR 55,000", date: "2024-03-05", dueDate: "2024-03-18", status: "Ready", priority: "Medium" },
];

const STATUS_STYLES: Record<string, string> = {
  Placed: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300",
  Designing: "bg-purple-50 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  Processing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  Printing: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  Ready: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
  Delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  Cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-400",
};

const PRIORITY_STYLES: Record<string, string> = {
  High: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
  Medium: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
  Low: "text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
};

const STATUS_DOTS: Record<string, string> = {
  Placed: "bg-slate-400", Designing: "bg-purple-500", Processing: "bg-blue-500",
  Printing: "bg-amber-500", Ready: "bg-indigo-500", Delivered: "bg-emerald-500", Cancelled: "bg-red-500",
};

export default function OrderManagementPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ client: "", service: "", amount: "", priority: "Medium", dueDate: "" });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      client: newOrder.client, service: newOrder.service,
      amount: `NPR ${newOrder.amount}`, date: new Date().toISOString().split("T")[0],
      dueDate: newOrder.dueDate, status: "Placed", priority: newOrder.priority,
    };
    setOrders([order, ...orders]);
    setIsNewOrderOpen(false);
    setNewOrder({ client: "", service: "", amount: "", priority: "Medium", dueDate: "" });
    toast({ title: "Order Created", description: `Order ${order.id} for ${order.client} created.` });
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === "All" || o.status === statusFilter);
  });

  const stats = {
    total: orders.length,
    active: orders.filter((o) => ["Placed", "Designing", "Processing", "Printing"].includes(o.status)).length,
    ready: orders.filter((o) => o.status === "Ready").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Order Management</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Track and manage print orders from placement to delivery.
          </p>
        </div>
        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>Enter the details for the new print order.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4 py-2">
              {[
                { label: "Client", id: "client", type: "text", value: newOrder.client, field: "client" },
                { label: "Service", id: "service", type: "text", value: newOrder.service, field: "service" },
                { label: "Amount (NPR)", id: "amount", type: "number", value: newOrder.amount, field: "amount" },
                { label: "Due Date", id: "dueDate", type: "date", value: newOrder.dueDate, field: "dueDate" },
              ].map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <Label htmlFor={f.id}>{f.label}</Label>
                  <Input
                    id={f.id} type={f.type} value={f.value} required
                    onChange={(e) => setNewOrder({ ...newOrder, [f.field]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0061FF] focus:ring-2 focus:ring-[#0061FF]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                  value={newOrder.priority}
                  onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsNewOrderOpen(false)}>Cancel</Button>
                <Button type="submit">Create Order</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Orders", value: stats.total, icon: Package, bg: "bg-slate-100 dark:bg-slate-800", color: "text-slate-600 dark:text-slate-400" },
          { label: "In Production", value: stats.active, icon: Printer, bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-600 dark:text-blue-400" },
          { label: "Ready for Pickup", value: stats.ready, icon: Truck, bg: "bg-indigo-50 dark:bg-indigo-900/20", color: "text-indigo-600 dark:text-indigo-400" },
          { label: "Completed", value: stats.delivered, icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "text-emerald-600 dark:text-emerald-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{s.value}</h3>
                </div>
                <div className={`rounded-xl p-2.5 ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-semibold">Orders</CardTitle>
              <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/50">
                {["All", "Processing", "Delivered"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      statusFilter === status
                        ? "bg-white text-[#0061FF] shadow-sm dark:bg-slate-700 dark:text-[#4D97FF]"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-60">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders…"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition-all focus:border-[#0061FF] focus:bg-white focus:ring-2 focus:ring-[#0061FF]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0" onClick={() => toast({ title: "Filters", description: "Advanced filters coming soon." })}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 dark:border-slate-800">
                <tr className="bg-slate-50/80 dark:bg-slate-800/40">
                  {["Order ID", "Client", "Service", "Timeline", "Amount", "Status", ""].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${i === 6 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Package className="h-8 w-8 opacity-40" />
                        <p className="font-medium text-slate-500">No orders found</p>
                        <p className="text-xs">Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {order.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900 dark:text-white">{order.client}</span>
                        <span className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[order.priority]}`}>
                          {order.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{order.service}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>{order.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                          <AlertCircle className="h-3 w-3" />
                          <span>Due: {order.dueDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{order.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[order.status]}`} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
