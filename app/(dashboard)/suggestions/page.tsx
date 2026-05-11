"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Badge, { statusVariant } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  use_case: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", use_case: "" });

  const load = useCallback(async () => {
    setLoading(true);
    api.get<Suggestion[]>("/suggestions")
      .then((r) => setSuggestions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/suggestions", {
        title: form.title,
        description: form.description,
        use_case: form.use_case || undefined,
      });
      toast.success("Suggestion submitted! We'll review it soon.");
      setShowNew(false);
      setForm({ title: "", description: "", use_case: "" });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Suggestions"
        subtitle="Request new verification types or features"
        actions={<Button onClick={() => setShowNew(true)}>+ New Suggestion</Button>}
      />

      {suggestions.length === 0 ? (
        <EmptyState
          icon="💡"
          title="No suggestions yet"
          description="Have an idea for a new verification type? We'd love to hear it!"
          action={<Button size="sm" onClick={() => setShowNew(true)}>Submit a suggestion</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {suggestions.map((s) => (
            <GlassCard key={s.id}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold text-[#ededed] leading-snug">{s.title}</h3>
                <Badge
                  label={s.status}
                  variant={
                    s.status === "approved" ? "completed"
                    : s.status === "rejected" ? "rejected"
                    : s.status === "reviewing" ? "processing"
                    : "pending"
                  }
                />
              </div>

              <p className="text-sm text-[rgba(237,237,237,0.6)] leading-relaxed mb-3">
                {s.description}
              </p>

              {s.use_case && (
                <p className="text-xs text-[rgba(237,237,237,0.4)] italic mb-3">
                  Use case: {s.use_case}
                </p>
              )}

              {s.admin_response && (
                <div
                  className="rounded-xl p-4 mt-2"
                  style={{ background: "rgba(24,195,244,0.05)", border: "1px solid rgba(24,195,244,0.15)" }}
                >
                  <div className="text-xs text-[#18c3f4] font-medium mb-1.5">
                    Response from Yo Verify team
                  </div>
                  <p className="text-sm text-[#ededed]">{s.admin_response}</p>
                </div>
              )}

              <div className="text-xs text-[rgba(237,237,237,0.25)] mt-3">
                {format(new Date(s.created_at), "MMM d, yyyy")}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Suggestion" subtitle="Tell us what verification type you need">
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Bank statement verification"
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={set("description")}
            rows={4}
            placeholder="Describe what you need and why it would be useful…"
            required
          />
          <Input
            label="Use Case (optional)"
            value={form.use_case}
            onChange={set("use_case")}
            placeholder="e.g. Loan application onboarding"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowNew(false)} className="flex-1">Cancel</Button>
            <Button
              onClick={submit}
              loading={submitting}
              disabled={!form.title.trim() || !form.description.trim()}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
