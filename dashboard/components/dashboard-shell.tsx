"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Command,
  FileText,
  Hash,
  Home,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Plus,
  Send,
  CalendarClock,
  ChartNoAxesColumn,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  LogOut,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { formatJakartaDateTime, toJakartaDateTimeInput } from "@/lib/jakarta-time";
import { MetricsDashboard } from "@/components/metrics-dashboard";

type Draft = {
  id: string;
  text: string;
  topic: string;
  updated: string;
  status: "Perlu ditinjau" | "Sedang diterbitkan" | "Gagal diterbitkan";
  tone: string;
  profileVersionId: number | null;
  errorMessage?: string | null;
};

type ApiDraft = { id: string; text: string; topic: string; source: "AI" | "MANUAL"; status: "DRAFT" | "PUBLISHING" | "FAILED"; createdAt: string; updatedAt: string; profileVersionId: number | null; errorMessage?: string | null };

function formatUpdated(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

function keepDialogFocus(event: ReactKeyboardEvent<HTMLElement>, onEscape: () => void) {
  if (event.key === "Escape") {
    event.preventDefault();
    onEscape();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex='-1'])");
  const first = focusable.item(0);
  const last = focusable.item(focusable.length - 1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function toDraft(draft: ApiDraft): Draft {
  const status = draft.status === "PUBLISHING" ? "Sedang diterbitkan" : draft.status === "FAILED" ? "Gagal diterbitkan" : "Perlu ditinjau";
  return { id: draft.id, text: draft.text, topic: draft.topic || "Draft Threads", updated: formatUpdated(draft.updatedAt), status, tone: draft.source === "AI" ? "Dibuat AI" : "Manual", profileVersionId: draft.profileVersionId, errorMessage: draft.errorMessage };
}

const navItems: { label: string; icon: LucideIcon; count?: string; disabled?: boolean }[] = [
  { label: "Beranda", icon: Home },
  { label: "Draft", icon: FileText },
  { label: "Jadwal", icon: CalendarDays },
  { label: "Disimpan", icon: Bookmark, disabled: true },
];

function LogoMark() {
  return (
    <div className="logo-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function Sidebar({
  active,
  onNavigate,
  isOpen,
  onClose,
  draftCount,
  onLogout,
}: {
  active: string;
  onNavigate: (label: string) => void;
  isOpen: boolean;
  onClose: () => void;
  draftCount: number;
  onLogout: () => void;
}) {
  return (
    <>
      {isOpen && <button className="mobile-scrim" onClick={onClose} aria-label="Tutup navigasi" />}
      <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`}>
        <div className="brand-row">
          <LogoMark />
          <div className="brand-name">threads<span>studio</span></div>
          <button className="icon-button close-nav" aria-label="Tutup navigasi" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="workspace-switcher" aria-label="Workspace personal">
          <span className="workspace-avatar">R</span>
          <span className="workspace-copy"><strong>Personal</strong><small>Workspace</small></span>
          <ChevronDown size={15} className="muted-icon" />
        </div>

        <div className="nav-label">MENU</div>
        <nav className="main-nav" aria-label="Navigasi utama">
          {navItems.map(({ label, icon: Icon, count, disabled }) => (
            <button
              className={`nav-item${active === label ? " nav-active" : ""}${disabled ? " nav-disabled" : ""}`}
              key={label}
              onClick={() => !disabled && onNavigate(label)}
              aria-current={active === label ? "page" : undefined}
              disabled={disabled}
              title={disabled ? `${label} akan tersedia pada versi berikutnya` : undefined}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {(count || label === "Draft") && <span className="nav-count">{label === "Draft" ? draftCount : count}</span>}
              {disabled && <span className="soon-dot" aria-label="Segera" />}
            </button>
          ))}
        </nav>

        <div className="nav-label tools-label">PREFERENSI</div>
        <nav className="main-nav" aria-label="Preferensi">
          <button className="nav-item" onClick={() => onNavigate("Content profile")}>
            <Settings2 size={18} strokeWidth={1.8} /><span>Content profile</span>
          </button>
          <button className="nav-item" onClick={() => onNavigate("Koneksi Threads")}>
            <MessageCircle size={18} strokeWidth={1.8} /><span>Koneksi Threads</span>
          </button>
          <button className="nav-item" onClick={() => onNavigate("Metrik")}>
            <ChartNoAxesColumn size={18} strokeWidth={1.8} /><span>Metrik</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-nudge">
            <div className="nudge-icon"><Sparkles size={16} /></div>
            <strong>Suara tulisanmu</strong>
            <p>Tambahkan contoh tulisan agar AI lebih memahami suaramu.</p>
            <button onClick={() => onNavigate("Content profile")}>Atur profile <ArrowRight size={14} /></button>
          </div>
          <button className="help-link" onClick={onLogout}><LogOut size={16} /><span>Keluar</span></button>
          <div className="account-row">
            <div className="account-avatar">R</div>
            <div className="account-copy"><strong>Rian</strong><small>Creator pribadi</small></div>
            <MoreHorizontal size={19} className="muted-icon" />
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenu, query, onQueryChange }: { onMenu: () => void; query: string; onQueryChange: (value: string) => void }) {
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <header className="topbar">
      <button className="icon-button menu-toggle" aria-label="Buka navigasi" onClick={onMenu}><Menu size={20} /></button>
      <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Beranda</strong></div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={16} />
          <input ref={searchRef} value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Cari draft..." aria-label="Cari draft" />
          <kbd><Command size={11} /> K</kbd>
        </label>
        <span className="top-avatar" aria-hidden="true">R</span>
      </div>
    </header>
  );
}

function WelcomeHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="welcome-row">
      <div>
        <div className="eyebrow"><span className="live-dot" /> RUANG KERJA PRIBADI</div>
        <h1>Selamat pagi, Rian<span className="wave">.</span></h1>
        <p className="welcome-subtitle">Satu ide bagus bisa jadi awal percakapan.</p>
      </div>
      <button className="button-primary create-button" onClick={onCreate}><Plus size={17} strokeWidth={2.4} /> Buat draft</button>
    </section>
  );
}

function OverviewCards({ draftCount, aiCount, profile, onProfile }: { draftCount: number; aiCount: number; profile: { niche: string; language: string; version: number } | null; onProfile: () => void }) {
  return (
    <section className="overview-grid" aria-label="Ringkasan aktivitas">
      <article className="overview-card review-card">
        <div className="overview-top"><span className="overview-icon icon-lilac"><PenLine size={17} /></span><span className="card-period">RUANG KERJA</span></div>
        <div className="metric-line"><strong>{draftCount.toString().padStart(2, "0")}</strong><span className="metric-change neutral-change">menunggu review</span></div>
        <div className="metric-caption">Draft menunggu review</div>
        <div className="mini-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      </article>
      <article className="overview-card">
        <div className="overview-top"><span className="overview-icon icon-blue"><Clock3 size={17} /></span><span className="card-period">MINGGU INI</span></div>
        <div className="metric-line"><strong>{aiCount.toString().padStart(2, "0")}</strong><span className="metric-change neutral-change">dari {draftCount} draft</span></div>
        <div className="metric-caption">Dibuat dengan AI</div>
        <div className="target-track"><span style={{ width: `${draftCount ? (aiCount / draftCount) * 100 : 0}%` }} /></div>
      </article>
      <article className="overview-card profile-card">
        <div className="overview-top"><span className="overview-icon icon-green"><Hash size={17} /></span><span className="card-period">PROFILE AKTIF</span></div>
        <div className="profile-value">{profile?.niche || "Content profile"}</div>
        <div className="metric-caption">{profile ? `Versi ${profile.version} · ${profile.language}` : "Profile belum diatur"}</div>
        <button className="text-link" onClick={onProfile}>Lihat content profile <ArrowRight size={14} /></button>
      </article>
    </section>
  );
}

function DraftCard({ draft, onEdit, onRegenerate, onPublish, onSchedule, regenerating, publishing, threadsConnected }: { draft: Draft; onEdit: (draft: Draft) => void; onRegenerate: (draft: Draft) => void; onPublish: (draft: Draft) => void; onSchedule: (draft: Draft) => void; regenerating: boolean; publishing: boolean; threadsConnected: boolean }) {
  const count = draft.text.length;
  return (
    <article className="draft-card">
      <div className="draft-card-top">
        <span className={`status-pill ${draft.status === "Perlu ditinjau" ? "status-review" : draft.status === "Gagal diterbitkan" ? "status-failed" : "status-publishing"}`}><span />{draft.status}</span>
      </div>
      <button className="draft-text-button" onClick={() => onEdit(draft)} aria-label={`Edit draft tentang ${draft.topic}`}>
        <p className="draft-text">{draft.text}</p>
      </button>
      <div className="draft-meta"><span className="topic-tag">{draft.topic}</span><span className="tone-tag">{draft.tone}</span></div>
      {draft.errorMessage && <p className="draft-error-message">{draft.errorMessage}</p>}
      <div className="draft-card-footer">
        <span className="updated-time">Diubah {draft.updated}</span>
        <div className="draft-footer-right"><span className={count > 450 ? "character-count near-limit" : "character-count"}>{count}<span> / 500</span></span>{draft.status === "Perlu ditinjau" && draft.tone === "Dibuat AI" && <button className="regenerate-link" onClick={() => onRegenerate(draft)} disabled={regenerating || publishing} aria-label={`Regenerate draft ${draft.topic}`} title="Buat alternatif draft"> <RefreshCw size={12} className={regenerating ? "spin-icon" : ""} /> {regenerating ? "Membuat…" : "Regenerate"}</button>}{draft.status === "Perlu ditinjau" && <button className="edit-link" onClick={() => onEdit(draft)} disabled={publishing}>Edit <ArrowRight size={13} /></button>}{draft.status === "Perlu ditinjau" && threadsConnected && <><button className="schedule-link" onClick={() => onSchedule(draft)} disabled={publishing}><CalendarClock size={13} /> Jadwalkan</button><button className="publish-link" onClick={() => onPublish(draft)} disabled={publishing} aria-label={`Publish sekarang: ${draft.topic}`}>{publishing ? <><RefreshCw size={13} className="spin-icon" /> Mengirim…</> : <><Send size={13} /> Publish</>}</button></>}</div>
      </div>
    </article>
  );
}

function DraftSection({ drafts, onEdit, onCreate, onRegenerate, onPublish, onSchedule, regeneratingId, publishingId, threadsConnected, query }: { drafts: Draft[]; onEdit: (draft: Draft) => void; onCreate: () => void; onRegenerate: (draft: Draft) => void; onPublish: (draft: Draft) => void; onSchedule: (draft: Draft) => void; regeneratingId: string | null; publishingId: string | null; threadsConnected: boolean; query: string }) {
  const [filter, setFilter] = useState("Semua");
  const filteredDrafts = useMemo(() => drafts.filter((draft) => {
    const matchesFilter = filter === "Semua" || (filter === "Dibuat AI" ? draft.tone === "Dibuat AI" : filter === "Gagal diterbitkan" ? draft.status === filter : draft.status === "Perlu ditinjau");
    const matchesQuery = `${draft.text} ${draft.topic} ${draft.tone}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  }), [drafts, filter, query]);
  return (
    <section className="draft-section">
      <div className="section-heading">
        <div><div className="section-kicker">RUANG KERJA</div><h2>Draft kamu <span className="section-count">{drafts.length}</span></h2></div>
        <button className="button-quiet" onClick={onCreate}><Plus size={15} /> Draft baru</button>
      </div>
      <div className="draft-toolbar">
        <div className="filter-tabs" role="group" aria-label="Filter draft">
          {["Semua", "Perlu ditinjau", "Dibuat AI", "Gagal diterbitkan"].map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? "filter-active" : ""} onClick={() => setFilter(item)}>{item}{item === "Perlu ditinjau" && <span>{drafts.filter((draft) => draft.status === "Perlu ditinjau").length}</span>}</button>)}
        </div>
        <button className="sort-button"><ArrowDownRight size={14} /> Terbaru <ChevronDown size={13} /></button>
      </div>
      {filteredDrafts.length ? <div className="draft-grid">{filteredDrafts.map((draft) => <DraftCard key={draft.id} draft={draft} onEdit={onEdit} onRegenerate={onRegenerate} onPublish={onPublish} onSchedule={onSchedule} regenerating={regeneratingId === draft.id} publishing={publishingId === draft.id} threadsConnected={threadsConnected} />)}</div> : <div className="empty-state"><div className="empty-icon"><FileText size={20} /></div><strong>Belum ada draft di sini</strong><span>Coba pilih filter lain atau buat draft baru.</span></div>}
    </section>
  );
}

