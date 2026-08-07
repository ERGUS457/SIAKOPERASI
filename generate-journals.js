const fs = require('fs');
const path = require('path');

const journals = [
  {
    type: 'pembelian-kredit',
    jenis: 'PEMBELIAN_KREDIT',
    title: 'Pembelian Kredit',
    sources: ['TokoPembelian', 'Anggota'],
    debitMinRows: 1,
    kreditMinRows: 1,
    debitMaxRows: 999,
    kreditMaxRows: 999
  },
  {
    type: 'penjualan',
    jenis: 'PENJUALAN',
    title: 'Penjualan',
    sources: ['TokoPenjualan', 'Anggota'],
    debitMinRows: 2,
    kreditMinRows: 1,
    debitMaxRows: 999,
    kreditMaxRows: 5
  },
  {
    type: 'penerimaan-kas',
    jenis: 'PENERIMAAN_KAS',
    title: 'Penerimaan Kas',
    sources: ['TokoPembelian', 'TokoPenjualan', 'Anggota'],
    debitMinRows: 1,
    kreditMinRows: 1,
    debitMaxRows: 999,
    kreditMaxRows: 999
  },
  {
    type: 'pengeluaran-kas',
    jenis: 'PENGELUARAN_KAS',
    title: 'Pengeluaran Kas',
    sources: ['TokoPembelian', 'TokoPenjualan', 'Anggota'],
    debitMinRows: 1,
    kreditMinRows: 1,
    debitMaxRows: 999,
    kreditMaxRows: 999
  },
  {
    type: 'umum',
    jenis: 'UMUM',
    title: 'Jurnal Umum',
    sources: ['TokoPembelian', 'TokoPenjualan', 'Anggota'],
    debitMinRows: 1,
    kreditMinRows: 1,
    debitMaxRows: 999,
    kreditMaxRows: 999
  }
];

const getActionsContent = (j) => `"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { JenisJurnal, PosisiJurnal } from "@prisma/client";

function getJurnalPrefix(jenis: JenisJurnal) {
  switch (jenis) {
    case "PEMBELIAN_KREDIT": return "PK";
    case "PENJUALAN": return "PJ";
    case "PENERIMAAN_KAS": return "BKM";
    case "PENGELUARAN_KAS": return "BKK";
    case "UMUM": return "JU";
    default: return "JU";
  }
}

export async function submitJurnal(data: any) {
  const session = await auth();
  if (!session?.user?.organisasiId) throw new Error("Unauthorized");
  const organisasiId = session.user.organisasiId;

  const totalDebit = data.debitRows.reduce((sum: number, r: any) => sum + Number(r.nominal), 0);
  const totalKredit = data.kreditRows.reduce((sum: number, r: any) => sum + Number(r.nominal), 0);

  if (totalDebit !== totalKredit) throw new Error("Total Debit dan Kredit tidak seimbang.");
  if (totalDebit === 0) throw new Error("Total tidak boleh 0.");

  const tanggal = new Date(data.tanggal);
  const month = (tanggal.getMonth() + 1).toString().padStart(2, "0");
  const year = tanggal.getFullYear().toString();
  const prefix = getJurnalPrefix("${j.jenis}");
  
  const startOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
  const endOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 0, 23, 59, 59, 999);

  return await prisma.$transaction(async (tx) => {
    const count = await tx.transaksi.count({
      where: {
        organisasiId,
        jenisJurnal: "${j.jenis}",
        tanggal: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    const urutan = (count + 1).toString().padStart(3, "0");
    const nomorTransaksi = \`\${prefix}-\${month}\${year}-\${urutan}\`;

    let tokoPembelianId = null;
    let tokoPenjualanId = null;
    let anggotaId = null;

    if (data.sumberType === 'TOKO_PEMBELIAN') tokoPembelianId = data.sumberId;
    if (data.sumberType === 'TOKO_PENJUALAN') tokoPenjualanId = data.sumberId;
    if (data.sumberType === 'ANGGOTA') anggotaId = data.sumberId;

    const transaksi = await tx.transaksi.create({
      data: {
        nomorTransaksi,
        tanggal,
        jenisJurnal: "${j.jenis}",
        keterangan: data.keterangan,
        organisasiId,
        tokoPembelianId,
        tokoPenjualanId,
        anggotaId,
        detailJurnal: {
          create: [
            ...data.debitRows.map((r: any) => ({
              akunId: r.akunId,
              posisi: "DEBIT" as PosisiJurnal,
              nominal: Number(r.nominal),
              keterangan: r.keterangan || null
            })),
            ...data.kreditRows.map((r: any) => ({
              akunId: r.akunId,
              posisi: "KREDIT" as PosisiJurnal,
              nominal: Number(r.nominal),
              keterangan: r.keterangan || null
            }))
          ]
        }
      }
    });
    return { success: true, data: transaksi };
  });
}
`;

