"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-4 py-12">
      <EmptyState
        icon={AlertTriangle}
        title="Halaman belum bisa dimuat"
        description="Terjadi masalah saat mengambil data. Coba muat ulang area ini."
        action={<Button onClick={reset}>Coba lagi</Button>}
      />
    </main>
  );
}
