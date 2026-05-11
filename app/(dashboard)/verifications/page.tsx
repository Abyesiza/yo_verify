"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import TopBar from "@/components/layout/TopBar";
import DataTable from "@/components/layout/DataTable";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Badge, { statusVariant } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";

interface VerificationType { id: string; name: string; slug: string; icon: string | null; description: string | null; }
interface Verification {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  external_ref: string | null;
  verification_type_id: string;
  subject_data: Record<string, unknown>;
  result: Record<string, unknown> | null;
  notes: string | null;
}

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [types, setTypes] = useState<VerificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [detail, setDetail] = useState<Verification | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ verification_type_id: "", subject_data: "{}", external_ref: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [verifRes, typesRes] = await Promise.all([
        api.get<Verification[]>("/verifications"),
        api.get<VerificationType[]>("/verification-types"),
      ]);
      setVerifications(verifRes.data);
      setTypes(typesRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const typeName = (id: string) => types.find((t) => t.id === id)?.name ?? "Unknown";
  const typeIcon = (id: string) => types.find((t) => t.id === id)?.icon ?? "🔍";

  const handleSubmit = async () => {
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(form.subject_data); }
    catch { toast.error("Invalid JSON in subject data"); return; }

    setSubmitting(true);
    try {
      await api.post("/verifications", {
        verification_type_id: form.verification_type_id,
        subject_data: parsed,
        external_ref: form.external_ref || undefined,
      });
      toast.success("Verification submitted!");
      setShowSubmit(false);
      setForm({ verification_type_id: "", subject_data: "{}", external_ref: "" });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Verifications"
        subtitle="Track all verification requests submitted via dashboard or API"
        actions={<Button onClick={() => setShowSubmit(true)}>+ Submit Request</Button>}
      />

      <DataTable
        loading={loading}
        data={verifications}
        keyExtractor={(v) => v.id}
        emptyIcon="🔍"
        emptyTitle="No verification requests yet"
        emptyDescription="Submit a verification or use your API key to submit from your app."
        emptyAction={<Button size="sm" onClick={() => setShowSubmit(true)}>Submit verification</Button>}
        columns={[
          {
            key: "id",
            header: "Request ID",
            render: (v) => (
              <span className="font-mono text-xs text-[rgba(237,237,237,0.6)]">
                #{v.id.slice(0, 8)}
              </span>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (v) => (
              <span className="flex items-center gap-2">
                <span>{typeIcon(v.verification_type_id)}</span>
                <span className="text-[#ededed]">{typeName(v.verification_type_id)}</span>
              </span>
            ),
          },
          {
            key: "ref",
            header: "Your Reference",
            render: (v) => (
              <span className="text-[rgba(237,237,237,0.5)]">{v.external_ref ?? "—"}</span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (v) => <Badge label={v.status} variant={statusVariant(v.status)} />,
          },
          {
            key: "date",
            header: "Submitted",
            render: (v) => (
              <span className="text-[rgba(237,237,237,0.45)] text-xs">
                {format(new Date(v.created_at), "MMM d, yyyy")}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            width: "80px",
            render: (v) => (
              <Button size="xs" variant="ghost" onClick={() => setDetail(v)}>Details</Button>
            ),
          },
        ]}
      />

      {/* Submit modal */}
      <Modal open={showSubmit} onClose={() => setShowSubmit(false)} title="Submit Verification" subtitle="Submit a new verification request">
        <div className="flex flex-col gap-4">
          <Select
            label="Verification Type"
            value={form.verification_type_id}
            onChange={(e) => setForm((p) => ({ ...p, verification_type_id: e.target.value }))}
            required
          >
            <option value="">Select a type…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.name}
              </option>
            ))}
          </Select>

          <Input
            label="Your Reference (optional)"
            value={form.external_ref}
            onChange={(e) => setForm((p) => ({ ...p, external_ref: e.target.value }))}
            placeholder="e.g. user_123 or order_456"
            hint="Your internal ID — returned in all responses"
          />

          <Textarea
            label="Subject Data (JSON)"
            value={form.subject_data}
            onChange={(e) => setForm((p) => ({ ...p, subject_data: e.target.value }))}
            rows={6}
            hint='Data about the person/entity being verified. e.g. {"full_name":"Jane Doe","id_number":"CM12345"}'
            className="font-mono text-xs"
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowSubmit(false)} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!form.verification_type_id}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Verification Details" maxWidth="max-w-2xl">
        {detail && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Request ID", <span key="id" className="font-mono text-xs">#{detail.id.slice(0, 8)}</span>],
                ["Status", <Badge key="s" label={detail.status} variant={statusVariant(detail.status)} />],
                ["Type", typeName(detail.verification_type_id)],
                ["Reference", detail.external_ref ?? "—"],
                ["Submitted", format(new Date(detail.created_at), "PPp")],
                ["Updated", format(new Date(detail.updated_at), "PPp")],
              ].map(([k, v]) => (
                <div key={String(k)}>
                  <div className="text-xs text-[rgba(237,237,237,0.4)] mb-1">{k}</div>
                  <div className="text-sm text-[#ededed]">{v}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-xs text-[rgba(237,237,237,0.4)] mb-2">Subject Data</div>
              <pre
                className="rounded-xl p-4 text-xs overflow-auto max-h-40 leading-relaxed"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#18c3f4" }}
              >
                {JSON.stringify(detail.subject_data, null, 2)}
              </pre>
            </div>

            {detail.result && (
              <div>
                <div className="text-xs text-[rgba(237,237,237,0.4)] mb-2">Result</div>
                <pre
                  className="rounded-xl p-4 text-xs overflow-auto max-h-40 leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(34,197,94,0.15)", color: "#4ade80" }}
                >
                  {JSON.stringify(detail.result, null, 2)}
                </pre>
              </div>
            )}

            {detail.notes && (
              <div
                className="rounded-xl p-4"
                style={{ background: "rgba(24,195,244,0.05)", border: "1px solid rgba(24,195,244,0.15)" }}
              >
                <div className="text-xs text-[#18c3f4] mb-1">Note from Yo Verify</div>
                <p className="text-sm text-[#ededed]">{detail.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
