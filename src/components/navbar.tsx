"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Building, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";

export function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const organisasiNama = (session as any)?.organisasiNama || "Loading...";
  const username = session?.user?.name || session?.user?.email || "User";
  const initial = username.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-xl px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Organization Badge */}
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 px-3 py-1.5 text-sm font-medium">
            <Building className="h-4 w-4 text-indigo-500 hidden sm:block" />
            <span className="font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-[200px]">
              {organisasiNama}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
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

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          
          {/* Sidebar Drawer */}
          <div className="relative flex w-3/4 max-w-xs flex-col bg-background shadow-xl transition-transform duration-300">
            <div className="absolute right-4 top-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8 rounded-full bg-muted/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
