import AuthGuard from "@/components/auth/AuthGuard";

export default function ApprovalPendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}



