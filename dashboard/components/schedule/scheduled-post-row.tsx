"use client";

import { useState } from "react";
import { CalendarClock, Check, CircleAlert, Clock3, MoreHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatJakartaDateTime, toJakartaDateTimeInput } from "@/lib/jakarta-time";

export type ScheduledPost = {
  id: string;
  text: string;
  topic: string;
  status: "SCHEDULED" | "PUBLISHING" | "MISSED" | "FAILED";
  scheduledAt: string | null;
  retryCount: number;
  errorMessage: string | null;
  updatedAt: string;
};

type ScheduledPostRowProps = {
  post: ScheduledPost;
  onCancel: (post: ScheduledPost) => void;
  onUpdate: (post: ScheduledPost, value: string) => void;
  busy: boolean;
};

export function ScheduledPostRow({ post, onCancel, onUpdate, busy }: ScheduledPostRowProps) {
  const [editing, setEditing] = useState(false);
  const [newTime, setNewTime] = useState(() =>
    post.scheduledAt ? toJakartaDateTimeInput(post.scheduledAt) : "",
  );
  const statusLabel =
    post.status === "SCHEDULED"
      ? "Terjadwal"
      : post.status === "PUBLISHING"
        ? "Sedang diterbitkan"
        : post.status === "MISSED"
          ? "Terlewat"
          : "Gagal";
  const badgeVariant =
    post.status === "SCHEDULED"
      ? "success"
      : post.status === "PUBLISHING"
        ? "default"
        : post.status === "MISSED"
          ? "warning"
          : "danger";

  if (editing) {
    return (
      <TableRow>
        <TableCell colSpan={5}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[280px] flex-1 items-center gap-2">
              <CalendarClock size={16} className="text-notion-blue" />
              <Input
                aria-label={`Ubah waktu tayang ${post.topic || "post Threads"}`}
                type="datetime-local"
                value={newTime}
                min={toJakartaDateTimeInput(new Date(Date.now() + 60_000))}
                onChange={(event) => setNewTime(event.target.value)}
              />
            </div>
            <Button disabled={busy || !newTime} onClick={() => onUpdate(post, newTime)}>
              <Check size={14} /> Simpan
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Tutup pengeditan"
              onClick={() => setEditing(false)}
            >
              <X size={16} />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <div className="min-w-0">
          <strong className="block truncate font-medium text-slate-900">
            {post.topic || "Post Threads"}
          </strong>
          <p className="mt-1 line-clamp-2 max-w-[440px] whitespace-pre-wrap text-xs leading-5 text-graphite">
            {post.text}
          </p>
          {post.errorMessage && (
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-vermillion">
              <CircleAlert size={13} className="mt-0.5 shrink-0" />
              {post.errorMessage}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={badgeVariant}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {statusLabel}
        </Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs text-graphite">
        {post.scheduledAt ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock size={14} className="text-notion-blue" />
            {formatJakartaDateTime(post.scheduledAt)} WIB
          </span>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs text-stone">
        {post.retryCount ? `Percobaan ${post.retryCount}` : "Antrean"}
      </TableCell>
      <TableCell className="text-right">
        {post.status === "SCHEDULED" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-slate-400"
                disabled={busy}
                aria-label={`Aksi ${post.topic || "post Threads"}`}
              >
                <MoreHorizontal size={17} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditing(true)}>
                <Clock3 size={14} /> Ubah waktu
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-vermillion focus:text-vermillion"
                onSelect={() => onCancel(post)}
              >
                <X size={14} /> Batalkan jadwal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="text-xs text-stone">
            {post.status === "PUBLISHING" ? "Sedang diproses" : "Perlu ditinjau"}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}
