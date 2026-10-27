import { Plus, Sparkles, Star, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export type Example = { text: string; isTop: boolean };
export type ProfileForm = {
  niche: string;
  topics: string;
  audience: string;
  tone: string;
  language: string;
  rules: string;
  examples: Example[];
};
export type ProfileVersion = { version: number; createdAt: string };

type ProfileFieldsProps = {
  profile: ProfileForm;
  update: <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => void;
};

export function ProfileBasicsSection({ profile, update }: ProfileFieldsProps) {
  return (
    <section className="profile-section-card">
      <SectionHeading
        number="A"
        title="Tentang tulisanmu"
        description="Dasar konteks untuk menyusun draft yang relevan."
      />
      <div className="profile-fields-grid">
        <label>
          Niche atau bidang utama{" "}
          <input
            required
            maxLength={191}
            value={profile.niche}
            onChange={(event) => update("niche", event.target.value)}
            placeholder="Contoh: software engineering"
          />
        </label>
        <label>
          Bahasa{" "}
          <select
            value={profile.language}
            onChange={(event) => update("language", event.target.value)}
          >
            <option>Bahasa Indonesia</option>
            <option>English</option>
            <option>Bahasa Indonesia dan English</option>
          </select>
        </label>
        <label className="field-full">
          Topik yang sering dibahas{" "}
          <textarea
            rows={3}
            maxLength={4000}
            value={profile.topics}
            onChange={(event) => update("topics", event.target.value)}
            placeholder="Topik utama, hal yang sedang dipelajari, atau sudut pandang yang sering kamu bawa..."
          />
        </label>
        <label className="field-full">
          Target audiens{" "}
          <textarea
            required
            rows={2}
            maxLength={2000}
            value={profile.audience}
            onChange={(event) => update("audience", event.target.value)}
            placeholder="Siapa yang ingin kamu ajak bicara?"
          />
        </label>
      </div>
    </section>
  );
}

export function ProfileVoiceSection({ profile, update }: ProfileFieldsProps) {
  return (
    <section className="profile-section-card">
      <SectionHeading
        number="B"
        title="Suara dan batasan"
        description="Bantu AI menjaga nada dan menghindari hal yang tidak cocok."
      />
      <div className="profile-fields-grid">
        <label className="field-full">
          Nada bicara{" "}
          <textarea
            required
            rows={3}
            maxLength={2000}
            value={profile.tone}
            onChange={(event) => update("tone", event.target.value)}
            placeholder="Contoh: santai, jujur, reflektif; seperti berbagi ke teman sesama developer."
          />
        </label>
        <label className="field-full">
          Hal yang dihindari{" "}
          <textarea
            rows={3}
            maxLength={4000}
            value={profile.rules}
            onChange={(event) => update("rules", event.target.value)}
            placeholder="Misalnya: jargon berlebihan, klaim tanpa sumber, hard selling, atau hashtag yang tidak perlu."
          />
        </label>
      </div>
    </section>
  );
}

export function ProfileExamplesSection({
  examples,
  onChange,
}: {
  examples: Example[];
  onChange: Dispatch<SetStateAction<Example[]>>;
}) {
  function updateExample(index: number, patch: Partial<Example>) {
    onChange((current) =>
      current.map((example, itemIndex) =>
        itemIndex === index ? { ...example, ...patch } : example,
      ),
    );
  }
  return (
    <section className="profile-section-card examples-section">
      <div className="profile-section-heading">
        <div className="section-number">C</div>
        <div>
          <h2>Contoh tulisanmu</h2>
          <p>Tambahkan 5–20 post yang paling terasa seperti dirimu.</p>
        </div>
        <span className="example-counter">
          {examples.filter((example) => example.text.trim()).length} / 20
        </span>
      </div>
      <div className="example-list">
        {examples.map((example, index) => (
          <div className="example-input-row" key={index}>
            <span className="example-index">{String(index + 1).padStart(2, "0")}</span>
            <div className="example-input-wrap">
              <textarea
                aria-label={`Contoh tulisan ${index + 1}`}
                maxLength={500}
                rows={2}
                value={example.text}
                onChange={(event) => updateExample(index, { text: event.target.value })}
                placeholder="Tempel satu post favoritmu di sini..."
              />
              <div className="example-input-bottom">
                <span>{example.text.length} / 500</span>
                <button
                  type="button"
                  className={example.isTop ? "top-example is-top" : "top-example"}
                  onClick={() => updateExample(index, { isTop: !example.isTop })}
                  aria-pressed={example.isTop}
                >
                  <Star size={12} fill={example.isTop ? "currentColor" : "none"} /> Contoh terbaik
                </button>
                {examples.length > 5 && (
                  <button
                    type="button"
                    className="remove-example"
                    aria-label={`Hapus contoh ${index + 1}`}
                    onClick={() =>
                      onChange((current) => current.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {examples.length < 20 && (
        <button
          type="button"
          className="add-example"
          onClick={() => onChange((current) => [...current, { text: "", isTop: false }])}
        >
          <Plus size={14} /> Tambah contoh
        </button>
      )}
    </section>
  );
}

export function ProfileAside({
  versions,
  versionNumber,
}: {
  versions: ProfileVersion[];
  versionNumber: number | null;
}) {
  return (
    <aside className="profile-aside">
      <section className="profile-hint-card">
        <div className="profile-hint-icon">
          <Sparkles size={17} />
        </div>
        <h3>Semakin spesifik, semakin terasa kamu.</h3>
        <p>
          Contoh tulisan membantu menangkap ritme, pilihan kata, dan cara kamu bercerita. Pilih post
          yang benar-benar kamu sukai.
        </p>
      </section>
      <section className="version-history-card">
        <div className="section-kicker">RIWAYAT PROFILE</div>
        <h3>Versi tersimpan</h3>
        {versions.length ? (
          versions.map((version) => (
            <div className="version-history-item" key={version.version}>
              <span className="version-history-dot" />
              <div>
                <strong>Versi {version.version}</strong>
                <small>
                  {new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                    timeZone: "Asia/Jakarta",
                  }).format(new Date(version.createdAt))}
                </small>
              </div>
              {version.version === versionNumber && <span className="current-version">AKTIF</span>}
            </div>
          ))
        ) : (
          <p className="no-versions">Profile pertamamu akan muncul di sini setelah disimpan.</p>
        )}
      </section>
    </aside>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="profile-section-heading">
      <div className="section-number">{number}</div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