function SidePanel({ onCreate }: { onCreate: () => void }) {
  return (
    <aside className="right-column">
      <section className="idea-card">
        <div className="idea-header"><div className="idea-spark"><Sparkles size={16} /></div><span>PEMANTIK HARI INI</span></div>
        <h3>Hal kecil yang mengubah cara kerjamu</h3>
        <p>Bagikan satu kebiasaan atau tool sederhana yang ternyata memberi dampak besar.</p>
        <div className="idea-divider" />
        <div className="idea-bottom"><span><MessageCircle size={14} /> Cocok untuk refleksi</span><button onClick={onCreate}>Pakai ide <ArrowRight size={14} /></button></div>
      </section>

      <section className="tip-card">
        <div className="tip-mark">“</div>
        <p>Mulai dari pengalaman nyata. Suara yang spesifik selalu lebih mudah diingat.</p>
        <span>CATATAN UNTUK MENULIS</span>
      </section>

    </aside>
  );
}

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (text: string, count: number) => Promise<void> }) {
  const [idea, setIdea] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      await onCreate(idea.trim(), count);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Draft belum berhasil dibuat.");
      setLoading(false);
    }
  }

  function dismiss() {
    if (loading) return;
    if (idea.trim() && !window.confirm("Buang ide yang belum dibuat menjadi draft?")) return;
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && dismiss()}>
      <section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onKeyDown={(event) => keepDialogFocus(event, dismiss)}>
        <div className="modal-top"><div className="modal-icon"><Sparkles size={18} /></div><button className="icon-button" onClick={dismiss} aria-label="Tutup"><X size={18} /></button></div>
        <div className="section-kicker">MULAI DARI SEBUAH IDE</div><h2 id="create-title">Apa yang ingin kamu ceritakan?</h2>
        <p className="modal-description">Tulis topik atau pemikiran singkat. Nanti kita kembangkan jadi draft dengan gaya tulisanmu.</p>
        <label className="idea-label" htmlFor="new-idea">Ide atau topik</label>
        <textarea id="new-idea" autoFocus value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="Contoh: hal yang kupelajari saat membangun side project..." />
        <div className="modal-form-footer"><span><Sparkles size={13} /> Profile aktif digunakan bila tersedia</span><label>Jumlah <select value={count} onChange={(event) => setCount(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}</select></label></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button-quiet" onClick={dismiss} disabled={loading}>Batal</button><button className="button-primary" disabled={!idea.trim() || loading} onClick={submit}>{loading ? "Sedang membuat…" : <><Sparkles size={15} /> Buat draft <ArrowRight size={14} /></>}</button></div>
      </section>
    </div>
  );
}

