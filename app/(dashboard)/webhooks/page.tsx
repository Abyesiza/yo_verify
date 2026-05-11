"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "@/lib/api";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import PageLoader from "@/components/ui/PageLoader";
import { format } from "date-fns";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

const EVENT_OPTIONS = [
  { value: "verification.created", label: "Verification created" },
  { value: "verification.completed", label: "Verification completed" },
  { value: "verification.failed", label: "Verification failed" },
  { value: "verification.rejected", label: "Verification rejected" },
  { value: "verification.processing", label: "Verification processing" },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["verification.completed"]);

  const load = async () => {
    try {
      const { data } = await api.get<Webhook[]>("/webhooks");
      setWebhooks(data);
    } catch {
      // no webhooks or not configured
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleEvent = (val: string) =>
    setSelectedEvents((prev) =>
      prev.includes(val) ? prev.filter((e) => e !== val) : [...prev, val]
    );

  const create = async () => {
    if (!newUrl || selectedEvents.length === 0) return;
    setCreating(true);
    try {
      await api.post("/webhooks", { url: newUrl, events: selectedEvents });
      toast.success("Webhook created!");
      setShowCreate(false);
      setNewUrl("");
      setSelectedEvents(["verification.completed"]);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const deleteWebhook = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/webhooks/${deleteId}`);
      toast.success("Webhook removed");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (wh: Webhook) => {
    try {
      await api.patch(`/webhooks/${wh.id}`, { is_active: !wh.is_active });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Webhooks"
        subtitle="Receive real-time notifications when verifications change status"
        actions={
          <Button onClick={() => setShowCreate(true)}>+ Add webhook</Button>
        }
      />

      {/* Info card */}
      <GlassCard className="mb-6" padding="p-5" style={{ borderColor: "rgba(24,195,244,0.15)", background: "rgba(24,195,244,0.04)" }}>
        <div className="flex items-start gap-4">
          <div className="text-2xl">🔔</div>
          <div>
            <div className="text-sm font-semibold text-[#ededed] mb-1">How webhooks work</div>
            <div className="text-xs text-[rgba(237,237,237,0.5)] leading-relaxed max-w-xl">
              When a verification event occurs, we send a POST request to your endpoint with a JSON payload.
              Your endpoint must respond with a <span className="text-[#18c3f4] font-mono">2xx</span> status code within 10 seconds.
              Failed deliveries are retried up to 3 times with exponential back-off.
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Payload example */}
      <GlassCard className="mb-8" padding="p-5">
        <div className="text-xs text-[rgba(237,237,237,0.35)] mb-3 font-semibold uppercase tracking-wider">
          Example payload
        </div>
        <pre className="text-xs text-[rgba(237,237,237,0.65)] font-mono leading-relaxed overflow-x-auto">
          {JSON.stringify({
            event: "verification.completed",
            data: {
              id: "b3d7f12a-...",
              status: "completed",
              reference: "user_789",
              verification_type: "identity",
              result: { verified: true },
              updated_at: "2026-05-11T10:05:00Z",
            },
          }, null, 2)}
        </pre>
      </GlassCard>

      {/* Webhook list */}
      {webhooks.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No webhooks configured"
          description="Add a webhook endpoint to receive real-time event notifications."
          action={<Button onClick={() => setShowCreate(true)}>Add webhook</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {webhooks.map((wh) => (
            <GlassCard key={wh.id} padding="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-[#ededed] truncate">{wh.url}</span>
                    <Badge label={wh.is_active ? "Active" : "Disabled"} variant={wh.is_active ? "active" : "default"} dot />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {wh.events.map((ev) => (
                      <span
                        key={ev}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(24,195,244,0.08)", color: "#18c3f4", border: "1px solid rgba(24,195,244,0.15)" }}
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-[rgba(237,237,237,0.3)]">
                    Added {format(new Date(wh.created_at), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(wh)}>
                    {wh.is_active ? "Disable" : "Enable"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteId(wh.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create webhook modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Webhook"
        subtitle="Enter your endpoint URL and choose which events to subscribe to."
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Endpoint URL"
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://yourapp.com/webhooks/yoverify"
          />
          <div>
            <div className="text-xs text-[rgba(237,237,237,0.5)] mb-3">Events to subscribe</div>
            <div className="flex flex-col gap-2">
              {EVENT_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: selectedEvents.includes(value) ? "rgba(232,53,144,0.3)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${selectedEvents.includes(value) ? "rgba(232,53,144,0.5)" : "rgba(255,255,255,0.1)"}`,
                    }}
                    onClick={() => toggleEvent(value)}
                  >
                    {selectedEvents.includes(value) && <span className="text-[8px] text-[#e83590]">✓</span>}
                  </div>
                  <span
                    className="text-sm select-none"
                    style={{ color: selectedEvents.includes(value) ? "#ededed" : "rgba(237,237,237,0.45)" }}
                    onClick={() => toggleEvent(value)}
                  >
                    {label}
                    <span className="ml-2 text-xs font-mono text-[rgba(237,237,237,0.25)]">{value}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              onClick={create}
              loading={creating}
              disabled={!newUrl || selectedEvents.length === 0}
            >
              Add webhook
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remove Webhook"
        subtitle="Are you sure you want to remove this webhook? This cannot be undone."
      >
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={deleteWebhook} loading={deleting}>Remove</Button>
        </div>
      </Modal>
    </div>
  );
}
