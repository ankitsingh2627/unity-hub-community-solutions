import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, MapPin, CalendarHeart, Vote, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/events")({
  component: () => <RequireAuth><EventsPage /></RequireAuth>,
  head: () => ({ meta: [{ title: "Events & Polls — UnityHub" }] }),
});

type Ev = { id: string; title: string; description: string | null; location: string | null; event_date: string };
type Poll = { id: string; question: string; options: string[]; end_date: string | null; created_at: string };

function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container mx-auto px-6 py-12 md:py-16">
        <header className="mb-10 border-b border-border pb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Sections · 03 — 04</span>
          <h1 className="mt-3 font-display text-6xl leading-[0.95] md:text-8xl">Events &<br /><em className="italic text-primary">polls.</em></h1>
          <p className="mt-3 max-w-xl text-foreground/75">Plan together. Decide together. Quietly.</p>
        </header>
        <Tabs defaultValue="events">
          <TabsList className="rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger value="events" className="rounded-none border-b-2 border-transparent bg-transparent px-6 pb-3 font-mono text-xs uppercase tracking-[0.2em] data-[state=active]:border-foreground data-[state=active]:shadow-none">Events</TabsTrigger>
            <TabsTrigger value="polls" className="rounded-none border-b-2 border-transparent bg-transparent px-6 pb-3 font-mono text-xs uppercase tracking-[0.2em] data-[state=active]:border-foreground data-[state=active]:shadow-none">Polls</TabsTrigger>
          </TabsList>
          <TabsContent value="events" className="mt-6"><EventsList /></TabsContent>
          <TabsContent value="polls" className="mt-6"><PollsList /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EventsList() {
  const { user, role } = useAuth();
  const [items, setItems] = useState<Ev[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, { count: number; mine: boolean }>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", event_date: "" });

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setItems((data ?? []) as Ev[]);
    const { data: r } = await supabase.from("event_rsvps").select("event_id, user_id");
    const map: Record<string, { count: number; mine: boolean }> = {};
    (r ?? []).forEach((row: { event_id: string; user_id: string }) => {
      const m = map[row.event_id] ?? { count: 0, mine: false };
      m.count++; if (row.user_id === user?.id) m.mine = true;
      map[row.event_id] = m;
    });
    setRsvps(map);
  };
  useEffect(() => { load(); }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("events").insert({ ...form, organizer_id: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Event created!"); setOpen(false);
    setForm({ title: "", description: "", location: "", event_date: "" }); load();
  };

  const toggleRsvp = async (e: Ev) => {
    const mine = rsvps[e.id]?.mine;
    if (mine) await supabase.from("event_rsvps").delete().eq("event_id", e.id).eq("user_id", user!.id);
    else await supabase.from("event_rsvps").insert({ event_id: e.id, user_id: user!.id });
    load();
  };

  return (
    <>
      {role === "admin" && (
        <div className="mb-4 flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-full bg-foreground font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary"><Plus className="mr-1 h-3.5 w-3.5" /> New event</Button></DialogTrigger>
            <DialogContent className="rounded-md">
              <DialogHeader><DialogTitle className="font-display text-3xl">Create event</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Date & time</Label><Input type="datetime-local" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
                <Button type="submit" className="w-full rounded-full bg-foreground py-5 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {items.length === 0 && <div className="md:col-span-2 border-y border-border py-20 text-center text-muted-foreground"><CalendarHeart className="mx-auto mb-2 h-6 w-6" /><span className="font-mono text-[10px] uppercase tracking-[0.25em]">No upcoming events</span></div>}
        {items.map((e) => {
          const date = new Date(e.event_date);
          const mine = rsvps[e.id]?.mine;
          return (
            <article key={e.id} className="overflow-hidden rounded-md bg-card shadow-paper transition hover:shadow-lift">
              <div className="flex items-end justify-between bg-foreground p-5 text-background">
                <div className="font-display text-6xl leading-none">{format(date, "dd")}</div>
                <div className="text-right font-mono text-[10px] uppercase tracking-[0.25em]">
                  <div>{format(date, "MMM yyyy")}</div>
                  <div className="text-background/70">{format(date, "HH:mm")} · {format(date, "EEEE")}</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl leading-tight">{e.title}</h3>
                {e.description && <p className="mt-2 text-sm leading-relaxed text-foreground/75">{e.description}</p>}
                {e.location && <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><MapPin className="h-3 w-3" />{e.location}</div>}
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{rsvps[e.id]?.count ?? 0} attending</span>
                  <Button onClick={() => toggleRsvp(e)} size="sm" className={`rounded-full font-mono text-[10px] uppercase tracking-[0.2em] ${mine ? "bg-success text-background" : "bg-foreground text-background"}`}>
                    {mine ? <><Check className="mr-1 h-3 w-3" /> Going</> : "RSVP"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function PollsList() {
  const { user, role } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Record<string, { counts: number[]; mine: number | null }>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ question: "", options: ["", ""] });

  const load = async () => {
    const { data } = await supabase.from("polls").select("*").order("created_at", { ascending: false });
    const list = (data ?? []).map((p) => ({ ...p, options: Array.isArray(p.options) ? (p.options as string[]) : [] })) as Poll[];
    setPolls(list);
    const { data: v } = await supabase.from("poll_votes").select("poll_id, user_id, option_index");
    const map: Record<string, { counts: number[]; mine: number | null }> = {};
    list.forEach((p) => { map[p.id] = { counts: p.options.map(() => 0), mine: null }; });
    (v ?? []).forEach((row: { poll_id: string; user_id: string; option_index: number }) => {
      const m = map[row.poll_id]; if (!m) return;
      m.counts[row.option_index] = (m.counts[row.option_index] ?? 0) + 1;
      if (row.user_id === user?.id) m.mine = row.option_index;
    });
    setVotes(map);
  };
  useEffect(() => { load(); }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const opts = form.options.map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) return toast.error("At least 2 options required");
    const { error } = await supabase.from("polls").insert({ question: form.question, options: opts, author_id: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Poll created!"); setOpen(false);
    setForm({ question: "", options: ["", ""] }); load();
  };

  const vote = async (pollId: string, idx: number) => {
    if (votes[pollId]?.mine !== null && votes[pollId]?.mine !== undefined) return toast.info("You've already voted");
    const { error } = await supabase.from("poll_votes").insert({ poll_id: pollId, user_id: user!.id, option_index: idx });
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <>
      {role === "admin" && (
        <div className="mb-4 flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-full bg-foreground font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary"><Plus className="mr-1 h-3.5 w-3.5" /> New poll</Button></DialogTrigger>
            <DialogContent className="rounded-md">
              <DialogHeader><DialogTitle className="font-display text-3xl">Create poll</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Question</Label><Input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Options</Label>
                  {form.options.map((o, i) => (
                    <Input key={i} placeholder={`Option ${i + 1}`} value={o} onChange={(e) => { const n = [...form.options]; n[i] = e.target.value; setForm({ ...form, options: n }); }} />
                  ))}
                  <Button type="button" variant="outline" size="sm" className="rounded-full font-mono text-[10px] uppercase tracking-[0.2em]" onClick={() => setForm({ ...form, options: [...form.options, ""] })}>+ Add option</Button>
                </div>
                <Button type="submit" className="w-full rounded-full bg-foreground py-5 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary">Create poll</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <div className="divide-y divide-border border-y border-border">
        {polls.length === 0 && <div className="py-20 text-center text-muted-foreground"><Vote className="mx-auto mb-2 h-6 w-6" /><span className="font-mono text-[10px] uppercase tracking-[0.25em]">No active polls</span></div>}
        {polls.map((p) => {
          const data = votes[p.id] ?? { counts: p.options.map(() => 0), mine: null };
          const total = data.counts.reduce((a, b) => a + b, 0);
          const voted = data.mine !== null;
          return (
            <article key={p.id} className="py-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Poll</span>
              <h3 className="mt-1 font-display text-3xl leading-tight">{p.question}</h3>
              <div className="mt-5 space-y-2">
                {p.options.map((opt, i) => {
                  const c = data.counts[i] ?? 0;
                  const pct = total ? Math.round((c / total) * 100) : 0;
                  const isMine = data.mine === i;
                  return (
                    <button key={i} onClick={() => vote(p.id, i)} disabled={voted} className={`group relative w-full overflow-hidden rounded-md border p-4 text-left transition ${isMine ? "border-foreground bg-muted" : "border-border hover:border-foreground"}`}>
                      {voted && <div className="absolute inset-y-0 left-0 bg-foreground/10" style={{ width: `${pct}%` }} />}
                      <div className="relative flex items-center justify-between">
                        <span className="font-display text-lg">{opt} {isMine && <Check className="inline h-4 w-4 text-primary" />}</span>
                        {voted && <span className="font-mono text-xs text-muted-foreground">{pct}% · {c}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{total} vote{total !== 1 ? "s" : ""}</div>
            </article>
          );
        })}
      </div>
    </>
  );
}
