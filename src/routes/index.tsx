import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/hooks/use-auth";
import hero from "@/assets/hero-community.jpg";
import { MessageSquare, Megaphone, CalendarHeart, Vote, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "UnityHub — Society life, made playful" },
      { name: "description", content: "A friendly app for residential societies to track complaints, share notices, plan events and run polls." },
    ],
  }),
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && user) navigate({ to: "/dashboard" }); }, [user, loading, navigate]);

  const features = [
    { icon: MessageSquare, title: "Issue Tracker", desc: "Raise complaints, upvote what matters, and watch them move from open to resolved.", color: "bg-primary/10 text-primary" },
    { icon: Megaphone, title: "Announcements", desc: "Never miss a notice — pinned, categorised, beautifully delivered.", color: "bg-secondary/20 text-secondary-foreground" },
    { icon: CalendarHeart, title: "Events & RSVPs", desc: "From Diwali parties to society meetings, plan and confirm in one tap.", color: "bg-accent/30 text-accent-foreground" },
    { icon: Vote, title: "Community Polls", desc: "Decide together — pool maintenance, festival themes, vendor choices.", color: "bg-success/15 text-success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-20" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />

        <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:py-24 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-semibold text-primary shadow-soft">
              <Sparkles className="h-3.5 w-3.5" /> Final Year Project · Smart Society
            </span>
            <h1 className="font-display text-5xl font-black leading-[1.05] sm:text-6xl md:text-7xl">
              Your society,<br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">united & happy.</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              UnityHub helps residents and admins solve everyday issues together — complaints, notices, events and votes, all in one playful place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth">
                <Button size="lg" className="rounded-full bg-gradient-primary px-8 text-base font-semibold shadow-playful hover:opacity-90">
                  Get started — it's free
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="rounded-full px-8 text-base">See features</Button>
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" /> Secure auth · Email & Google sign-in
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -rotate-3 rounded-3xl bg-gradient-primary opacity-30 blur-2xl" />
            <img src={hero} alt="Happy community of residents in a colorful apartment society" width={1536} height={1024} className="relative rounded-3xl shadow-playful" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold sm:text-5xl">Everything your society needs</h2>
          <p className="mt-3 text-muted-foreground">Designed for residents, loved by admins. Four delightful tools, one connected community.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-3xl bg-gradient-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-playful">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-hero p-10 text-center shadow-playful sm:p-16">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <h2 className="font-display text-4xl font-black text-white sm:text-5xl">Ready to bring your society together?</h2>
          <p className="mt-3 text-white/90">Join UnityHub today — the first signup becomes the admin.</p>
          <Link to="/auth"><Button size="lg" className="mt-6 rounded-full bg-white px-8 text-base font-semibold text-primary shadow-soft hover:bg-white/90">Create your account</Button></Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Made with ♥ — UnityHub © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
