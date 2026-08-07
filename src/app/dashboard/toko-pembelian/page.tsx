import { getTokoPembelian } from "./actions";
import { TokoPembelianClient } from "./client";

export const metadata = {
  title: "Data Toko Pembelian",
};

export default async function TokoPembelianPage() {
  const data = await getTokoPembelian();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Toko Pembelian</h1>
        <p className="text-muted-foreground">
          Kelola data toko atau supplier untuk pembelian barang.
        </p>
      </div>
      <TokoPembelianClient data={data} />
    </div>
  );
}
