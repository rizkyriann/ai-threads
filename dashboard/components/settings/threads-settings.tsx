"use client";

import { FormEvent, useEffect, useState } from "react";
import { CircleAlert, LoaderCircle, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  ConnectedAccountPanel,
  SettingsAside,
  TokenConnectForm,
  type Account,
} from "@/components/settings/connection-panels";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function ThreadsSettings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [confirmConnectOpen, setConfirmConnectOpen] = useState(false);
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false);

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

  useEffect(() => {
    void loadAccount();
  }, []);

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) return;
    if (account) {
      setPendingToken(token.trim());
      setConfirmConnectOpen(true);
      return;
    }
    await connectAccount(token.trim());
  }

  async function connectAccount(accessToken: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Akun Threads belum berhasil dihubungkan.");
      setAccount(body.account);
      setToken("");
      toast.success(
        `Akun @${body.account.username} berhasil dihubungkan. Token tidak ditampilkan kembali.`,
      );
    } catch (connectError) {
      const message =
        connectError instanceof Error
          ? connectError.message
          : "Akun Threads belum berhasil dihubungkan.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function runAccountAction(action: "verify" | "refresh" | "disconnect") {
    if (action === "disconnect") {
      setConfirmDisconnectOpen(true);
      return;
    }
    await performAccountAction(action);
  }

  async function performAccountAction(action: "verify" | "refresh" | "disconnect") {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        action === "disconnect" ? "/api/threads" : `/api/threads/${action}`,
        { method: action === "disconnect" ? "DELETE" : "POST" },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Aksi koneksi Threads gagal.");
      if (action === "disconnect") {
        setAccount(null);
        toast.success("Koneksi Threads sudah diputuskan.");
      } else if (action === "refresh") {
        await loadAccount();
        toast.success(
          body.tokenExpiresAt
            ? `Token diperbarui hingga ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(body.tokenExpiresAt))} WIB.`
            : "Token berhasil diperbarui.",
        );
      } else {
        toast.success(`Koneksi aktif untuk @${body.username}.`);
      }
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : "Aksi koneksi Threads gagal.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="settings-page">
      <header className="settings-page-header">
        <div className="section-kicker">PENGATURAN AKUN</div>
        <h1>Koneksi Threads</h1>
        <p>Hubungkan satu akun Threads untuk menerbitkan post secara manual dari dashboard.</p>
      </header>

      <div className="settings-layout">
        <section className="settings-card connection-card">
          <div className="settings-card-heading">
            <div className="settings-icon">
              <UserRound size={18} />
            </div>
            <div>
              <h2>Akun Threads</h2>
              <p>Gunakan access token yang dibuat melalui Meta.</p>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3 py-6" role="status" aria-label="Memeriksa koneksi">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-32" />
              <span className="sr-only">
                <LoaderCircle size={16} className="spin-icon" /> Memeriksa koneksi…
              </span>
            </div>
          ) : account ? (
            <ConnectedAccountPanel account={account} busy={busy} onAction={runAccountAction} />
          ) : (
            <TokenConnectForm
              token={token}
              busy={busy}
              onTokenChange={setToken}
              onSubmit={handleConnect}
            />
          )}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <CircleAlert size={15} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </section>

        <SettingsAside />
      </div>
      <AlertDialog open={confirmConnectOpen} onOpenChange={setConfirmConnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ganti koneksi Threads?</AlertDialogTitle>
            <AlertDialogDescription>
              Koneksi @{account?.username} akan diganti dengan akun dari token baru.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmConnectOpen(false);
                void connectAccount(pendingToken);
              }}
            >
              Ganti koneksi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirmDisconnectOpen} onOpenChange={setConfirmDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Putuskan koneksi Threads?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun @{account?.username} tidak dapat digunakan untuk publish sampai dihubungkan
              kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-vermillion hover:bg-red-700"
              onClick={() => {
                setConfirmDisconnectOpen(false);
                void performAccountAction("disconnect");
              }}
            >
              Putuskan koneksi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
