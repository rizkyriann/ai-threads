import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/providers/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threads Studio — Dashboard",
  description: "Ruang kerja pribadi untuk menyusun dan meninjau konten Threads.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f5f4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
