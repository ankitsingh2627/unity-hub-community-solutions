import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  component: () => <RequireAuth><Dashboard /></RequireAuth>,
  head: () => ({ meta: [{ title: "Reading room — UnityHub" }] }),
});

function Dashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ open: 0, notices: 0, events: 0, resolved: 0 });
  const [name, setName] = useState("");
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    (async () => {
      const [open, notices, events, resolved, profile] = await Promise.all([
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }).gte("event_date", new Date().toISOString()),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("status", "resolved"),
        supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle(),
      ]);
      setStats({ open: open.count ?? 0, notices: notices.count ?? 0, events: events.count ?? 0, resolved: resolved.count ?? 0 });
      setName(profile.data?.full_name ?? "");
    })();
  }, [user]);

  const sections = [
    { to: "/complaints" as const, k: "01", label: "Issues", value: stats.open, suffix: "open" },
    { to: "/announcements" as const, k: "02", label: "Notices", value: stats.notices, suffix: "posted" },
    { to: "/events" as const, k: "03", label: "Events", value: stats.events, suffix: "ahead" },
    { to: "/complaints" as const, k: "04", label: "Resolved", value: stats.resolved, suffix: "to date" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container mx-auto px-6 py-12 md:py-16">
        {/* Masthead */}
        <header className="border-y-2 border-foreground py-6">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span>{today}</span>
            <span>{role === "admin" ? "Editor's desk" : "Resident edition"}</span>
          </div>
          <h1 className="mt-4 font-display text-6xl leading-[0.9] md:text-8xl">
            Good day,<br /><em className="italic text-primary">{name?.split(" ")[0] || "neighbour"}.</em>
          </h1>
          <p className="mt-4 max-w-xl text-foreground/75">A short briefing on your society — what's open, what's posted, and what's coming up.</p>
        </header>

        {/* Index grid */}
        <section className="mt-12 grid divide-y divide-border border border-border md:grid-cols-4 md:divide-x md:divide-y-0">
          {sections.map((s) => (
            <Link key={s.k} to={s.to} className="group block bg-card p-6 transition hover:bg-muted md:p-8">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">№ {s.k}</span>
                <span className="font-mono text-xs text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground">→</span>
              </div>
              <div className="mt-6 font-display text-7xl leading-none">{s.value}</div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/80">{s.label} <span className="text-muted-foreground">· {s.suffix}</span></div>
            </Link>
          ))}
        </section>

        {/* Quick reads */}
        <section className="mt-16 grid gap-8 md:grid-cols-3">
          <FeaturedCard k="Raise an issue" body="Lift, water, parking — anything that needs the society's attention." to="/complaints" />
          <FeaturedCard k="Read the notices" body="Maintenance, urgent updates, and event invitations, beautifully delivered." to="/announcements" />
          <FeaturedCard k="Events & polls" body="Plan together. Vote together. Live together — a little better." to="/events" />
        </section>
      </div>
    </div>
  );
}

function FeaturedCard({ k, body, to }: { k: string; body: string; to: "/complaints" | "/announcements" | "/events" }) {
  return (
    <Link to={to} className="group flex flex-col justify-between rounded-md bg-gradient-card p-7 shadow-paper transition hover:shadow-lift">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Section</span>
        <h3 className="mt-3 font-display text-3xl leading-tight">{k}</h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/75">{body}</p>
      </div>
      <span className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition group-hover:text-foreground">Open →</span>
    </Link>
  );
}
