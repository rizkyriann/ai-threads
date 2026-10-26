"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

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
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand"><div className="logo-mark" aria-hidden="true"><span /><span /><span /></div><strong>threads<span>studio</span></strong></div>
        <div className="login-lock"><LockKeyhole size={19} /></div>
        <div className="section-kicker">RUANG KERJA PRIBADI</div>
        <h1 id="login-title">Selamat datang kembali.</h1>
        <p className="login-description">Masuk untuk melanjutkan ruang kerja konten Threads-mu.</p>
        <form onSubmit={handleSubmit}>
          <label className="idea-label" htmlFor="owner-password">Password</label>
          <input id="owner-password" className="login-input" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="button-primary login-submit" type="submit" disabled={loading || !password}>{loading ? "Memeriksa…" : <>Masuk ke dashboard <ArrowRight size={15} /></>}</button>
        </form>
        <p className="login-private"><LockKeyhole size={12} /> Akses pribadi melalui jaringan aman.</p>
      </section>
    </main>
  );
}
