"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { login } from "@/lib/auth";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      await refetch();
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#ededed] mb-1.5">Sign in</h1>
        <p className="text-sm text-[rgba(237,237,237,0.5)]">
          Welcome back to Yo Verify
        </p>
      </div>

      {/* Google OAuth */}
      <GoogleButton label="Sign in with Google" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-xs text-[rgba(237,237,237,0.3)]">or continue with email</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[rgba(237,237,237,0.4)]">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-[#e83590] hover:underline font-medium">
          Create one
        </Link>
      </p>
    </GlassCard>
  );
}