function EditModal({ draft, onClose, onSave }: { draft: Draft; onClose: () => void; onSave: (text: string) => Promise<void> }) {
  const [text, setText] = useState(draft.text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSaving(true);
    setError("");
    try {
      await onSave(text);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Draft belum bisa disimpan.");
      setSaving(false);
    }
  }

  function dismiss() {
    if (saving) return;
    if (text !== draft.text && !window.confirm("Buang perubahan yang belum disimpan?")) return;
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && dismiss()}>
      <section className="create-modal edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title" onKeyDown={(event) => keepDialogFocus(event, dismiss)}>
        <div className="modal-top"><div className="section-kicker">{draft.topic.toUpperCase()}</div><button className="icon-button" onClick={dismiss} aria-label="Tutup"><X size={18} /></button></div>
        <h2 id="edit-title">Edit draft</h2>
        <label className="idea-label" htmlFor="edit-draft">Teks post</label>
        <textarea id="edit-draft" autoFocus value={text} onChange={(event) => setText(event.target.value)} maxLength={500} />
        <div className="edit-count" data-over={text.length > 500}>{text.length} / 500 karakter</div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button-quiet" onClick={onClose} disabled={saving}>Batal</button><button className="button-primary" onClick={submit} disabled={saving || !text.trim()}>{saving ? "Menyimpan…" : <><Check size={15} /> Simpan perubahan</>}</button></div>
      </section>
    </div>
  );
}

