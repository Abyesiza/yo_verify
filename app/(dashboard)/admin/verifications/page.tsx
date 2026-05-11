"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import TopBar from "@/components/layout/TopBar";
import DataTable from "@/components/layout/DataTable";
import GlassCard from "@/components/ui/GlassCard";
import Badge, { statusVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Textarea, Select } from "@/components/ui/Input";

interface Verification {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  external_ref: string | null;
  subject_data: Record<string, unknown>;
  result: Record<string, unknown> | null;
  notes: string | null;
  client_id: string;
  verification_type_id: string;
}

const STATUSES = ["pending", "processing", "completed", "failed", "rejected"];

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<Verification | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const url = filterStatus ? `/verifications/admin/all?status=${filterStatus}` : "/verifications/admin/all";
    api.get<Verification[]>(url)
      .then((r) => setVerifications(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const openUpdate = (v: Verification) => {
    setSelected(v);
    setNewStatus(v.status);
    setNotes(v.notes ?? "");
  };

  const updateStatus = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      await api.patch(`/verifications/admin/${selected.id}`, {
        status: newStatus,
        notes: notes || undefined,
      });
      toast.success("Status updated!");
      setSelected(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Verification Requests"
        subtitle="Review and update all verification requests"
        badge={{ label: "Admin", variant: "active" }}
      />

      {/* Status filter pills */}
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

      <DataTable
        loading={loading}
        data={verifications}
        keyExtractor={(v) => v.id}
        emptyIcon="🔍"
        emptyTitle="No verification requests"
        emptyDescription={filterStatus ? `No ${filterStatus} requests.` : undefined}
        columns={[
          {
            key: "id",
            header: "ID",
            render: (v) => <span className="font-mono text-xs text-[rgba(237,237,237,0.5)]">#{v.id.slice(0, 8)}</span>,
          },
          {
            key: "ref",
            header: "Reference",
            render: (v) => <span className="text-[rgba(237,237,237,0.55)]">{v.external_ref ?? "—"}</span>,
          },
          {
            key: "status",
            header: "Status",
            render: (v) => <Badge label={v.status} variant={statusVariant(v.status)} />,
          },
          {
            key: "subject",
            header: "Subject Preview",
            render: (v) => (
              <span className="text-xs text-[rgba(237,237,237,0.4)] font-mono">
                {Object.keys(v.subject_data).slice(0, 2).join(", ")}…
              </span>
            ),
          },
          {
            key: "date",
            header: "Submitted",
            render: (v) => (
              <span className="text-xs text-[rgba(237,237,237,0.4)]">
                {format(new Date(v.created_at), "MMM d, yyyy")}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            width: "100px",
            render: (v) => <Button size="xs" variant="secondary" onClick={() => openUpdate(v)}>Update</Button>,
          },
        ]}
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Update Verification" subtitle={`Request #${selected?.id.slice(0, 8)}`}>
        {selected && (
          <div className="flex flex-col gap-4">
            {/* Subject data */}
            <div>
              <div className="text-xs text-[rgba(237,237,237,0.4)] mb-2">Subject Data</div>
              <pre
                className="rounded-xl p-3 text-xs max-h-32 overflow-auto"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#18c3f4" }}
              >
                {JSON.stringify(selected.subject_data, null, 2)}
              </pre>
            </div>

            <Select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>

            <Textarea
              label="Admin Notes (visible to client)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes or feedback for the client…"
            />

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelected(null)} className="flex-1">Cancel</Button>
              <Button onClick={updateStatus} loading={updating} className="flex-1">Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
