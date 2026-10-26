import { LoginForm } from "@/components/login-form";
import { ThreadsSettings } from "@/components/threads-settings";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ThreadsSettingsPage() {
  if (!(await isAuthenticated())) return <LoginForm />;
  return <ThreadsSettings />;
}
