"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CircleAlert, ExternalLink, KeyRound, LoaderCircle, RefreshCw, ShieldCheck, Unplug, UserRound } from "lucide-react";

type Account = { threadsUserId: string; username: string; tokenExpiresAt: string | null; connectedAt: string };

export function ThreadsSettings() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadAccount() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/threads", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Status akun tidak bisa dimuat.");
      setAccount(body.account);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Status akun tidak bisa dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadAccount(); }, []);

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) return;
    if (account && !window.confirm(`Ganti koneksi @${account.username} dengan akun pada token baru?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/threads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessToken: token.trim() }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Akun Threads belum berhasil dihubungkan.");
      setAccount(body.account);
      setToken("");
      setNotice(`Akun @${body.account.username} berhasil dihubungkan. Token tidak ditampilkan kembali.`);
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Akun Threads belum berhasil dihubungkan.");
    } finally {
      setBusy(false);
    }
  }

  async function runAccountAction(action: "verify" | "refresh" | "disconnect") {
    if (action === "disconnect" && !window.confirm(`Putuskan koneksi akun @${account?.username}?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(action === "disconnect" ? "/api/threads" : `/api/threads/${action}`, { method: action === "disconnect" ? "DELETE" : "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Aksi koneksi Threads gagal.");
      if (action === "disconnect") {
        setAccount(null);
        setNotice("Koneksi Threads sudah diputuskan.");
      } else if (action === "refresh") {
        await loadAccount();
        setNotice(body.tokenExpiresAt ? `Token diperbarui hingga ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(body.tokenExpiresAt))} WIB.` : "Token berhasil diperbarui.");
      } else {
        setNotice(`Koneksi aktif untuk @${body.username}.`);
      }
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Aksi koneksi Threads gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="settings-page">
      <header className="settings-page-header">
        <button className="profile-back" onClick={() => router.push("/")}><ArrowLeft size={16} /> Kembali ke dashboard</button>
        <div className="section-kicker">PENGATURAN AKUN</div>
        <h1>Koneksi Threads</h1>
        <p>Hubungkan satu akun Threads untuk menerbitkan post secara manual dari dashboard.</p>
      </header>

      <div className="settings-layout">
        <section className="settings-card connection-card">
          <div className="settings-card-heading"><div className="settings-icon"><UserRound size={18} /></div><div><h2>Akun Threads</h2><p>Gunakan access token yang dibuat melalui Meta.</p></div></div>
          {loading ? <div className="settings-loading" role="status"><LoaderCircle size={16} className="spin-icon" /> Memeriksa koneksi…</div> : account ? (
            <div className="connected-account">
              <div className="connected-indicator"><span /><span>Koneksi tersimpan</span></div>
              <div className="connected-identity"><div className="connected-avatar">@</div><div><strong>@{account.username}</strong><small>ID akun {account.threadsUserId}</small></div><ShieldCheck size={19} className="verified-icon" /></div>
              <div className="connection-details"><span>Token kedaluwarsa</span><strong>{account.tokenExpiresAt ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(account.tokenExpiresAt)) : "Belum diketahui dari token"}</strong></div>
              <div className="connection-actions"><button className="button-quiet" disabled={busy} onClick={() => runAccountAction("verify")}><Check size={14} /> Uji koneksi</button><button className="button-quiet" disabled={busy} onClick={() => runAccountAction("refresh")}><RefreshCw size={14} /> Perbarui token</button><button className="button-danger-quiet" disabled={busy} onClick={() => runAccountAction("disconnect")}><Unplug size={14} /> Putuskan</button></div>
            </div>
          ) : (
            <form className="token-connect-form" onSubmit={handleConnect}>
              <div className="connection-empty"><div className="empty-icon"><KeyRound size={19} /></div><strong>Belum ada akun terhubung</strong><span>Token disimpan terenkripsi dan hanya digunakan oleh server.</span></div>
              <label htmlFor="threads-token">Access token Threads</label>
              <input id="threads-token" type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Tempel token Threads di sini" required minLength={20} maxLength={8192} />
              <div className="token-help"><ShieldCheck size={14} /><span>Token tidak akan dikirim kembali ke browser setelah disimpan.</span></div>
              <button className="button-primary" type="submit" disabled={busy || !token.trim()}>{busy ? "Memeriksa token…" : <><KeyRound size={15} /> Hubungkan akun</>}</button>
            </form>
          )}
          {error && <div className="settings-alert settings-alert-error" role="alert"><CircleAlert size={15} />{error}</div>}
          {notice && <div className="settings-alert settings-alert-success" role="status"><Check size={15} />{notice}</div>}
        </section>

        <aside className="settings-aside">
          <section className="settings-info-card"><div className="settings-icon"><ShieldCheck size={18} /></div><h3>Token tetap di server</h3><p>Token dienkripsi menggunakan AES-256-GCM. Kunci enkripsi disimpan di environment server dan token tidak pernah dikirim kembali ke UI.</p></section>
          <section className="settings-info-card settings-steps"><div className="section-kicker">SEBELUM MENGHUBUNGKAN</div><h3>Siapkan token dari Meta</h3><ol><li>Buat token Threads dari dashboard aplikasi Meta.</li><li>Pastikan token punya izin membaca profil dan menerbitkan post.</li><li>Tempel token di form ini; dashboard akan memvalidasi akun.</li></ol><a href="https://developers.facebook.com/docs/threads/" target="_blank" rel="noreferrer">Dokumentasi Threads API <ExternalLink size={13} /></a></section>
        </aside>
      </div>
    </main>
  );
}
