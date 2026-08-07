"use client";

import { useSession } from "next-auth/react";
import { Building, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { data: session } = useSession();

  const organisasiNama = (session as any)?.organisasiNama || "Loading...";
  const username = session?.user?.name || session?.user?.email || "User";
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background/80 backdrop-blur-xl px-6">
      {/* Organization Badge */}
      <div className="flex flex-1 items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 px-3 py-1.5 text-sm font-medium">
          <Building className="h-4 w-4 text-indigo-500" />
          <span className="font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {organisasiNama}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* User Info */}
        <div className="flex items-center gap-3 rounded-full border bg-card pl-3 pr-1 py-1 shadow-sm">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
            {username}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
