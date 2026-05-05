import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { MessageSquareWarning, Megaphone, CalendarDays, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "UnityHub — Society management made simple" },
      { name: "description", content: "Raise complaints, read notices, attend events, and vote in polls — all in one simple app for your residential society." },
    ],
  }),
});

const features = [
  { icon: MessageSquareWarning, title: "Complaints", desc: "Raise issues, track status, upvote what matters." },
  { icon: Megaphone, title: "Notices", desc: "Stay updated with announcements from admin." },
  { icon: CalendarDays, title: "Events", desc: "RSVP to society events and gatherings." },
  { icon: BarChart3, title: "Polls", desc: "Vote on community decisions together." },
];

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && user) navigate({ to: "/dashboard" }); }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 md:py-32 text-center">
        <span className="inline-block rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
          For residential societies
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight text-balance">
          Your society,<br /><span className="text-primary">simplified.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-muted-foreground">
          UnityHub brings complaints, notices, events, and polls together in one calm, easy-to-use app.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/auth">Get started</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/auth">Sign in</Link></Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t border-border bg-muted/40">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold">Ready to bring your society together?</h2>
          <p className="mt-2 text-muted-foreground">First user becomes admin. Everyone else joins as member.</p>
          <Button asChild className="mt-6" size="lg"><Link to="/auth">Create account</Link></Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} UnityHub</span>
          <span>Final year project</span>
        </div>
      </footer>
    </div>
  );
}
