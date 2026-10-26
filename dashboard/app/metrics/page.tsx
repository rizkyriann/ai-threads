import { LoginForm } from "@/components/login-form";
import { MetricsDashboard } from "@/components/metrics-dashboard";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  if (!(await isAuthenticated())) return <LoginForm />;
  return <main className="metrics-page"><MetricsDashboard full /></main>;
}
