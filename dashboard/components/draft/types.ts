export type Draft = {
  id: string;
  text: string;
  topic: string;
  updated: string;
  updatedAt: string;
  status: "Perlu ditinjau" | "Sedang diterbitkan" | "Gagal diterbitkan";
  tone: string;
  profileVersionId: number | null;
  errorMessage?: string | null;
};

export type ApiDraft = {
  id: string;
  text: string;
  topic: string;
  source: "AI" | "MANUAL";
  status: "DRAFT" | "PUBLISHING" | "FAILED";
  createdAt: string;
  updatedAt: string;
  profileVersionId: number | null;
  errorMessage?: string | null;
};

export type ProfileSummary = { niche: string; language: string; version: number };

export function toDraft(draft: ApiDraft): Draft {
  const status =
    draft.status === "PUBLISHING"
      ? "Sedang diterbitkan"
      : draft.status === "FAILED"
        ? "Gagal diterbitkan"
        : "Perlu ditinjau";
  return {
    id: draft.id,
    text: draft.text,
    topic: draft.topic || "Draft Threads",
    updated: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(new Date(draft.updatedAt)),
    updatedAt: draft.updatedAt,
    status,
    tone: draft.source === "AI" ? "Dibuat AI" : "Manual",
    profileVersionId: draft.profileVersionId,
    errorMessage: draft.errorMessage,
  };
}