const getPageContent = (j) => {
  let includes = [];
  if (j.sources.includes('TokoPembelian')) includes.push('const tokoPembelian = await prisma.tokoPembelian.findMany({ where: { organisasiId } });');
  if (j.sources.includes('TokoPenjualan')) includes.push('const tokoPenjualan = await prisma.tokoPenjualan.findMany({ where: { organisasiId } });');
  if (j.sources.includes('Anggota')) includes.push('const anggota = await prisma.anggota.findMany({ where: { organisasiId } });');

  return `import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientPage from "./client";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.organisasiId) redirect("/login");
  const organisasiId = session.user.organisasiId;

  const akunOptions = await prisma.akun.findMany({
    where: { organisasiId },
    orderBy: { kodeAkun: 'asc' }
  });

  ${includes.join('\n  ')}

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">${j.title}</h1>
      <ClientPage 
        akunOptions={akunOptions}
        ${j.sources.includes('TokoPembelian') ? 'tokoPembelian={tokoPembelian}' : ''}
        ${j.sources.includes('TokoPenjualan') ? 'tokoPenjualan={tokoPenjualan}' : ''}
        ${j.sources.includes('Anggota') ? 'anggota={anggota}' : ''}
      />
    </div>
  );
}
`;
};

const getClientContent = (j) => `
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DynamicFormRows, JurnalRow } from "@/components/dynamic-form-rows";
import { toast } from "sonner";
import { submitJurnal } from "./actions";

export default function ClientPage({ akunOptions${j.sources.map(s => `, ${s.charAt(0).toLowerCase() + s.slice(1)}`).join('')} }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState("");
  const [sumberType, setSumberType] = useState<string>("");
  const [sumberId, setSumberId] = useState<string>("");

  const [debitRows, setDebitRows] = useState<JurnalRow[]>(
    Array.from({ length: ${j.debitMinRows} }).map(() => ({ id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }))
  );
  
  const [kreditRows, setKreditRows] = useState<JurnalRow[]>(
    Array.from({ length: ${j.kreditMinRows} }).map(() => ({ id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }))
  );

  const totalDebit = debitRows.reduce((sum, r) => sum + Number(r.nominal || 0), 0);
  const totalKredit = kreditRows.reduce((sum, r) => sum + Number(r.nominal || 0), 0);

  const handleAddDebit = () => setDebitRows([...debitRows, { id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }]);
  const handleRemoveDebit = (id: string) => setDebitRows(debitRows.filter(r => r.id !== id));
  const handleChangeDebit = (id: string, field: keyof JurnalRow, value: any) => {
    setDebitRows(debitRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAddKredit = () => setKreditRows([...kreditRows, { id: Math.random().toString(), akunId: "", nominal: 0, keterangan: "" }]);
  const handleRemoveKredit = (id: string) => setKreditRows(kreditRows.filter(r => r.id !== id));
  const handleChangeKredit = (id: string, field: keyof JurnalRow, value: any) => {
    setKreditRows(kreditRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const onSubmit = async () => {
    if (!tanggal) return toast.error("Tanggal wajib diisi");
    ${j.jenis !== 'UMUM' ? 'if (!sumberType || !sumberId) return toast.error("Sumber wajib diisi");' : ''}
    if (totalDebit === 0) return toast.error("Total tidak boleh 0");
    if (totalDebit !== totalKredit) return toast.error("Total Debit dan Kredit tidak seimbang");

    const filledDebit = debitRows.filter(r => r.akunId || r.nominal > 0);
    const filledKredit = kreditRows.filter(r => r.akunId || r.nominal > 0);

    const validDebit = filledDebit.every(r => r.akunId && r.nominal > 0);
    const validKredit = filledKredit.every(r => r.akunId && r.nominal > 0);
    
    if (!validDebit || !validKredit || filledDebit.length === 0 || filledKredit.length === 0) {
      return toast.error("Mohon lengkapi baris jurnal dengan akun dan nominal > 0");
    }

    setLoading(true);
    try {
      await submitJurnal({
        tanggal,
        keterangan,
        sumberType,
        sumberId,
        debitRows: filledDebit,
        kreditRows: filledKredit
      });
      toast.success("Jurnal berhasil disimpan");
      router.push("/dashboard/jurnal");
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tanggal</Label>
          <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </div>
        
        <div className="space-y-2">
          <Label>Sumber Transaksi</Label>
          <div className="flex gap-2">
            <Select value={sumberType} onValueChange={setSumberType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                ${j.sources.includes('TokoPembelian') ? '<SelectItem value="TOKO_PEMBELIAN">Toko Pembelian</SelectItem>' : ''}
                ${j.sources.includes('TokoPenjualan') ? '<SelectItem value="TOKO_PENJUALAN">Toko Penjualan</SelectItem>' : ''}
                ${j.sources.includes('Anggota') ? '<SelectItem value="ANGGOTA">Anggota</SelectItem>' : ''}
                ${j.jenis === 'UMUM' ? '<SelectItem value="LAINNYA">Lainnya / Tanpa Sumber</SelectItem>' : ''}
              </SelectContent>
            </Select>

            {(sumberType && sumberType !== "LAINNYA") && (
              <Select value={sumberId} onValueChange={setSumberId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Pilih Sumber" />
                </SelectTrigger>
                <SelectContent>
                  {sumberType === "TOKO_PEMBELIAN" && tokoPembelian?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.namaToko}</SelectItem>
                  ))}
                  {sumberType === "TOKO_PENJUALAN" && tokoPenjualan?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.namaToko}</SelectItem>
                  ))}
                  {sumberType === "ANGGOTA" && anggota?.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Keterangan</Label>
          <Input placeholder="Keterangan transaksi (opsional)" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
        </div>
      </div>

      <div className="space-y-6">
        <DynamicFormRows
          title="Debit"
          rows={debitRows}
          akunOptions={akunOptions}
          onAddRow={handleAddDebit}
          onRemoveRow={handleRemoveDebit}
          onChangeRow={handleChangeDebit}
          total={totalDebit}
          minRows={${j.debitMinRows}}
          maxRows={${j.debitMaxRows}}
        />

        <DynamicFormRows
          title="Kredit"
          rows={kreditRows}
          akunOptions={akunOptions}
          onAddRow={handleAddKredit}
          onRemoveRow={handleRemoveKredit}
          onChangeRow={handleChangeKredit}
          total={totalKredit}
          minRows={${j.kreditMinRows}}
          maxRows={${j.kreditMaxRows}}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onSubmit} disabled={loading} size="lg">
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </Button>
      </div>
    </div>
  );
}
`;

journals.forEach(j => {
  const dir = path.join(__dirname, 'src/app/dashboard/jurnal', j.type);
  fs.writeFileSync(path.join(dir, 'actions.ts'), getActionsContent(j));
  fs.writeFileSync(path.join(dir, 'page.tsx'), getPageContent(j));
  fs.writeFileSync(path.join(dir, 'client.tsx'), getClientContent(j));
});

console.log('All files generated successfully.');
