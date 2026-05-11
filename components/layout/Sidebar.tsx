"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const clientNav: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard",     label: "Dashboard",     icon: "▦" },
      { href: "/verifications", label: "Verifications", icon: "🔍" },
    ],
  },
  {
    label: "Integration",
    items: [
      { href: "/api-keys",      label: "API Keys",       icon: "🔑" },
      { href: "/webhooks",      label: "Webhooks",       icon: "🔔" },
      { href: "/integrations",  label: "Integrations",  icon: "⚡" },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/docs",          label: "Documentation", icon: "📚" },
      { href: "/suggestions",   label: "Suggestions",   icon: "💡" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile",   label: "Profile",   icon: "👤" },
      { href: "/settings",  label: "Settings",  icon: "⚙️" },
    ],
  },
];

const adminNav: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard",           label: "Dashboard",          icon: "▦" },
      { href: "/admin/verifications",       label: "Verifications",      icon: "🔍" },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/users",               label: "Users",              icon: "👥" },
      { href: "/admin/clients",             label: "Clients",            icon: "🏢" },
      { href: "/admin/verification-types",  label: "Verify Types",       icon: "🗂️" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/docs",                label: "Documentation",      icon: "📚" },
      { href: "/admin/suggestions",         label: "Suggestions",        icon: "💡" },
    ],
  },
];

function NavLink({ href, label, icon }: NavItem) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && href !== "/admin/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5 ${
        isActive ? "" : "text-[rgba(237,237,237,0.5)] hover:text-[rgba(237,237,237,0.85)] hover:bg-[rgba(255,255,255,0.05)]"
      }`}
      style={
        isActive
          ? {
              background: "rgba(232,53,144,0.12)",
              color: "#e83590",
              boxShadow: "inset 0 0 0 1px rgba(232,53,144,0.15)",
            }
          : {}
      }
    >
      <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
      {label}
    </Link>
  );
}

function UserAvatar({ name, email }: { name: string; email: string }) {
  const initial = (name || email)[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: "rgba(232,53,144,0.2)", color: "#e83590" }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-[#ededed] truncate">{name || "User"}</div>
        <div className="text-xs truncate text-[rgba(237,237,237,0.4)]">{email}</div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const isAdmin = user?.user_role === "admin";
  const sections = isAdmin ? adminNav : clientNav;

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-40 select-none"
      style={{
        background: "rgba(8,8,14,0.97)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-3 px-5 py-5 border-b border-[rgba(255,255,255,0.05)]">
        <div className="relative w-8 h-8 flex-shrink-0">
          <Image src="/yofriend i.svg" alt="Yo Verify" fill className="object-contain" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wide text-[#ededed]">YO VERIFY</div>
          <div className="text-[10px] text-[rgba(237,237,237,0.3)] tracking-widest uppercase">
            {isAdmin ? "Admin Panel" : "Platform"}
          </div>
        </div>
      </Link>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-3">
        {sections.map((section) => (
          <div key={section.label} className="mb-1">
            <div className="px-5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(237,237,237,0.2)]">
                {section.label}
              </p>
            </div>
            {section.items.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: user + sign out */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.05)]">
        {user && (
          <UserAvatar name={user.full_name ?? ""} email={user.email} />
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all
            text-[rgba(237,237,237,0.4)] hover:text-[rgba(237,237,237,0.75)] hover:bg-[rgba(255,255,255,0.04)]"
        >
          <span>↩</span> Sign out
        </button>
      </div>
    </aside>
  );
}
