"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";

interface Client {
  id: string;
  user_id: string;
  name: string;
  type: string;
  plan: string;
  is_active: boolean;
  website: string | null;
  description: string | null;
  created_at: string;
  user_email?: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [toggling, setToggling] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get<Client[]>("/clients");
      setClients(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (c: Client) => {
    setToggling(true);
    try {
      await api.patch(`/clients/${c.id}`, { is_active: !c.is_active });
      toast.success(`Client ${c.is_active ? "deactivated" : "activated"}`);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(false);
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.user_email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Clients"
        subtitle={`${clients.length} registered client${clients.length !== 1 ? "s" : ""}`}
      />

      <GlassCard>
        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#ededed",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(232,53,144,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="🏢" title="No clients found" description="No clients match your search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  {["Organisation", "Type", "Plan", "Status", "Joined", ""].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[rgba(237,237,237,0.35)] first:pl-0 last:pr-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {filtered.map((c) => (
                  <tr key={c.id} className="group hover:bg-[rgba(255,255,255,0.015)] transition-colors">
                    <td className="py-3.5 px-4 pl-0">
                      <div className="font-medium text-[#ededed]">{c.name}</div>
                      {c.user_email && (
                        <div className="text-xs text-[rgba(237,237,237,0.35)] mt-0.5">{c.user_email}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[rgba(237,237,237,0.55)] capitalize">{c.type}</td>
                    <td className="py-3.5 px-4">
                      <Badge label={c.plan.toUpperCase()} variant="active" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        label={c.is_active ? "Active" : "Suspended"}
                        variant={c.is_active ? "completed" : "rejected"}
                        dot
                      />
                    </td>
                    <td className="py-3.5 px-4 text-[rgba(237,237,237,0.4)] text-xs">
                      {format(new Date(c.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-3.5 px-4 pr-0 text-right">
                      <Button variant="ghost" size="xs" onClick={() => setSelected(c)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Client detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={selected?.type ? `${selected.type} · ${selected.plan} plan` : ""}
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "ID", value: selected.id.slice(0, 12) + "…" },
                { label: "Status", value: selected.is_active ? "Active" : "Suspended" },
                { label: "Website", value: selected.website ?? "—" },
                { label: "Joined", value: format(new Date(selected.created_at), "MMM d, yyyy") },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-[rgba(237,237,237,0.35)] mb-1">{label}</div>
                  <div className="text-[#ededed]">{value}</div>
                </div>
              ))}
            </div>

            {selected.description && (
              <div>
                <div className="text-xs text-[rgba(237,237,237,0.35)] mb-1">Description</div>
                <div className="text-sm text-[rgba(237,237,237,0.65)]">{selected.description}</div>
              </div>
            )}

            <div
              className="rounded-xl p-4 text-sm"
              style={{
                background: selected.is_active ? "rgba(239,68,68,0.05)" : "rgba(34,197,94,0.05)",
                border: `1px solid ${selected.is_active ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"}`,
                color: "rgba(237,237,237,0.55)",
              }}
            >
              {selected.is_active
                ? "Suspending this client will prevent them from submitting new verifications and using their API keys."
                : "Activating this client will restore their access to the platform and API."}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
              <Button
                variant={selected.is_active ? "danger" : "primary"}
                onClick={() => toggle(selected)}
                loading={toggling}
              >
                {selected.is_active ? "Suspend client" : "Activate client"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
