"use client";

import { useEffect, useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";

interface VerificationType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminVerificationTypesPage() {
  const [types, setTypes] = useState<VerificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get<VerificationType[]>("/verification-types")
      .then((r) => setTypes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((p) => ({
      ...p,
      name,
      slug: p.slug === "" || p.slug === slugify(p.name) ? slugify(name) : p.slug,
    }));
  };

  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/verification-types", form);
      toast.success("Verification type created!");
      setShowCreate(false);
      setForm({ name: "", slug: "", description: "", icon: "" });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Verification Types"
        subtitle="Manage the verification methods available to clients"
        badge={{ label: "Admin", variant: "active" }}
        actions={<Button onClick={() => setShowCreate(true)}>+ New Type</Button>}
      />

      {types.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title="No verification types yet"
          description="Create verification types that clients can use."
          action={<Button size="sm" onClick={() => setShowCreate(true)}>Create type</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((t) => (
            <GlassCard key={t.id}>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: "rgba(232,53,144,0.1)" }}
                >
                  {t.icon ?? "🔍"}
                </div>
                <Badge
                  label={t.is_active ? "Active" : "Inactive"}
                  variant={t.is_active ? "completed" : "default"}
                />
              </div>

              <h3 className="font-semibold text-[#ededed] mb-1">{t.name}</h3>
              <code
                className="text-xs px-2 py-0.5 rounded-lg mb-3 inline-block"
                style={{ background: "rgba(24,195,244,0.08)", color: "#18c3f4" }}
              >
                {t.slug}
              </code>

              {t.description && (
                <p className="text-sm text-[rgba(237,237,237,0.5)] leading-relaxed">
                  {t.description}
                </p>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Verification Type" subtitle="Add a new type clients can request">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={form.name}
              onChange={handleNameChange}
              placeholder="Identity Verification"
              required
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={set("slug")}
              placeholder="identity"
              hint="Auto-generated from name"
              required
            />
          </div>
          <Input
            label="Icon (emoji)"
            value={form.icon}
            onChange={set("icon")}
            placeholder="🪪"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={set("description")}
            rows={3}
            placeholder="Describe what this verification type does…"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button
              onClick={save}
              loading={saving}
              disabled={!form.name.trim() || !form.slug.trim()}
              className="flex-1"
            >
              Create Type
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
