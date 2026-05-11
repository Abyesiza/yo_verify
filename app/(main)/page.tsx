"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace(user.user_role === "admin" ? "/admin/dashboard" : "/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  return <Loader />;
}
