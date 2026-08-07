import { getAnggota } from "./actions";
import { AnggotaClient } from "./client";

export const metadata = {
  title: "Data Anggota",
};

export default async function AnggotaPage() {
  const data = await getAnggota();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Anggota</h1>
        <p className="text-muted-foreground">
          Kelola data anggota organisasi dan koperasi.
        </p>
      </div>
      <AnggotaClient data={data} />
    </div>
  );
}
