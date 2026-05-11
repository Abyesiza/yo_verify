"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { api, getErrorMessage } from "@/lib/api";
import TopBar from "@/components/layout/TopBar";
import StatCard from "@/components/layout/StatCard";
import GlassCard from "@/components/ui/GlassCard";
import Badge, { statusVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";

interface ClientProfile {
  id: string;
  name: string;
  plan: string;
  type: string;
  is_active: boolean;
}

interface VerificationRow {
  id: string;
  status: string;
  created_at: string;
  verification_type_id: string;
  external_ref: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [verifications, setVerifications] = useState<VerificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [clientRes, verifRes] = await Promise.allSettled([
          api.get<ClientProfile>("/clients/me"),
          api.get<VerificationRow[]>("/verifications?limit=6"),
        ]);
        if (clientRes.status === "fulfilled") setClient(clientRes.value.data);
        if (verifRes.status === "fulfilled") setVerifications(verifRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  const pending = verifications.filter((v) => v.status === "pending").length;
  const completed = verifications.filter((v) => v.status === "completed").length;

  return (
    <div className="animate-fade-in">
      <TopBar
        title={`Welcome, ${user?.full_name?.split(" ")[0] ?? "there"} 👋`}
        subtitle="Here's an overview of your Yo Verify account"
      />

      {/* Email verification banner */}
      {!user?.email_verified && (
        <GlassCard
          className="mb-6 flex items-center gap-4"
          padding="p-4"
          style={{ borderColor: "rgba(245,163,30,0.25)", background: "rgba(245,163,30,0.05)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: "rgba(245,163,30,0.15)" }}
          >
            📧
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[#ededed]">Verify your email address</div>
            <div className="text-xs text-[rgba(237,237,237,0.5)]">
              Check your inbox for a verification link to unlock all features.
            </div>
          </div>
          <Badge label="Action required" variant="pending" />
        </GlassCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Requests" value={verifications.length} icon="🔍" color="#18c3f4" />
        <StatCard label="Pending" value={pending} icon="⏳" color="#f5a31e" />
        <StatCard label="Completed" value={completed} icon="✅" color="#4ade80" />
        <StatCard
          label="Plan"
          value={client?.plan?.toUpperCase() ?? "—"}
          icon="💳"
          color="#e83590"
          sub={client?.type ?? undefined}
        />
      </div>

      {/* Setup prompt */}
      {!client && (
        <GlassCard className="mb-8" style={{ borderColor: "rgba(24,195,244,0.2)", background: "rgba(24,195,244,0.04)" }}>
          <div className="flex items-start gap-4">
            <div className="text-3xl">🚀</div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#ededed] mb-1">Complete your setup</h3>
              <p className="text-sm text-[rgba(237,237,237,0.5)] mb-4">
                Create your client profile to start submitting verifications and generating API keys for your integrations.
              </p>
              <Link href="/settings">
                <Button>Set up profile →</Button>
              </Link>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Quick links */}
      {client && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { href: "/verifications", icon: "🔍", label: "Submit Verification", desc: "Start a new verification request" },
            { href: "/api-keys", icon: "🔑", label: "Manage API Keys", desc: "Create keys for your integrations" },
            { href: "/docs", icon: "📚", label: "Read the Docs", desc: "Learn how to integrate Yo Verify" },
          ].map(({ href, icon, label, desc }) => (
            <Link key={href} href={href}>
              <GlassCard hover className="h-full">
                <div className="text-2xl mb-3">{icon}</div>
                <div className="font-medium text-[#ededed] text-sm mb-1">{label}</div>
                <div className="text-xs text-[rgba(237,237,237,0.45)]">{desc}</div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}

      {/* Recent verifications */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#ededed]">Recent Verifications</h3>
          <Link href="/verifications">
            <Button variant="ghost" size="sm">View all →</Button>
          </Link>
        </div>

        {verifications.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No verifications yet"
            description="Submit your first verification request to get started."
            action={
              <Link href="/verifications">
                <Button size="sm">Submit verification</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.05)]">
            {verifications.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-[#ededed] font-mono">#{v.id.slice(0, 8)}</div>
                  <div className="text-xs text-[rgba(237,237,237,0.4)] mt-0.5">
                    {v.external_ref ? `ref: ${v.external_ref}` : format(new Date(v.created_at), "MMM d, yyyy · h:mm a")}
                  </div>
                </div>
                <Badge label={v.status} variant={statusVariant(v.status)} />
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
