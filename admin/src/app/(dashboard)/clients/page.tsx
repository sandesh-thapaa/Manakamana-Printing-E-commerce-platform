"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Phone, Mail, Building2 } from "lucide-react";

const mockClients = [
  {
    id: "CL-1051",
    name: "ABC Public School",
    phone: "9800000000",
    email: "admin@abcschool.edu.np",
    status: "Active",
  },
  {
    id: "CL-2094",
    name: "Digital Solutions Ltd",
    phone: "9800001234",
    email: "hello@digitalsolutions.com",
    status: "Active",
  },
  {
    id: "CL-3321",
    name: "Panchakanya Group",
    phone: "9800028877",
    email: "procurement@panchakanya.com",
    status: "Dormant",
  },
];

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0061FF]">
          Client Operations
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          Clients Directory
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track approved businesses, review profiles, and monitor engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Total Clients", value: "124", icon: Users },
          { label: "Active This Month", value: "68", icon: Building2 },
          { label: "Pending Follow-ups", value: "9", icon: Phone },
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg font-semibold">Client List</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="h-9 pl-9" placeholder="Search by client or phone" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockClients.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {client.name}
                      </div>
                      <div className="text-xs text-slate-500">{client.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5" />
                        {client.phone}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="h-3.5 w-3.5" />
                        {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={client.status === "Active" ? "default" : "secondary"}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm">
                        View Profile
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
