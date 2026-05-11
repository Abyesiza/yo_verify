"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "@/lib/api";
import TopBar from "@/components/layout/TopBar";
import DataTable from "@/components/layout/DataTable";
import Badge from "@/components/ui/Badge";
import PageLoader from "@/components/ui/PageLoader";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  user_role: string;
  email_verified: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<User[]>("/admin/users")
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <TopBar
        title="Users"
        subtitle={`${users.length} registered user${users.length !== 1 ? "s" : ""}`}
        badge={{ label: "Admin", variant: "active" }}
      />

      <DataTable
        loading={loading}
        data={users}
        keyExtractor={(u) => u.id}
        emptyIcon="👥"
        emptyTitle="No users yet"
        columns={[
          {
            key: "name",
            header: "Name",
            render: (u) => (
              <span className="font-medium text-[#ededed]">{u.full_name ?? "—"}</span>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (u) => <span className="text-[rgba(237,237,237,0.65)]">{u.email}</span>,
          },
          {
            key: "role",
            header: "Role",
            render: (u) => (
              <Badge
                label={u.user_role}
                variant={u.user_role === "admin" ? "admin" : "default"}
              />
            ),
          },
          {
            key: "verified",
            header: "Email",
            render: (u) => (
              <Badge
                label={u.email_verified ? "Verified" : "Pending"}
                variant={u.email_verified ? "completed" : "pending"}
              />
            ),
          },
          {
            key: "joined",
            header: "Joined",
            render: (u) => (
              <span className="text-xs text-[rgba(237,237,237,0.4)]">
                {format(new Date(u.created_at), "MMM d, yyyy")}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
