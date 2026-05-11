"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { api } from "@/lib/api";
import TopBar from "@/components/layout/TopBar";
import StatCard from "@/components/layout/StatCard";
import GlassCard from "@/components/ui/GlassCard";
import Badge, { statusVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";

interface Stats {
  total_users: number;
  total_clients: number;
  total_verifications: number;
  pending_verifications: number;
}

interface Verification {
  id: string;
  status: string;
  created_at: string;
  external_ref: string | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<Stats>("/admin/stats"),
      api.get<Verification[]>("/verifications/admin/all?limit=8"),
    ]).then(([statsRes, verifRes]) => {
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (verifRes.status === "fulfilled") setVerifications(verifRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Admin Dashboard"
        subtitle="Platform-wide overview"
        badge={{ label: "Admin", variant: "active" }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users"          value={stats?.total_users ?? "—"}          icon="👥" color="#18c3f4" />
        <StatCard label="Total Clients"        value={stats?.total_clients ?? "—"}        icon="🏢" color="#e83590" />
        <StatCard label="Total Verifications"  value={stats?.total_verifications ?? "—"}  icon="🔍" color="#f5a31e" />
        <StatCard label="Pending Review"       value={stats?.pending_verifications ?? "—"} icon="⏳" color="#4ade80" />
      </div>

      {/* Quick admin links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { href: "/admin/users",              icon: "👥", label: "Manage Users" },
          { href: "/admin/verifications",      icon: "🔍", label: "Review Requests" },
          { href: "/admin/docs",               icon: "📚", label: "Edit Docs" },
          { href: "/admin/suggestions",        icon: "💡", label: "Suggestions" },
        ].map(({ href, icon, label }) => (
          <Link key={href} href={href}>
            <GlassCard hover className="text-center py-5">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-xs font-medium text-[rgba(237,237,237,0.7)]">{label}</div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* Recent verifications */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#ededed]">Recent Verification Requests</h3>
          <Link href="/admin/verifications">
            <Button variant="ghost" size="sm">View all →</Button>
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.05)]">
          {verifications.length === 0 ? (
            <p className="text-sm text-center py-8 text-[rgba(237,237,237,0.3)]">No verifications yet</p>
          ) : verifications.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-3">
              <div>
                <span className="font-mono text-sm text-[rgba(237,237,237,0.7)]">#{v.id.slice(0, 8)}</span>
                {v.external_ref && (
                  <span className="ml-2 text-xs text-[rgba(237,237,237,0.35)]">{v.external_ref}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[rgba(237,237,237,0.35)]">
                  {format(new Date(v.created_at), "MMM d")}
                </span>
                <Badge label={v.status} variant={statusVariant(v.status)} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
