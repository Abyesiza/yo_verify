"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";

interface Doc { id: string; slug: string; title: string; category: string; order_index: number; }

const categoryIcons: Record<string, string> = {
  general: "📖",
  integration: "🔌",
  "api-reference": "📡",
  guides: "🗺️",
  security: "🔒",
};

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Doc[]>("/docs")
      .then((r) => setDocs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const categories = [...new Set(docs.map((d) => d.category))];

  return (
    <div className="animate-fade-in">
      <TopBar title="Documentation" subtitle="Guides, API reference, and integration help" />

      {docs.length === 0 ? (
        <EmptyState icon="📚" title="Documentation coming soon" description="Our team is writing comprehensive guides. Check back soon!" />
      ) : (
        <div className="flex flex-col gap-10">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{categoryIcons[cat] ?? "📄"}</span>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-[rgba(237,237,237,0.4)]">
                  {cat.replace("-", " ")}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs
                  .filter((d) => d.category === cat)
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((doc) => (
                    <Link key={doc.slug} href={`/docs/${doc.slug}`}>
                      <GlassCard hover className="h-full flex flex-col gap-2">
                        <h3 className="font-medium text-[#ededed] text-sm leading-snug">{doc.title}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full w-fit mt-auto"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(237,237,237,0.4)" }}
                        >
                          {doc.category}
                        </span>
                      </GlassCard>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
