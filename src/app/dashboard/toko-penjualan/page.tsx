import { getTokoPenjualan } from "./actions";
import { TokoPenjualanClient } from "./client";

export const metadata = {
  title: "Data Toko Penjualan",
};

export default async function TokoPenjualanPage() {
  const data = await getTokoPenjualan();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Toko Penjualan</h1>
        <p className="text-muted-foreground">
          Kelola data toko atau customer untuk penjualan barang.
        </p>
      </div>
      <TokoPenjualanClient data={data} />
    </div>
  );
}
