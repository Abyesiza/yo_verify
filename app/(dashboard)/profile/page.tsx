"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, getErrorMessage } from "@/lib/api";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function ProfilePage() {
  const { user, refetch } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name ?? "",
    phone_number: user?.phone_number ?? "",
  });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const setPw = (k: keyof typeof pwForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPwForm((p) => ({ ...p, [k]: e.target.value }));

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.patch("/auth/profile", form);
      await refetch();
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { toast.error("New passwords don't match"); return; }
    if (pwForm.next.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSavingPw(true);
    try {
      await api.post("/auth/change-password", {
        current_password: pwForm.current,
        new_password: pwForm.next,
      });
      setPwForm({ current: "", next: "", confirm: "" });
      toast.success("Password changed!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  const initial = (user?.full_name || user?.email || "?")[0]?.toUpperCase() ?? "?";

  return (
    <div className="animate-fade-in">
      <TopBar title="My Profile" subtitle="Manage your personal account details" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar + identity */}
        <GlassCard className="flex flex-col items-center text-center gap-4 py-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{ background: "rgba(232,53,144,0.15)", color: "#e83590", border: "2px solid rgba(232,53,144,0.2)" }}
          >
            {initial}
          </div>
          <div>
            <div className="text-base font-semibold text-[#ededed]">{user?.full_name ?? "—"}</div>
            <div className="text-sm text-[rgba(237,237,237,0.45)] mt-1">{user?.email}</div>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <Badge
              label={user?.user_role === "admin" ? "Admin" : "Client"}
              variant={user?.user_role === "admin" ? "admin" : "active"}
            />
            <Badge
              label={user?.email_verified ? "Email verified" : "Email unverified"}
              variant={user?.email_verified ? "completed" : "pending"}
              dot
            />
          </div>
        </GlassCard>

        {/* Forms column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Profile details */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-[#ededed] mb-5">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full name"
                value={form.full_name}
                onChange={set("full_name")}
                placeholder="Jane Smith"
              />
              <Input
                label="Phone number"
                type="tel"
                value={form.phone_number}
                onChange={set("phone_number")}
                placeholder="+1 555 000 0000"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Email address"
                  value={user?.email ?? ""}
                  disabled
                  hint="Email changes are not supported yet."
                />
              </div>
            </div>
            <div className="mt-5">
              <Button onClick={saveProfile} loading={savingProfile} disabled={!form.full_name.trim()}>
                Save profile
              </Button>
            </div>
          </GlassCard>

          {/* Change password */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-[#ededed] mb-5">Change Password</h3>
            <div className="flex flex-col gap-4 max-w-sm">
              <Input
                label="Current password"
                type="password"
                value={pwForm.current}
                onChange={setPw("current")}
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <Input
                label="New password"
                type="password"
                value={pwForm.next}
                onChange={setPw("next")}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
              />
              <Input
                label="Confirm new password"
                type="password"
                value={pwForm.confirm}
                onChange={setPw("confirm")}
                autoComplete="new-password"
                placeholder="••••••••"
                error={pwForm.confirm && pwForm.next !== pwForm.confirm ? "Passwords don't match" : undefined}
              />
            </div>
            <div className="mt-5">
              <Button
                onClick={savePassword}
                loading={savingPw}
                disabled={!pwForm.current || !pwForm.next || !pwForm.confirm}
              >
                Update password
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
