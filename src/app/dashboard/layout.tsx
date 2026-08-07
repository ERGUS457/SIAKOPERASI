"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        {/* Sidebar (Desktop) */}
        <aside className="hidden w-64 flex-col sm:flex">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background/50">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
