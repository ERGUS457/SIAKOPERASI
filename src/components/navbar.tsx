"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Building, Menu, X, UserCog, Camera, Loader2, Lock, Mail, User, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Swal from "sweetalert2";

export function Navbar() {
  const { data: session, update: updateSession } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    nama: "",
    username: "",
    email: "",
    newPassword: "",
    organisasiNama: "",
    organisasiAlamat: "",
    organisasiTelepon: "",
    fotoProfil: null as string | null,
  });

  const fetchProfile = () => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setProfileData({
            nama: data.nama || "",
            username: data.username || "",
            email: data.email || "",
            newPassword: "",
            organisasiNama: data.organisasiNama || "",
            organisasiAlamat: data.organisasiAlamat || "",
            organisasiTelepon: data.organisasiTelepon || "",
            fotoProfil: data.fotoProfil || null,
          });
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleOpenEditProfile = () => {
    fetchProfile();
    setIsEditProfileOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ title: "Ukuran Melebihi Batas", text: "Ukuran foto maksimal 2MB.", icon: "warning" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileData((prev) => ({ ...prev, fotoProfil: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const result = await res.json();

      if (res.ok) {
        setIsEditProfileOpen(false);
        await Swal.fire({
          title: "Profil Diperbarui",
          text: "Data pengurus dan koperasi berhasil diperbarui!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        window.location.reload();
      } else {
        Swal.fire({
          title: "Gagal Mengubah Profil",
          text: result.error || "Terjadi kesalahan saat menyimpan data.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ title: "Error", text: "Terjadi kesalahan koneksi server.", icon: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const organisasiNama = profileData.organisasiNama || (session as any)?.organisasiNama || "Koperasi";
  const username = profileData.nama || session?.user?.name || session?.user?.email || "Admin";
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
            <span className="font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-[220px]">
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
              <button className="flex items-center gap-3 rounded-full border bg-card pl-3 pr-1 py-1 shadow-xs hover:bg-accent transition-colors">
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                  {username}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-md overflow-hidden">
                  {profileData.fotoProfil ? (
                    <img src={profileData.fotoProfil} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden shrink-0">
                    {profileData.fotoProfil ? (
                      <img src={profileData.fotoProfil} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="truncate">
                    <h4 className="font-semibold truncate">{username}</h4>
                    <p className="text-xs text-muted-foreground truncate">{profileData.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Koperasi:</span>
                  <p className="text-sm font-semibold truncate">{organisasiNama}</p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleOpenEditProfile}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
                    size="sm"
                  >
                    <UserCog className="h-4 w-4" />
                    Edit Profil & Koperasi
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* EDIT PROFILE MODAL DIALOG */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-indigo-500" />
              Edit Profil Admin & Koperasi
            </DialogTitle>
            <DialogDescription>
              Perbarui informasi admin dan identitas koperasi Anda di sini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
              {/* Foto Profil Section */}
              <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-muted/30">
                <div className="relative group mb-3">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden border-2 border-indigo-500/30">
                    {profileData.fotoProfil ? (
                      <img src={profileData.fotoProfil} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium"
                  >
                    <Camera className="h-5 w-5 mb-0.5" />
                    Ubah
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <label htmlFor="avatar-upload" className="cursor-pointer text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5" /> Unggah Foto Baru (Maks 2MB)
                </label>
              </div>

              {/* Data Admin */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  Identitas Admin
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nama Lengkap Admin</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={profileData.nama}
                        onChange={(e) => setProfileData({ ...profileData, nama: e.target.value })}
                        className="pl-9 h-9 text-sm"
                        placeholder="Nama Admin"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Username</Label>
                    <Input
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="h-9 text-sm"
                      placeholder="Username admin"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Email Admin</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="pl-9 h-9 text-sm"
                      placeholder="email@koperasi.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <Label className="text-xs text-muted-foreground">Password Baru (Opsional)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                      className="pl-9 h-9 text-sm"
                      placeholder="Kosongkan jika tidak ingin mengubah password"
                    />
                  </div>
                </div>
              </div>

              {/* Data Koperasi */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  Identitas Koperasi
                </h4>
                <div className="space-y-1">
                  <Label className="text-xs">Nama Koperasi</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={profileData.organisasiNama}
                      onChange={(e) => setProfileData({ ...profileData, organisasiNama: e.target.value })}
                      className="pl-9 h-9 text-sm"
                      placeholder="Nama Koperasi"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">No. Telepon Koperasi</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={profileData.organisasiTelepon}
                        onChange={(e) => setProfileData({ ...profileData, organisasiTelepon: e.target.value })}
                        className="pl-9 h-9 text-sm"
                        placeholder="08123456789"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Alamat Koperasi</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={profileData.organisasiAlamat}
                        onChange={(e) => setProfileData({ ...profileData, organisasiAlamat: e.target.value })}
                        className="pl-9 h-9 text-sm"
                        placeholder="Jl. Merdeka No. 1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-muted/20 sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
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
