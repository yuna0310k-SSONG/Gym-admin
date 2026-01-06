import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0f1115]">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 text-[#e5e7eb]">{children}</main>
      </div>
    </div>
  );
}