function ScheduleModal({ draft, onClose, onSave }: { draft: Draft; onClose: () => void; onSave: (scheduledAt: string) => Promise<void> }) {
  const [scheduledAt, setScheduledAt] = useState(() => toJakartaDateTimeInput(new Date(Date.now() + 60 * 60 * 1000)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setSaving(true);
    setError("");
    try {
      await onSave(scheduledAt);
    } catch (scheduleError) {
      setError(scheduleError instanceof Error ? scheduleError.message : "Jadwal belum bisa disimpan.");
      setSaving(false);
    }
  }

  function dismiss() {
    if (!saving) onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && dismiss()}>
      <section className="create-modal schedule-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-title" onKeyDown={(event) => keepDialogFocus(event, dismiss)}>
        <div className="modal-top"><div className="modal-icon"><CalendarClock size={18} /></div><button className="icon-button" onClick={dismiss} aria-label="Tutup" disabled={saving}><X size={18} /></button></div>
        <div className="section-kicker">JADWALKAN POST</div><h2 id="schedule-title">Pilih waktu tayang</h2>
        <p className="modal-description schedule-preview">{draft.text}</p>
        <label className="idea-label" htmlFor="schedule-at">Tanggal dan waktu (WIB)</label>
        <input id="schedule-at" className="schedule-input" type="datetime-local" value={scheduledAt} min={toJakartaDateTimeInput(new Date(Date.now() + 60_000))} onChange={(event) => setScheduledAt(event.target.value)} />
        <p className="schedule-zone-note">Zona waktu Asia/Jakarta (UTC+7). Waktu disimpan dalam UTC.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button-quiet" onClick={dismiss} disabled={saving}>Batal</button><button className="button-primary" onClick={submit} disabled={saving || !scheduledAt}>{saving ? "Menyimpan…" : <><CalendarClock size={15} /> Simpan jadwal</>}</button></div>
      </section>
    </div>
  );
}

