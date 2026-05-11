"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { register } from "@/lib/auth";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleButton from "@/components/auth/GoogleButton";

export default function RegisterPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const passwordError =
    form.confirm && form.password !== form.confirm ? "Passwords don't match" : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await register(form.email, form.password, form.full_name);
      await refetch();
      toast.success("Account created! Check your email to verify.");
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
        <h1 className="text-2xl font-bold text-[#ededed] mb-1.5">Create account</h1>
        <p className="text-sm text-[rgba(237,237,237,0.5)]">Start verifying your users today</p>
      </div>

      {/* Google OAuth */}
      <GoogleButton label="Sign up with Google" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-xs text-[rgba(237,237,237,0.3)]">or continue with email</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Full name" value={form.full_name} onChange={set("full_name")} placeholder="Jane Smith" autoComplete="name" required />
        <Input label="Email address" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" autoComplete="email" required />
        <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Minimum 8 characters" autoComplete="new-password" required />
        <Input label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" autoComplete="new-password" error={passwordError} required />
        <Button type="submit" loading={loading} size="lg" className="mt-2 w-full" disabled={!!passwordError}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[rgba(237,237,237,0.4)]">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#e83590] hover:underline font-medium">Sign in</Link>
      </p>
    </GlassCard>
  );
}
