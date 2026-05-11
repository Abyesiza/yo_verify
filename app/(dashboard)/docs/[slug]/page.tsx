"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { api } from "@/lib/api";
import TopBar from "@/components/layout/TopBar";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";

interface Doc {
  slug: string;
  title: string;
  content: string;
  category: string;
  updated_at: string;
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get<Doc>(`/docs/${params.slug}`)
      .then((r) => setDoc(r.data))
      .catch(() => setNotFound(true));
  }, [params.slug]);

  if (!doc && !notFound) return <PageLoader />;

  if (notFound) return (
    <div className="animate-fade-in">
      <TopBar title="Not Found" />
      <GlassCard className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-sm text-[rgba(237,237,237,0.5)] mb-4">This documentation page doesn&apos;t exist.</p>
        <Link href="/docs"><Button variant="secondary">← Back to Docs</Button></Link>
      </GlassCard>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <TopBar
        title={doc!.title}
        subtitle={doc!.category}
        actions={<Link href="/docs"><Button variant="ghost" size="sm">← All Docs</Button></Link>}
      />
      <GlassCard>
        <article className="max-w-none">
          {/* Rendered markdown as preformatted text — replace with a markdown renderer if available */}
          <pre
            className="whitespace-pre-wrap text-sm leading-7 text-[rgba(237,237,237,0.8)]"
            style={{ fontFamily: "var(--font-geist-sans), Arial, sans-serif" }}
          >
            {doc!.content}
          </pre>
        </article>
        <div
          className="mt-8 pt-4 text-xs text-[rgba(237,237,237,0.25)]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          Last updated {format(new Date(doc!.updated_at), "MMMM d, yyyy")}
        </div>
      </GlassCard>
    </div>
  );
}
