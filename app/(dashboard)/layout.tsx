"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Loader from "@/components/Loader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    // Guard admin-only routes
    if (pathname.startsWith("/admin") && user.user_role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, loading, router, pathname]);

  if (loading) return <Loader />;
  if (!user) return null;
  if (pathname.startsWith("/admin") && user.user_role !== "admin") return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar />
      {/* ml-60 offsets the fixed sidebar width */}
      <main className="flex-1 overflow-auto ml-60 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}
