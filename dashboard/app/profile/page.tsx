import { LoginForm } from "@/components/login-form";
import { ProfileEditor } from "@/components/profile-editor";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!(await isAuthenticated())) return <LoginForm />;
  return <ProfileEditor />;
}
