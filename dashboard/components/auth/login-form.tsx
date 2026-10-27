"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/layout/logo-mark";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Tidak bisa masuk.");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Tidak bisa masuk. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper-warmth p-6">
      <section
        className="w-full max-w-md rounded-xl border border-black/10 bg-white p-7"
        aria-labelledby="login-title"
      >
        <div className="mb-12 flex items-center gap-2">
          <LogoMark />
          <strong className="text-sm tracking-tight text-slate-900">
            threads<span className="font-medium text-notion-blue">studio</span>
          </strong>
        </div>
        <div className="mb-5 grid h-10 w-10 place-items-center rounded-lg bg-sky-tint text-notion-blue">
          <LockKeyhole size={19} />
        </div>
        <p className="eyebrow-label">RUANG KERJA PRIBADI</p>
        <h1 id="login-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Selamat datang kembali.
        </h1>
        <p className="mt-2 text-sm leading-6 text-graphite">
          Masuk untuk melanjutkan ruang kerja konten Threads-mu.
        </p>
        <form className="mt-7 space-y-2" onSubmit={handleSubmit}>
          <Label htmlFor="owner-password">Password</Label>
          <Input
            id="owner-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && (
            <p className="pt-1 text-xs text-rose-600" role="alert">
              {error}
            </p>
          )}
          <Button className="mt-3 w-full" type="submit" disabled={loading || !password}>
            {loading ? (
              "Memeriksa..."
            ) : (
              <>
                Masuk ke dashboard <ArrowRight size={15} />
              </>
            )}
          </Button>
        </form>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-stone">
          <LockKeyhole size={12} className="text-emerald-600" /> Akses pribadi melalui jaringan
          aman.
        </p>
      </section>
    </main>
  );
}
