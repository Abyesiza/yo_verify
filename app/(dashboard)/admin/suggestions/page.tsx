"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Textarea, Select } from "@/components/ui/Input";
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

const STATUSES = ["pending", "reviewing", "approved", "rejected"];

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [response, setResponse] = useState("");
  const [responding, setResponding] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const url = filterStatus ? `/suggestions/admin/all?status=${filterStatus}` : "/suggestions/admin/all";
    api.get<Suggestion[]>(url)
      .then((r) => setSuggestions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const openRespond = (s: Suggestion) => {
    setSelected(s);
    setNewStatus(s.status);
    setResponse(s.admin_response ?? "");
  };

  const respond = async () => {
    if (!selected) return;
    setResponding(true);
    try {
      await api.patch(`/suggestions/admin/${selected.id}`, {
        status: newStatus,
        admin_response: response || undefined,
      });
      toast.success("Response sent!");
      setSelected(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResponding(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Suggestions"
        subtitle="Review and respond to client feature requests"
        badge={{ label: "Admin", variant: "active" }}
      />

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["", ...STATUSES].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all duration-150"
            style={{
              background: filterStatus === s ? "#e83590" : "rgba(255,255,255,0.05)",
              color: filterStatus === s ? "#fff" : "rgba(237,237,237,0.5)",
              border: filterStatus === s ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {suggestions.length === 0 ? (
        <EmptyState icon="💡" title="No suggestions" description={filterStatus ? `No ${filterStatus} suggestions.` : "No suggestions yet."} />
      ) : (
        <div className="flex flex-col gap-4">
          {suggestions.map((s) => (
            <GlassCard key={s.id}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-semibold text-[#ededed] leading-snug">{s.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    label={s.status}
                    variant={
                      s.status === "approved" ? "completed"
                      : s.status === "rejected" ? "rejected"
                      : s.status === "reviewing" ? "processing"
                      : "pending"
                    }
                  />
                  <Button size="xs" variant="secondary" onClick={() => openRespond(s)}>
                    Respond
                  </Button>
                </div>
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
                  className="rounded-xl p-3 mt-2"
                  style={{ background: "rgba(24,195,244,0.05)", border: "1px solid rgba(24,195,244,0.15)" }}
                >
                  <div className="text-xs text-[#18c3f4] mb-1">Your response</div>
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

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Respond to Suggestion" subtitle={selected?.title}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-xl p-4 text-sm text-[rgba(237,237,237,0.65)] leading-relaxed"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {selected.description}
            </div>

            <Select
              label="Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>

            <Textarea
              label="Response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              placeholder="Write your response to the client…"
            />

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelected(null)} className="flex-1">Cancel</Button>
              <Button onClick={respond} loading={responding} className="flex-1">Send Response</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
