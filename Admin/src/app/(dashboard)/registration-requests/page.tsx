"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

const initialRequests = [
  { id: "REG-2024-001", companyName: "Himalayan Java Coffee", contactPerson: "Gagan Pradhan", email: "gagan@himalayanjava.com", phone: "+977 9801234567", date: "2024-03-10", status: "Pending", type: "Corporate" },
  { id: "REG-2024-002", companyName: "Bhatbhateni Supermarket", contactPerson: "Min Bahadur Gurung", email: "info@bbsm.com.np", phone: "+977 01-4412345", date: "2024-03-09", status: "Approved", type: "Retail" },
  { id: "REG-2024-003", companyName: "WorldLink Communications", contactPerson: "Dileep Agrawal", email: "corporate@worldlink.com.np", phone: "+977 9801555555", date: "2024-03-08", status: "Rejected", type: "ISP" },
  { id: "REG-2024-004", companyName: "Goldstar Shoes", contactPerson: "Kiran Kumar Shrestha", email: "sales@goldstar.com.np", phone: "+977 9851000000", date: "2024-03-08", status: "Pending", type: "Manufacturing" },
  { id: "REG-2024-005", companyName: "Pathao Nepal", contactPerson: "Asheems Man Singh Basnyat", email: "partners@pathao.com", phone: "+977 9801900000", date: "2024-03-07", status: "Pending", type: "Tech" },
];

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  Approved: { badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400", dot: "bg-emerald-500" },
  Rejected: { badge: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400", dot: "bg-red-500" },
  Pending: { badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400", dot: "bg-amber-500" },
};

export default function RegistrationRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState("");

  const handleApprove = (id: string) => {
    setRequests(requests.map((req) => req.id === id ? { ...req, status: "Approved" } : req));
    toast({ title: "Request Approved ✓", description: `Registration ${id} approved.` });
  };

  const handleReject = (id: string) => {
    setRequests(requests.map((req) => req.id === id ? { ...req, status: "Rejected" } : req));
    toast({ title: "Request Rejected", description: `Registration ${id} rejected.`, variant: "destructive" });
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Registration Requests</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Manage and review new client registration applications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Filter", description: "Advanced filters coming soon." })}>
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            Export List
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Requests", value: requests.length, icon: Building2, bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-600 dark:text-blue-400" },
          { label: "Pending Review", value: requests.filter((r) => r.status === "Pending").length, icon: Calendar, bg: "bg-amber-50 dark:bg-amber-900/20", color: "text-amber-600 dark:text-amber-400" },
          { label: "Approved", value: requests.filter((r) => r.status === "Approved").length, icon: CheckCircle, bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "text-emerald-600 dark:text-emerald-400" },
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

      {/* Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company or contact…"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition-all focus:border-[#0061FF] focus:bg-white focus:ring-2 focus:ring-[#0061FF]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 dark:border-slate-800">
                <tr className="bg-slate-50/80 dark:bg-slate-800/40">
                  {["Request ID", "Company", "Contact Info", "Date", "Status", "Actions"].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${i === 5 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Building2 className="h-8 w-8 opacity-40" />
                        <p className="font-medium text-slate-500">No requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.map((req) => {
                  const s = STATUS_STYLES[req.status];
                  return (
                    <tr key={req.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{req.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-900 dark:text-white">{req.companyName}</span>
                          <span className="text-xs text-slate-500">{req.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{req.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 shrink-0" />
                            {req.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{req.date}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {req.status === "Pending" && (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20" onClick={() => handleApprove(req.id)} title="Approve">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" onClick={() => handleReject(req.id)} title="Reject">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
