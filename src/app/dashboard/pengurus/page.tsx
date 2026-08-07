import { getPengurus } from "./actions";
import { PengurusClient } from "./client";

export const metadata = {
  title: "Data Pengurus",
};

export default async function PengurusPage() {
  const data = await getPengurus();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Pengurus</h1>
        <p className="text-muted-foreground">
          Kelola data pengurus organisasi Anda.
        </p>
      </div>
      <PengurusClient data={data} />
    </div>
  );
}
