import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Megaphone, CalendarHeart, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => <RequireAuth><Dashboard /></RequireAuth>,
  head: () => ({ meta: [{ title: "Dashboard — UnityHub" }] }),
});

function Dashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ open: 0, notices: 0, events: 0, resolved: 0 });
  const [name, setName] = useState("");

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

  const cards = [
    { to: "/complaints" as const, icon: MessageSquare, label: "Open issues", value: stats.open, gradient: "from-primary to-primary-glow" },
    { to: "/announcements" as const, icon: Megaphone, label: "Notices", value: stats.notices, gradient: "from-secondary to-primary" },
    { to: "/events" as const, icon: CalendarHeart, label: "Upcoming events", value: stats.events, gradient: "from-accent to-warning" },
    { to: "/complaints" as const, icon: TrendingUp, label: "Resolved", value: stats.resolved, gradient: "from-success to-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-black sm:text-5xl">Hi {name?.split(" ")[0] || "there"} 👋</h1>
          <p className="mt-1 text-muted-foreground">{role === "admin" ? "You're managing this society." : "Welcome to your community space."}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link key={c.label} to={c.to} className="group relative overflow-hidden rounded-3xl bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-playful">
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.gradient} opacity-20 transition group-hover:opacity-40`} />
              <c.icon className="h-7 w-7 text-primary" />
              <div className="mt-4 font-display text-4xl font-black">{c.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.label}</div>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Link to="/complaints" className="rounded-3xl bg-gradient-card p-8 shadow-soft hover:shadow-playful">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-2xl font-bold">Raise an issue</h3>
            <p className="mt-1 text-sm text-muted-foreground">Lift, water, parking — let your society know.</p>
          </Link>
          <Link to="/announcements" className="rounded-3xl bg-gradient-card p-8 shadow-soft hover:shadow-playful">
            <Megaphone className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-2xl font-bold">Latest notices</h3>
            <p className="mt-1 text-sm text-muted-foreground">Stay on top of what's happening.</p>
          </Link>
          <Link to="/events" className="rounded-3xl bg-gradient-card p-8 shadow-soft hover:shadow-playful">
            <CalendarHeart className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-display text-2xl font-bold">Events & polls</h3>
            <p className="mt-1 text-sm text-muted-foreground">Join in. Vote. Decide together.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
