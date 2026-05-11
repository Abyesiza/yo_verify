"use client";

import { useEffect, useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import TopBar from "@/components/layout/TopBar";
import DataTable from "@/components/layout/DataTable";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import GlassCard from "@/components/ui/GlassCard";

interface Doc {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  order_index: number;
  is_published: boolean;
}

const CATEGORIES = ["general", "integration", "api-reference", "guides", "security"];

const emptyForm = { slug: "", title: "", content: "", category: "general", order_index: "0", is_published: false };

export default function AdminDocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get<Doc[]>("/docs/all")
      .then((r) => setDocs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditSlug(null);
    setForm(emptyForm);
    setPreview(false);
    setShowModal(true);
  };

  const openEdit = async (doc: Doc) => {
    setEditSlug(doc.slug);
    setPreview(false);
    try {
      const { data } = await api.get<Doc>(`/docs/${doc.slug}`);
      setForm({
        slug: data.slug,
        title: data.title,
        content: data.content,
        category: data.category,
        order_index: String(data.order_index),
        is_published: data.is_published,
      });
    } catch {
      setForm({
        slug: doc.slug,
        title: doc.title,
        content: "",
        category: doc.category,
        order_index: String(doc.order_index),
        is_published: doc.is_published,
      });
    }
    setShowModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, order_index: parseInt(form.order_index) || 0 };
      if (editSlug) {
        await api.patch(`/docs/${editSlug}`, payload);
        toast.success("Doc updated!");
      } else {
        await api.post("/docs", payload);
        toast.success("Doc created!");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteDoc = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/docs/${slug}`);
      toast.success("Doc deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Documentation"
        subtitle="Create and manage platform documentation"
        badge={{ label: "Admin", variant: "active" }}
        actions={<Button onClick={openCreate}>+ New Doc</Button>}
      />

      <DataTable
        loading={loading}
        data={docs}
        keyExtractor={(d) => d.id}
        emptyIcon="📚"
        emptyTitle="No docs yet"
        emptyDescription="Create your first documentation article."
        emptyAction={<Button size="sm" onClick={openCreate}>Create doc</Button>}
        columns={[
          {
            key: "title",
            header: "Title",
            render: (d) => <span className="font-medium text-[#ededed]">{d.title}</span>,
          },
          {
            key: "slug",
            header: "Slug",
            render: (d) => (
              <code className="text-xs text-[rgba(237,237,237,0.45)]">{d.slug}</code>
            ),
          },
          {
            key: "category",
            header: "Category",
            render: (d) => (
              <span className="text-xs text-[rgba(237,237,237,0.5)]">{d.category}</span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (d) => (
              <Badge
                label={d.is_published ? "Published" : "Draft"}
                variant={d.is_published ? "completed" : "draft"}
              />
            ),
          },
          {
            key: "order",
            header: "#",
            render: (d) => (
              <span className="text-xs text-[rgba(237,237,237,0.35)]">{d.order_index}</span>
            ),
          },
          {
            key: "actions",
            header: "",
            width: "120px",
            render: (d) => (
              <div className="flex gap-1.5">
                <Button size="xs" variant="secondary" onClick={() => openEdit(d)}>Edit</Button>
                <Button size="xs" variant="danger" onClick={() => deleteDoc(d.slug, d.title)}>Del</Button>
              </div>
            ),
          },
        ]}
      />

      {/* Create / Edit modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editSlug ? "Edit Documentation" : "New Documentation"}
        subtitle={editSlug ? `Editing: ${editSlug}` : "Create a new article"}
        maxWidth="max-w-3xl"
      >
        <div className="flex flex-col gap-4">
          {/* Tabs: Edit / Preview */}
          <div className="flex gap-1 p-1 rounded-xl self-start" style={{ background: "rgba(255,255,255,0.04)" }}>
            {["Edit", "Preview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setPreview(tab === "Preview")}
                className="px-4 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  background: (preview ? tab === "Preview" : tab === "Edit") ? "rgba(232,53,144,0.15)" : "transparent",
                  color: (preview ? tab === "Preview" : tab === "Edit") ? "#e83590" : "rgba(237,237,237,0.5)",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {preview ? (
            <GlassCard padding="p-5">
              <h2 className="text-lg font-bold text-[#ededed] mb-1">{form.title || "Untitled"}</h2>
              <p className="text-xs text-[rgba(237,237,237,0.35)] mb-4">{form.category}</p>
              <pre
                className="whitespace-pre-wrap text-sm leading-7 text-[rgba(237,237,237,0.8)]"
                style={{ fontFamily: "var(--font-geist-sans)" }}
              >
                {form.content || "No content yet…"}
              </pre>
            </GlassCard>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {!editSlug && (
                  <Input
                    label="Slug"
                    value={form.slug}
                    onChange={set("slug")}
                    placeholder="getting-started"
                    hint="URL-friendly identifier, e.g. api-quickstart"
                  />
                )}
                <Input label="Title" value={form.title} onChange={set("title")} placeholder="Getting Started" />
                <Select label="Category" value={form.category} onChange={set("category")}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Input label="Order" type="number" value={form.order_index} onChange={set("order_index")} />
              </div>

              <Textarea
                label="Content (Markdown supported)"
                value={form.content}
                onChange={set("content")}
                rows={12}
                className="font-mono text-xs leading-relaxed"
                placeholder="# Getting Started&#10;&#10;Welcome to Yo Verify…"
              />

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setForm((p) => ({ ...p, is_published: !p.is_published }))}
                  className="w-10 h-5 rounded-full relative transition-all duration-200 cursor-pointer"
                  style={{ background: form.is_published ? "#e83590" : "rgba(255,255,255,0.1)" }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
                    style={{ left: form.is_published ? "22px" : "2px" }}
                  />
                </div>
                <span className="text-sm text-[rgba(237,237,237,0.7)]">
                  {form.is_published ? "Published" : "Draft"}
                </span>
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button
              onClick={save}
              loading={saving}
              disabled={!form.title.trim() || (!editSlug && !form.slug.trim())}
              className="flex-1"
            >
              {editSlug ? "Save Changes" : "Publish Doc"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
