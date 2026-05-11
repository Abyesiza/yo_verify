"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import TopBar from "@/components/layout/TopBar";
import DataTable from "@/components/layout/DataTable";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  last_used_at: string | null;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ApiKey[]>("/api-keys");
      setKeys(data);
    } catch {
      /* client profile may not exist yet */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createKey = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post<ApiKey & { full_key: string }>("/api-keys", { name: newName.trim() });
      setRevealedKey(data.full_key);
      setNewName("");
      setShowCreate(false);
      toast.success("API key created!");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string, name: string) => {
    if (!confirm(`Revoke "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api-keys/${id}`);
      toast.success("Key revoked");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <div className="animate-fade-in">
      <TopBar
        title="API Keys"
        subtitle="Manage keys used by your apps to call the Yo Verify API"
        actions={<Button onClick={() => setShowCreate(true)}>+ New Key</Button>}
      />

      {/* Integration info card */}
      <GlassCard
        className="mb-6"
        padding="p-5"
        style={{ borderColor: "rgba(24,195,244,0.15)", background: "rgba(24,195,244,0.03)" }}
      >
        <div className="flex items-start gap-4">
          <span className="text-2xl">🔌</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#ededed] mb-2">Integrating Yo Verify</div>
            <div className="text-xs text-[rgba(237,237,237,0.55)] space-y-1.5">
              <div>
                <span className="text-[rgba(237,237,237,0.35)]">Base URL: </span>
                <code
                  className="px-1.5 py-0.5 rounded text-[#18c3f4] cursor-pointer"
                  style={{ background: "rgba(24,195,244,0.08)" }}
                  onClick={() => copy(`${API_BASE}/api/v1`)}
                >
                  {API_BASE}/api/v1
                </code>
              </div>
              <div>
                <span className="text-[rgba(237,237,237,0.35)]">Auth header: </span>
                <code
                  className="px-1.5 py-0.5 rounded text-[#18c3f4] cursor-pointer"
                  style={{ background: "rgba(24,195,244,0.08)" }}
                  onClick={() => copy("Authorization: Bearer yv_<your-key>")}
                >
                  Authorization: Bearer yv_&lt;your-key&gt;
                </code>
              </div>
              <div>
                <span className="text-[rgba(237,237,237,0.35)]">Submit verification: </span>
                <code
                  className="px-1.5 py-0.5 rounded text-[#18c3f4] cursor-pointer"
                  style={{ background: "rgba(24,195,244,0.08)" }}
                  onClick={() => copy(`POST ${API_BASE}/api/v1/verify`)}
                >
                  POST /api/v1/verify
                </code>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <DataTable
        loading={loading}
        data={keys}
        keyExtractor={(k) => k.id}
        emptyIcon="🔑"
        emptyTitle="No API keys yet"
        emptyDescription="Create a key to integrate Yo Verify into your app."
        emptyAction={<Button size="sm" onClick={() => setShowCreate(true)}>Create key</Button>}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (k) => <span className="font-medium text-[#ededed]">{k.name}</span>,
          },
          {
            key: "prefix",
            header: "Key Preview",
            render: (k) => (
              <code
                className="px-2 py-0.5 rounded text-xs"
                style={{ background: "rgba(24,195,244,0.08)", color: "#18c3f4" }}
              >
                {k.key_prefix}••••••••
              </code>
            ),
          },
          {
            key: "perms",
            header: "Permissions",
            render: (k) => (
              <span className="text-xs text-[rgba(237,237,237,0.45)]">
                {k.permissions.join(", ")}
              </span>
            ),
          },
          {
            key: "used",
            header: "Last Used",
            render: (k) => (
              <span className="text-xs text-[rgba(237,237,237,0.45)]">
                {k.last_used_at ? format(new Date(k.last_used_at), "MMM d, yyyy") : "Never"}
              </span>
            ),
          },
          {
            key: "created",
            header: "Created",
            render: (k) => (
              <span className="text-xs text-[rgba(237,237,237,0.45)]">
                {format(new Date(k.created_at), "MMM d, yyyy")}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            width: "80px",
            render: (k) => (
              <Button size="xs" variant="danger" onClick={() => revokeKey(k.id, k.name)}>
                Revoke
              </Button>
            ),
          },
        ]}
      />

      {/* Create key modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create API Key" subtitle="Give the key a descriptive name">
        <div className="flex flex-col gap-4">
          <Input
            label="Key name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Production App, iOS Client"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && createKey()}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button onClick={createKey} loading={creating} disabled={!newName.trim()} className="flex-1">
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reveal modal — shown once only */}
      <Modal open={!!revealedKey} onClose={() => setRevealedKey(null)} title="Save your API key" subtitle="This key will never be shown again">
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(24,195,244,0.06)", border: "1px solid rgba(24,195,244,0.2)" }}
          >
            <div className="text-xs text-[rgba(237,237,237,0.45)] mb-2">Your API key</div>
            <code className="text-sm break-all text-[#18c3f4] leading-relaxed">{revealedKey}</code>
          </div>
          <Button
            variant="secondary"
            onClick={() => copy(revealedKey ?? "")}
          >
            Copy to clipboard
          </Button>
          <Button onClick={() => setRevealedKey(null)}>Done — I&apos;ve saved it</Button>
        </div>
      </Modal>
    </div>
  );
}
