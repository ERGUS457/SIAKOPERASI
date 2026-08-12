"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Building, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Swal from "sweetalert2";

export function Navbar() {
  const { data: session, update } = useSession();
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
          
          {/* User Info with Profile Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-3 rounded-full border bg-card pl-3 pr-1 py-1 shadow-sm hover:bg-accent transition-colors">
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                  {username}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 overflow-hidden">
                  {(session as any)?.user?.fotoProfil ? (
                    <img src={(session as any).user.fotoProfil} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden">
                    {(session as any)?.user?.fotoProfil ? (
                      <img src={(session as any).user.fotoProfil} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{username}</h4>
                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">Informasi Koperasi</h4>
                  <p className="text-sm text-muted-foreground">
                    {organisasiNama}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium leading-none">Ganti Foto Profil</h4>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="text-xs w-full cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        Swal.fire({ title: "Gagal", text: "Ukuran gambar terlalu besar! Maksimal 2MB.", icon: "error" });
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64 = event.target?.result;
                        try {
                          const res = await fetch("/api/upload-profile", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ fotoProfil: base64 }),
                          });
                          if (res.ok) {
                            await update({ fotoProfil: base64 });
                            Swal.fire({ title: "Berhasil", text: "Foto profil berhasil diubah", icon: "success", timer: 1500, showConfirmButton: false }).then(() => {
                              window.location.reload();
                            });
                          } else {
                            Swal.fire({ title: "Gagal", text: "Gagal mengunggah foto profil.", icon: "error" });
                          }
                        } catch (error) {
                          console.error(error);
                          Swal.fire({ title: "Error", text: "Terjadi kesalahan.", icon: "error" });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <p className="text-[10px] text-muted-foreground">Maksimal 2MB (JPG/PNG)</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
