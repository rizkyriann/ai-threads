"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Plus, Save, Sparkles, Star, Trash2 } from "lucide-react";

type Example = { text: string; isTop: boolean };
type ProfileForm = { niche: string; topics: string; audience: string; tone: string; language: string; rules: string; examples: Example[] };
type ProfileResponse = { profile: (ProfileForm & { version: number; createdAt: string }) | null; versions: { version: number; createdAt: string }[] };

const blankProfile: ProfileForm = {
  niche: "", topics: "", audience: "", tone: "", language: "Bahasa Indonesia", rules: "",
  examples: Array.from({ length: 5 }, () => ({ text: "", isTop: false })),
};

export function ProfileEditor() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileForm>(blankProfile);
  const [versions, setVersions] = useState<ProfileResponse["versions"]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [versionNumber, setVersionNumber] = useState<number | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(blankProfile));
  const isDirty = JSON.stringify(profile) !== savedSnapshot;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile").then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Profile tidak bisa dimuat.");
      return body as ProfileResponse;
    }).then((body) => {
      if (cancelled) return;
      setVersions(body.versions);
      if (body.profile) {
        setVersionNumber(body.profile.version);
        const loadedProfile = { ...body.profile, examples: body.profile.examples.map(({ text, isTop }) => ({ text, isTop })) };
        setProfile(loadedProfile);
        setSavedSnapshot(JSON.stringify(loadedProfile));
      }
    }).catch((loadError: unknown) => {
      if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Profile tidak bisa dimuat.");
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    function warnBeforeLeave(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [isDirty]);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function updateExample(index: number, patch: Partial<Example>) {
    setProfile((current) => ({ ...current, examples: current.examples.map((example, itemIndex) => itemIndex === index ? { ...example, ...patch } : example) }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = { ...profile, examples: profile.examples.filter((example) => example.text.trim()) };
      const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Profile belum bisa disimpan.");
      setVersionNumber(body.profile.version);
      const savedProfile = { ...body.profile, examples: body.profile.examples.map(({ text, isTop }: Example) => ({ text, isTop })) };
      setProfile(savedProfile);
      setSavedSnapshot(JSON.stringify(savedProfile));
      setVersions((current) => [{ version: body.profile.version, createdAt: body.profile.createdAt }, ...current]);
      setNotice(`Versi ${body.profile.version} tersimpan.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Profile belum bisa disimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="profile-loading" role="status">Memuat content profile…</main>;

  return (
    <main className="profile-page">
      <header className="profile-page-header">
        <button className="profile-back" onClick={() => { if (!isDirty || window.confirm("Buang perubahan profile yang belum disimpan?")) router.push("/"); }}><ArrowLeft size={16} /> Kembali ke dashboard</button>
        <div className="profile-page-title-row"><div><div className="section-kicker">PERSONALISASI</div><h1>Content profile</h1><p>Jelaskan siapa dirimu dan bagaimana kamu ingin terdengar.</p></div><span className="version-chip">{versionNumber ? `VERSI ${versionNumber}` : "BELUM DISIMPAN"}</span></div>
      </header>

      <form className="profile-layout" onSubmit={handleSave}>
        <div className="profile-form-column">
          <section className="profile-section-card">
            <div className="profile-section-heading"><div className="section-number">A</div><div><h2>Tentang tulisanmu</h2><p>Dasar konteks untuk menyusun draft yang relevan.</p></div></div>
            <div className="profile-fields-grid">
              <label>Niche atau bidang utama <input required maxLength={191} value={profile.niche} onChange={(event) => update("niche", event.target.value)} placeholder="Contoh: software engineering" /></label>
              <label>Bahasa <select value={profile.language} onChange={(event) => update("language", event.target.value)}><option>Bahasa Indonesia</option><option>English</option><option>Bahasa Indonesia dan English</option></select></label>
              <label className="field-full">Topik yang sering dibahas <textarea rows={3} maxLength={4000} value={profile.topics} onChange={(event) => update("topics", event.target.value)} placeholder="Topik utama, hal yang sedang dipelajari, atau sudut pandang yang sering kamu bawa..." /></label>
              <label className="field-full">Target audiens <textarea required rows={2} maxLength={2000} value={profile.audience} onChange={(event) => update("audience", event.target.value)} placeholder="Siapa yang ingin kamu ajak bicara?" /></label>
            </div>
          </section>

          <section className="profile-section-card">
            <div className="profile-section-heading"><div className="section-number">B</div><div><h2>Suara dan batasan</h2><p>Bantu AI menjaga nada dan menghindari hal yang tidak cocok.</p></div></div>
            <div className="profile-fields-grid">
              <label className="field-full">Nada bicara <textarea required rows={3} maxLength={2000} value={profile.tone} onChange={(event) => update("tone", event.target.value)} placeholder="Contoh: santai, jujur, reflektif; seperti berbagi ke teman sesama developer." /></label>
              <label className="field-full">Hal yang dihindari <textarea rows={3} maxLength={4000} value={profile.rules} onChange={(event) => update("rules", event.target.value)} placeholder="Misalnya: jargon berlebihan, klaim tanpa sumber, hard selling, atau hashtag yang tidak perlu." /></label>
            </div>
          </section>

          <section className="profile-section-card examples-section">
            <div className="profile-section-heading"><div className="section-number">C</div><div><h2>Contoh tulisanmu</h2><p>Tambahkan 5–20 post yang paling terasa seperti dirimu.</p></div><span className="example-counter">{profile.examples.filter((example) => example.text.trim()).length} / 20</span></div>
            <div className="example-list">{profile.examples.map((example, index) => <div className="example-input-row" key={index}><span className="example-index">{String(index + 1).padStart(2, "0")}</span><div className="example-input-wrap"><textarea aria-label={`Contoh tulisan ${index + 1}`} maxLength={500} rows={2} value={example.text} onChange={(event) => updateExample(index, { text: event.target.value })} placeholder="Tempel satu post favoritmu di sini..." /><div className="example-input-bottom"><span>{example.text.length} / 500</span><button type="button" className={example.isTop ? "top-example is-top" : "top-example"} onClick={() => updateExample(index, { isTop: !example.isTop })} aria-pressed={example.isTop}><Star size={12} fill={example.isTop ? "currentColor" : "none"} /> Contoh terbaik</button>{profile.examples.length > 5 && <button type="button" className="remove-example" aria-label={`Hapus contoh ${index + 1}`} onClick={() => update("examples", profile.examples.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={13} /></button>}</div></div></div>)}</div>
            {profile.examples.length < 20 && <button type="button" className="add-example" onClick={() => update("examples", [...profile.examples, { text: "", isTop: false }])}><Plus size={14} /> Tambah contoh</button>}
          </section>
          {error && <p className="form-error profile-alert" role="alert">{error}</p>}
          {notice && <p className="profile-success" role="status"><Check size={14} /> {notice}</p>}
          <div className="profile-save-row"><span>Setiap kali disimpan, versi profile baru akan dibuat.</span><button className="button-primary" type="submit" disabled={saving}><Save size={15} /> {saving ? "Menyimpan…" : "Simpan profile"}</button></div>
        </div>

        <aside className="profile-aside">
          <section className="profile-hint-card"><div className="profile-hint-icon"><Sparkles size={17} /></div><h3>Semakin spesifik, semakin terasa kamu.</h3><p>Contoh tulisan membantu menangkap ritme, pilihan kata, dan cara kamu bercerita. Pilih post yang benar-benar kamu sukai.</p></section>
          <section className="version-history-card"><div className="section-kicker">RIWAYAT PROFILE</div><h3>Versi tersimpan</h3>{versions.length ? versions.map((version) => <div className="version-history-item" key={version.version}><span className="version-history-dot" /><div><strong>Versi {version.version}</strong><small>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(version.createdAt))}</small></div>{version.version === versionNumber && <span className="current-version">AKTIF</span>}</div>) : <p className="no-versions">Profile pertamamu akan muncul di sini setelah disimpan.</p>}</section>
        </aside>
      </form>
    </main>
  );
}
