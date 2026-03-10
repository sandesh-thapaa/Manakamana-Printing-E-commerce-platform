import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F5F9] font-sans text-slate-900 dark:bg-[#0D1117] dark:text-slate-100">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
        <Header />
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