export function DashboardShell() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Beranda");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [schedulingDraft, setSchedulingDraft] = useState<Draft | null>(null);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [profileSummary, setProfileSummary] = useState<{ niche: string; language: string; version: number } | null>(null);
  const [threadsConnected, setThreadsConnected] = useState(false);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [draftError, setDraftError] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/drafts")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Draft belum bisa dimuat.");
        return body as { drafts: ApiDraft[] };
      })
      .then((body) => { if (!cancelled) setDrafts(body.drafts.map(toDraft)); })
      .catch((error: unknown) => { if (!cancelled) setDraftError(error instanceof Error ? error.message : "Draft belum bisa dimuat."); })
      .finally(() => { if (!cancelled) setLoadingDrafts(false); });
    fetch("/api/profile")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Profile belum bisa dimuat.");
        return body as { profile: { niche: string; language: string; version: number } | null };
      })
      .then((body) => { if (!cancelled && body.profile) setProfileSummary(body.profile); })
      .catch(() => undefined);
    fetch("/api/threads", { cache: "no-store" })
      .then((response) => response.json())
      .then((body) => { if (!cancelled) setThreadsConnected(Boolean(body.connected)); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function handleNavigate(label: string) {
    if (label === "Content profile") {
      router.push("/profile");
      setMobileNavOpen(false);
      return;
    } else if (label === "Koneksi Threads") {
      router.push("/settings/threads");
      setMobileNavOpen(false);
      return;
    } else if (label === "Jadwal") {
      router.push("/schedule");
      setMobileNavOpen(false);
      return;
    } else if (label === "Metrik") {
      router.push("/metrics");
      setMobileNavOpen(false);
      return;
    } else if (label === "Draft") {
      document.querySelector(".draft-section")?.scrollIntoView({ behavior: "smooth" });
    }
    setActiveNav(label);
    setMobileNavOpen(false);
  }

  async function handleCreate(idea: string, count: number) {
    const response = await fetch("/api/drafts/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea, count }) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Draft belum berhasil dibuat.");
    setDrafts((current) => [...body.drafts.map(toDraft), ...current]);
    setCreateOpen(false);
    showToast(`${body.drafts.length} draft berhasil dibuat dan disimpan.`);
  }

  async function handleSave(text: string) {
    if (editingDraft) {
      const response = await fetch(`/api/drafts/${editingDraft.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Draft belum bisa disimpan.");
      setDrafts((current) => current.map((draft) => draft.id === editingDraft.id ? toDraft(body.draft) : draft));
      setEditingDraft(null);
      showToast("Perubahan draft tersimpan.");
    }
  }

  async function handleRegenerate(draft: Draft) {
    setRegeneratingId(draft.id);
    try {
      const response = await fetch(`/api/drafts/${draft.id}/regenerate`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Draft belum berhasil diregenerasi.");
      setDrafts((current) => current.map((item) => item.id === draft.id ? toDraft(body.draft) : item));
      showToast("Draft berhasil diregenerasi.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Draft belum berhasil diregenerasi.");
    } finally {
      setRegeneratingId(null);
    }
  }

  async function handlePublish(draft: Draft) {
    if (!window.confirm(`Publish post ini sekarang ke akun Threads yang terhubung?\n\n${draft.text}`)) return;
    setPublishingId(draft.id);
    try {
      const response = await fetch(`/api/posts/${draft.id}/publish`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Post belum berhasil dipublikasikan.");
      setDrafts((current) => current.filter((item) => item.id !== draft.id));
      showToast(`Post berhasil dipublikasikan · ID ${body.threadsMediaId}`);
    } catch (publishError) {
      const message = publishError instanceof Error ? publishError.message : "Post belum berhasil dipublikasikan.";
      setDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, status: "Gagal diterbitkan", errorMessage: message, updated: "Baru saja" } : item));
      showToast(message);
    } finally {
      setPublishingId(null);
    }
  }

  async function handleSchedule(scheduledAt: string) {
    if (!schedulingDraft) return;
    const response = await fetch(`/api/posts/${schedulingDraft.id}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Jadwal belum bisa disimpan.");
    setDrafts((current) => current.filter((draft) => draft.id !== schedulingDraft.id));
    setSchedulingDraft(null);
    showToast(`Post dijadwalkan untuk ${formatJakartaDateTime(body.post.scheduledAt)} WIB.`);
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="app-frame">
      <Sidebar active={activeNav} onNavigate={handleNavigate} isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} draftCount={drafts.filter((draft) => draft.status === "Perlu ditinjau").length} onLogout={handleLogout} />
      <div className="main-area">
      <Topbar onMenu={() => setMobileNavOpen(true)} query={query} onQueryChange={setQuery} />
        <main className="dashboard-content">
          <WelcomeHeader onCreate={() => setCreateOpen(true)} />
          <OverviewCards draftCount={drafts.filter((draft) => draft.status === "Perlu ditinjau").length} aiCount={drafts.filter((draft) => draft.status === "Perlu ditinjau" && draft.tone === "Dibuat AI").length} profile={profileSummary} onProfile={() => handleNavigate("Content profile")} />
          <MetricsDashboard />
          <div className="main-grid">
            {draftError ? <div className="load-error" role="alert">{draftError}<button onClick={() => window.location.reload()}>Coba lagi</button></div> : loadingDrafts ? <div className="draft-loading" role="status">Memuat draft…</div> : <DraftSection drafts={drafts} onEdit={setEditingDraft} onCreate={() => setCreateOpen(true)} onRegenerate={handleRegenerate} onPublish={handlePublish} onSchedule={setSchedulingDraft} regeneratingId={regeneratingId} publishingId={publishingId} threadsConnected={threadsConnected} query={query} />}
            <SidePanel onCreate={() => setCreateOpen(true)} />
          </div>
          <footer className="dashboard-footer"><span>Threads Studio <i>·</i> Ruang kerjamu, ritmemu.</span><span>Zona waktu WIB (UTC+7)</span></footer>
        </main>
      </div>
      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} onCreate={handleCreate} />}
      {editingDraft && <EditModal draft={editingDraft} onClose={() => setEditingDraft(null)} onSave={handleSave} />}
      {schedulingDraft && <ScheduleModal draft={schedulingDraft} onClose={() => setSchedulingDraft(null)} onSave={handleSchedule} />}
      {toast && <div className="toast-message" role="status"><Check size={15} />{toast}</div>}
    </div>
  );
}
