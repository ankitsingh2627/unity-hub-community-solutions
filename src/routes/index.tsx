import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/hooks/use-auth";
import hero from "@/assets/hero-courtyard.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "UnityHub — A quieter way to live together" },
      { name: "description", content: "An editorial, residents-first companion for societies. Issues, notices, events, and shared decisions." },
    ],
  }),
});

const features = [
  { no: "01", k: "Issues", t: "Raised, upvoted, resolved.", d: "Lift acting up. Water again. The kind of complaints that should never need to be repeated." },
  { no: "02", k: "Notices", t: "Read once. Pinned forever.", d: "Categorised announcements with a quiet hierarchy — urgent never shouts louder than it needs to." },
  { no: "03", k: "Events", t: "RSVP, casually.", d: "From Diwali evenings to AGMs. One tap to confirm, one place to remember." },
  { no: "04", k: "Polls", t: "Decide, together.", d: "Painters, vendors, festival themes — let the building speak before the WhatsApp wars begin." },
];

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && user) navigate({ to: "/dashboard" }); }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero — editorial split */}
      <section className="border-b border-border/60">
        <div className="container mx-auto grid gap-10 px-6 py-16 md:grid-cols-12 md:gap-12 md:py-24">
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <span className="h-px w-10 bg-foreground/40" />
              Vol. I · Issue 01 · A society journal
            </div>
            <h1 className="mt-10 font-display text-[14vw] leading-[0.92] tracking-[-0.04em] text-balance md:mt-0 md:text-[clamp(64px,8.5vw,148px)]">
              Living<br />together,<br /><em className="font-display italic text-primary">softly.</em>
            </h1>
            <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="max-w-md text-base leading-relaxed text-foreground/80">
                UnityHub is a quiet, considered place for residents and managers to raise the small things, share the important ones, and decide on what matters — without the group-chat chaos.
              </p>
              <Link to="/auth" className="inline-flex items-center gap-3 self-start rounded-full bg-foreground px-7 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-background transition hover:bg-primary">
                Begin →
              </Link>
            </div>
          </div>

          <figure className="md:col-span-5">
            <div className="relative">
              <img src={hero} alt="A sunlit residential courtyard with terracotta walls and potted plants" width={1080} height={1600} className="aspect-[3/4] w-full rounded-md object-cover shadow-paper" />
              <figcaption className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>Fig. 01</span>
                <span>Courtyard, late light</span>
              </figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-b border-border/60 bg-foreground py-4 text-background">
        <div className="flex animate-marquee whitespace-nowrap font-display text-3xl italic md:text-4xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-10 pr-10">
              <span>complaints, resolved</span><span className="text-accent">✦</span>
              <span>notices, never missed</span><span className="text-accent">✦</span>
              <span>events, attended</span><span className="text-accent">✦</span>
              <span>decisions, shared</span><span className="text-accent">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Index — magazine TOC */}
      <section className="container mx-auto px-6 py-20 md:py-28">
        <div className="mb-14 flex items-baseline justify-between gap-4 border-b border-border pb-4">
          <h2 className="font-display text-3xl md:text-5xl">Inside this issue</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Index</span>
        </div>
        <div className="divide-y divide-border">
          {features.map((f) => (
            <article key={f.no} className="group grid grid-cols-12 items-baseline gap-4 py-8 transition hover:bg-muted/40 md:gap-8 md:py-10">
              <span className="col-span-2 font-mono text-xs text-muted-foreground md:text-sm">{f.no}</span>
              <div className="col-span-10 md:col-span-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">{f.k}</span>
                <h3 className="mt-1 font-display text-2xl md:text-4xl">{f.t}</h3>
              </div>
              <p className="col-span-12 max-w-xl text-foreground/75 md:col-span-6 md:col-start-7">{f.d}</p>
              <div className="col-span-12 md:col-span-1 md:text-right">
                <span className="font-mono text-xl text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground inline-block">→</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quote block */}
      <section className="border-y border-border/60 bg-gradient-warm">
        <div className="container mx-auto px-6 py-20 text-center md:py-28">
          <p className="mx-auto max-w-3xl font-display text-3xl italic leading-tight text-balance md:text-5xl">
            “A society is not its walls; it is the small agreements made between the people inside them.”
          </p>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">— Editor's note</p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Subscribe</span>
            <h2 className="mt-3 font-display text-5xl leading-[0.95] md:text-7xl text-balance">
              Move your society<br /><em className="italic text-primary">into print.</em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-foreground/75">The first resident to sign up becomes the editor — administrator of the society. Everyone else joins as a member, free.</p>
            <Link to="/auth" className="mt-6 inline-flex items-center gap-3 rounded-full border border-foreground px-7 py-3.5 font-mono text-xs uppercase tracking-[0.2em] transition hover:bg-foreground hover:text-background">
              Create your account →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>© {new Date().getFullYear()} UnityHub</span>
          <span>Final year project · Smart society</span>
          <span>Set in Fraunces & Plus Jakarta</span>
        </div>
      </footer>
    </div>
  );
}
