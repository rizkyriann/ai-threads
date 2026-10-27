"use client";

import { FormEvent, useEffect, useState } from "react";
import { CircleAlert, Save } from "lucide-react";
import { toast } from "sonner";
import {
  ProfileAside,
  ProfileBasicsSection,
  ProfileExamplesSection,
  ProfileVoiceSection,
  type Example,
  type ProfileForm,
} from "@/components/profile/profile-sections";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileResponse = {
  profile: (ProfileForm & { version: number; createdAt: string }) | null;
  versions: { version: number; createdAt: string }[];
};

const blankProfile: ProfileForm = {
  niche: "",
  topics: "",
  audience: "",
  tone: "",
  language: "Bahasa Indonesia",
  rules: "",
  examples: Array.from({ length: 5 }, () => ({ text: "", isTop: false })),
};

export function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileForm>(blankProfile);
  const [versions, setVersions] = useState<ProfileResponse["versions"]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [versionNumber, setVersionNumber] = useState<number | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(blankProfile));
  const isDirty = JSON.stringify(profile) !== savedSnapshot;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Profile tidak bisa dimuat.");
        return body as ProfileResponse;
      })
      .then((body) => {
        if (cancelled) return;
        setVersions(body.versions);
        if (body.profile) {
          setVersionNumber(body.profile.version);
          const loadedProfile = {
            ...body.profile,
            examples: body.profile.examples.map(({ text, isTop }) => ({ text, isTop })),
          };
          setProfile(loadedProfile);
          setSavedSnapshot(JSON.stringify(loadedProfile));
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled)
          setError(loadError instanceof Error ? loadError.message : "Profile tidak bisa dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...profile,
        examples: profile.examples.filter((example) => example.text.trim()),
      };
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Profile belum bisa disimpan.");
      setVersionNumber(body.profile.version);
      const savedProfile = {
        ...body.profile,
        examples: body.profile.examples.map(({ text, isTop }: Example) => ({ text, isTop })),
      };
      setProfile(savedProfile);
      setSavedSnapshot(JSON.stringify(savedProfile));
      setVersions((current) => [
        { version: body.profile.version, createdAt: body.profile.createdAt },
        ...current,
      ]);
      toast.success(`Versi ${body.profile.version} tersimpan.`);
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Profile belum bisa disimpan.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <main className="profile-page" role="status" aria-label="Memuat content profile">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_270px]">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-72 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </main>
    );

  return (
    <main className="profile-page">
      <header className="profile-page-header">
        <div className="profile-page-title-row">
          <div>
            <div className="section-kicker">PERSONALISASI</div>
            <h1>Content profile</h1>
            <p>Jelaskan siapa dirimu dan bagaimana kamu ingin terdengar.</p>
          </div>
          <span className="version-chip">
            {versionNumber ? `VERSI ${versionNumber}` : "BELUM DISIMPAN"}
          </span>
        </div>
      </header>

      <form className="profile-layout" onSubmit={handleSave}>
        <div className="profile-form-column">
          <ProfileBasicsSection profile={profile} update={update} />
          <ProfileVoiceSection profile={profile} update={update} />
          <ProfileExamplesSection
            examples={profile.examples}
            onChange={(examples) =>
              update(
                "examples",
                typeof examples === "function" ? examples(profile.examples) : examples,
              )
            }
          />
          {error && (
            <Alert variant="destructive">
              <CircleAlert size={15} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="profile-save-row">
            <span>Setiap kali disimpan, versi profile baru akan dibuat.</span>
            <button className="button-primary" type="submit" disabled={saving}>
              <Save size={15} /> {saving ? "Menyimpan…" : "Simpan profile"}
            </button>
          </div>
        </div>

        <ProfileAside versions={versions} versionNumber={versionNumber} />
      </form>
    </main>
  );
}
