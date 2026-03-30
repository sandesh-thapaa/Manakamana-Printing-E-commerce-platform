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

// Mock data for orders
const initialOrders = [
  {
    id: "ORD-7721",
    client: "Kantipur Media",
    service: "Brochure Printing",
    amount: "NPR 15,000",
    date: "2024-03-10",
    dueDate: "2024-03-15",
    status: "Processing",
    priority: "High",
  },
  {
    id: "ORD-7722",
    client: "Ncell Axiata",
    service: "Vinyl Banners",
    amount: "NPR 45,000",
    date: "2024-03-09",
    dueDate: "2024-03-12",
    status: "Placed",
    priority: "Medium",
  },
  {
    id: "ORD-7723",
    client: "Panchakanya Group",
    service: "Business Cards",
    amount: "NPR 5,500",
    date: "2024-03-08",
    dueDate: "2024-03-10",
    status: "Delivered",
    priority: "Low",
  },
  {
    id: "ORD-7724",
    client: "Surya Nepal",
    service: "Annual Report",
    amount: "NPR 82,000",
    date: "2024-03-08",
    dueDate: "2024-03-20",
    status: "Designing",
    priority: "High",
  },
  {
    id: "ORD-7725",
    client: "CloudFactory",
    service: "Stickers",
    amount: "NPR 3,200",
    date: "2024-03-07",
    dueDate: "2024-03-14",
    status: "Printing",
    priority: "Medium",
  },
  {
    id: "ORD-7726",
    client: "Daraz Nepal",
    service: "Packaging Boxes",
    amount: "NPR 120,000",
    date: "2024-03-06",
    dueDate: "2024-03-25",
    status: "Placed",
    priority: "High",
  },
  {
    id: "ORD-7727",
    client: "Pathao",
    service: "Rider Vests",
    amount: "NPR 55,000",
    date: "2024-03-05",
    dueDate: "2024-03-18",
    status: "Ready",
    priority: "Medium",
  },
];

export default function OrderManagementPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    client: "",
    service: "",
    amount: "",
    priority: "Medium",
    dueDate: "",
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      client: newOrder.client,
      service: newOrder.service,
      amount: `NPR ${newOrder.amount}`,
      date: new Date().toISOString().split("T")[0],
      dueDate: newOrder.dueDate,
      status: "Placed",
      priority: newOrder.priority,
    };
    setOrders([order, ...orders]);
    setIsNewOrderOpen(false);
    setNewOrder({
      client: "",
      service: "",
      amount: "",
      priority: "Medium",
      dueDate: "",
    });
    toast({
      title: "Order Created",
      description: `Order ${order.id} for ${order.client} has been created successfully.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Placed":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "Designing":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "Processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Printing":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "Ready":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "Delivered":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
      case "Medium":
        return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400";
      case "Low":
        return "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400";
      default:
        return "text-slate-600";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    active: orders.filter((o) => ["Placed", "Designing", "Processing", "Printing"].includes(o.status)).length,
    ready: orders.filter((o) => o.status === "Ready").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0061FF]">
          Fulfillment
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          Order Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track and manage print orders from placement to delivery.
        </p>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div />
        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0061FF] hover:bg-[#0050d5] gap-2">
              <Plus className="h-4 w-4" />
              Create New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Enter the details for the new print order.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Client
                </Label>
                <Input
                  id="client"
                  value={newOrder.client}
                  onChange={(e) => setNewOrder({ ...newOrder, client: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service" className="text-right">
                  Service
                </Label>
                <Input
                  id="service"
                  value={newOrder.service}
                  onChange={(e) => setNewOrder({ ...newOrder, service: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newOrder.dueDate}
                  onChange={(e) => setNewOrder({ ...newOrder, dueDate: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <select
                  id="priority"
                  className="col-span-3 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                  value={newOrder.priority}
                  onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Create Order</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Orders
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </h3>
              </div>
              <div className="rounded-full bg-slate-100 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  In Production
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.active}
                </h3>
              </div>
              <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Printer className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Ready for Pickup
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.ready}
                </h3>
              </div>
              <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Truck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Completed
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.delivered}
                </h3>
              </div>
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">Orders</CardTitle>
              <div className="flex gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
                {["All", "Processing", "Delivered"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#0061FF] focus:ring-1 focus:ring-[#0061FF] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => toast({ title: "Filter", description: "Filter functionality coming soon." })}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Service</th>
                  <th className="px-6 py-4 font-semibold">Timeline</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {order.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {order.client}
                          </span>
                          <span className={`mt-1 inline-flex w-fit rounded px-1.5 py-0.5 text-[10px] font-medium ${getPriorityColor(order.priority)}`}>
                            {order.priority} Priority
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {order.service}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Ordered: {order.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <AlertCircle className="h-3 w-3" />
                            <span>Due: {order.dueDate}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
