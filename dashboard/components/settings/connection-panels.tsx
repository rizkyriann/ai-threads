import { FormEvent, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";

export type Account = {
  threadsUserId: string;
  username: string;
  tokenExpiresAt: string | null;
  connectedAt: string;
};
type ConnectedAccountProps = {
  account: Account;
  busy: boolean;
  onAction: (action: "verify" | "refresh" | "disconnect") => void;
};

export function ConnectedAccountPanel({ account, busy, onAction }: ConnectedAccountProps) {
  return (
    <div className="connected-account">
      <div className="connected-indicator">
        <span />
        <span>Koneksi tersimpan</span>
      </div>
      <div className="connected-identity">
        <div className="connected-avatar">@</div>
        <div>
          <strong>@{account.username}</strong>
          <small>ID akun {account.threadsUserId}</small>
        </div>
        <ShieldCheck size={19} className="verified-icon" />
      </div>
      <div className="connection-details">
        <span>Token kedaluwarsa</span>
        <strong>
          {account.tokenExpiresAt
            ? new Intl.DateTimeFormat("id-ID", {
                dateStyle: "medium",
                timeZone: "Asia/Jakarta",
              }).format(new Date(account.tokenExpiresAt))
            : "Belum diketahui dari token"}
        </strong>
      </div>
      <div className="connection-actions">
        <button className="button-quiet" disabled={busy} onClick={() => onAction("verify")}>
          <Check size={14} /> Uji koneksi
        </button>
        <button className="button-quiet" disabled={busy} onClick={() => onAction("refresh")}>
          <RefreshCw size={14} /> Perbarui token
        </button>
        <button
          className="button-danger-quiet"
          disabled={busy}
          onClick={() => onAction("disconnect")}
        >
          <Unplug size={14} /> Putuskan
        </button>
      </div>
    </div>
  );
}

export function TokenConnectForm({
  token,
  busy,
  onTokenChange,
  onSubmit,
}: {
  token: string;
  busy: boolean;
  onTokenChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <form className="token-connect-form" onSubmit={onSubmit}>
      <div className="connection-empty">
        <div className="empty-icon">
          <KeyRound size={19} />
        </div>
        <strong>Belum ada akun terhubung</strong>
        <span>Token disimpan terenkripsi dan hanya digunakan oleh server.</span>
      </div>
      <label htmlFor="threads-token">Access token Threads</label>
      <div className="relative">
        <input
          id="threads-token"
          className="min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm pr-12"
          type={visible ? "text" : "password"}
          autoComplete="off"
          value={token}
          onChange={(event) => onTokenChange(event.target.value)}
          placeholder="Tempel token Threads di sini"
          required
          minLength={20}
          maxLength={8192}
        />
        <button
          type="button"
          className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Sembunyikan token" : "Tampilkan token"}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      <div className="token-help">
        <ShieldCheck size={14} />
        <span>Token tidak akan dikirim kembali ke browser setelah disimpan.</span>
      </div>
      <button className="button-primary" type="submit" disabled={busy || !token.trim()}>
        {busy ? (
          "Memeriksa token…"
        ) : (
          <>
            <KeyRound size={15} /> Hubungkan akun
          </>
        )}
      </button>
    </form>
  );
}

export function SettingsAside() {
  return (
    <aside className="settings-aside">
      <section className="settings-info-card">
        <div className="settings-icon">
          <ShieldCheck size={18} />
        </div>
        <h3>Token tetap di server</h3>
        <p>
          Token dienkripsi menggunakan AES-256-GCM. Kunci enkripsi disimpan di environment server
          dan token tidak pernah dikirim kembali ke UI.
        </p>
      </section>
      <section className="settings-info-card settings-steps">
        <div className="section-kicker">SEBELUM MENGHUBUNGKAN</div>
        <h3>Siapkan token dari Meta</h3>
        <ol>
          <li>Buat token Threads dari dashboard aplikasi Meta.</li>
          <li>Pastikan token punya izin membaca profil dan menerbitkan post.</li>
          <li>Tempel token di form ini; dashboard akan memvalidasi akun.</li>
        </ol>
        <a href="https://developers.facebook.com/docs/threads/" target="_blank" rel="noreferrer">
          Dokumentasi Threads API <ExternalLink size={13} />
        </a>
      </section>
    </aside>
  );
}
