import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}

