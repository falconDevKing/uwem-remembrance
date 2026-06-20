import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/session";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  const session = await verifySession();
  if (session.authenticated && session.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm text-muted">
            In Loving Memory of Dr. (Mrs.) Uwem Oyekan
          </p>
        </div>

        <div className="rounded-2xl border-t-4 border-gold bg-card p-8 shadow-lg">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Admin Login
          </h1>
          <p className="mt-2 mb-6 text-sm text-muted">
            Enter the admin password to access the dashboard.
          </p>
          <LoginForm />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted transition-colors hover:text-gold"
          >
            &larr; Back to public site
          </Link>
        </div>
      </div>
    </div>
  );
}
