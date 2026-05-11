"use client";

import { useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import PageLoader from "@/components/ui/PageLoader";

interface Client {
  id: string;
  name: string;
  type: string;
  description: string | null;
  website: string | null;
  plan: string;
  is_active: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [hasClient, setHasClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "individual", description: "", website: "",
  });

  useEffect(() => {
    api.get<Client>("/clients/me")
      .then((r) => {
        setClient(r.data);
        setHasClient(true);
        setForm({
          name: r.data.name,
          type: r.data.type,
          description: r.data.description ?? "",
          website: r.data.website ?? "",
        });
      })
      .catch(() => setHasClient(false))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      if (hasClient) {
        const { data } = await api.patch<Client>("/clients/me", form);
        setClient(data);
        toast.success("Profile updated!");
      } else {
        const { data } = await api.post<Client>("/clients", form);
        setClient(data);
        setHasClient(true);
        toast.success("Client profile created!");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <TopBar title="Settings" subtitle="Manage your account and integration profile" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account info */}
        <div className="flex flex-col gap-4">
          <GlassCard>
            <h3 className="font-semibold text-[#ededed] mb-5 text-sm">Account</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Email", value: user?.email },
                { label: "Full Name", value: user?.full_name ?? "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-[rgba(237,237,237,0.4)] mb-1">{label}</div>
                  <div className="text-sm text-[#ededed]">{value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-[rgba(237,237,237,0.4)] mb-1.5">Role</div>
                <Badge label={user?.user_role ?? "client"} variant={user?.user_role === "admin" ? "admin" : "default"} />
              </div>
              <div>
                <div className="text-xs text-[rgba(237,237,237,0.4)] mb-1.5">Email</div>
                <Badge
                  label={user?.email_verified ? "Verified" : "Not verified"}
                  variant={user?.email_verified ? "completed" : "pending"}
                />
              </div>
              {client && (
                <div>
                  <div className="text-xs text-[rgba(237,237,237,0.4)] mb-1.5">Plan</div>
                  <Badge label={client.plan.toUpperCase()} variant="active" />
                </div>
              )}
            </div>
          </GlassCard>

          {/* API quick-ref */}
          <GlassCard padding="p-4" style={{ borderColor: "rgba(232,53,144,0.15)" }}>
            <div className="text-xs text-[rgba(237,237,237,0.4)] mb-2">Quick links</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "API Keys", href: "/api-keys" },
                { label: "Verifications", href: "/verifications" },
                { label: "Documentation", href: "/docs" },
                { label: "Suggestions", href: "/suggestions" },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm text-[rgba(237,237,237,0.55)] hover:text-[#e83590] transition-colors"
                >
                  {label} →
                </a>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Client profile form */}
        <div className="lg:col-span-2">
          <GlassCard>
            <h3 className="font-semibold text-[#ededed] mb-5 text-sm">
              {hasClient ? "Client Profile" : "Create Client Profile"}
            </h3>
            {!hasClient && (
              <div
                className="rounded-xl p-4 mb-5 text-sm text-[rgba(237,237,237,0.6)]"
                style={{ background: "rgba(24,195,244,0.05)", border: "1px solid rgba(24,195,244,0.15)" }}
              >
                You need a client profile to generate API keys and submit verification requests.
              </div>
            )}
            <div className="flex flex-col gap-4">
              <Input
                label="Organisation name"
                value={form.name}
                onChange={set("name")}
                placeholder="Acme Corp"
                required
              />
              <Select label="Account type" value={form.type} onChange={set("type")}>
                <option value="individual">Individual</option>
                <option value="company">Company</option>
                <option value="group">Group</option>
              </Select>
              <Input
                label="Description"
                value={form.description}
                onChange={set("description")}
                placeholder="Brief description of your organisation"
              />
              <Input
                label="Website"
                type="url"
                value={form.website}
                onChange={set("website")}
                placeholder="https://yoursite.com"
              />
              <div className="pt-2">
                <Button onClick={save} loading={saving} disabled={!form.name.trim()}>
                  {hasClient ? "Save changes" : "Create profile"}
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
