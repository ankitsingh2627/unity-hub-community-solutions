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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowBigUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/complaints")({
  component: () => <RequireAuth><Complaints /></RequireAuth>,
  head: () => ({ meta: [{ title: "Issues — UnityHub" }] }),
});

type Complaint = {
  id: string; title: string; description: string; category: string;
  status: "open" | "in_progress" | "resolved"; priority: "low" | "medium" | "high";
  user_id: string; created_at: string;
};

const statusColor: Record<string, string> = {
  open: "bg-warning/30 text-foreground",
  in_progress: "bg-secondary/40 text-secondary-foreground",
  resolved: "bg-success/20 text-success",
};

function Complaints() {
  const { user, role } = useAuth();
  const [items, setItems] = useState<Complaint[]>([]);
  const [upvotes, setUpvotes] = useState<Record<string, { count: number; mine: boolean }>>({});
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState<{ title: string; description: string; category: string; priority: "low" | "medium" | "high" }>({ title: "", description: "", category: "Maintenance", priority: "medium" });

  const load = async () => {
    const { data } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Complaint[]);
    const { data: u } = await supabase.from("complaint_upvotes").select("complaint_id, user_id");
    const map: Record<string, { count: number; mine: boolean }> = {};
    (u ?? []).forEach((row: { complaint_id: string; user_id: string }) => {
      const m = map[row.complaint_id] ?? { count: 0, mine: false };
      m.count++; if (row.user_id === user?.id) m.mine = true;
      map[row.complaint_id] = m;
    });
    setUpvotes(map);
  };
  useEffect(() => { load(); }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("complaints").insert({ ...form, user_id: user!.id });
    if (error) return toast.error(error.message);
    toast.success("Issue raised!"); setOpen(false); setForm({ title: "", description: "", category: "Maintenance", priority: "medium" });
    load();
  };

  const toggleUpvote = async (c: Complaint) => {
    const mine = upvotes[c.id]?.mine;
    if (mine) await supabase.from("complaint_upvotes").delete().eq("complaint_id", c.id).eq("user_id", user!.id);
    else await supabase.from("complaint_upvotes").insert({ complaint_id: c.id, user_id: user!.id });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("complaints").update({ status: status as Complaint["status"] }).eq("id", id);
    toast.success("Status updated"); load();
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container mx-auto px-6 py-12 md:py-16">
        <header className="mb-10 border-b border-border pb-6">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Section · 01</span>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="rounded-full bg-foreground font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary"><Plus className="mr-1 h-3.5 w-3.5" /> New</Button></DialogTrigger>
              <DialogContent className="rounded-md">
                <DialogHeader><DialogTitle className="font-display text-3xl">Raise an issue</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                  <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Description</Label><Textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["Maintenance","Plumbing","Electrical","Security","Cleanliness","Lift","Parking","Other"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Priority</Label>
                      <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as "low" | "medium" | "high" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["low","medium","high"].map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-full bg-foreground py-5 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary">Submit</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <h1 className="mt-3 font-display text-6xl leading-[0.95] md:text-8xl">Issues<em className="italic text-primary">.</em></h1>
          <p className="mt-3 max-w-xl text-foreground/75">Raise it. Upvote it. Watch it move from open to resolved.</p>
        </header>

        <div className="hidden">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black">Society Issues</h1>
            <p className="mt-1 text-muted-foreground">Raise it. Upvote it. Track it till resolved.</p>
          </div>
          <span/>
        </div>
        </div>

        <div className="mb-8 flex gap-1 font-mono text-[10px] uppercase tracking-[0.2em]">
          {["all","open","in_progress","resolved"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 transition ${filter===f?"bg-foreground text-background":"text-muted-foreground hover:text-foreground"}`}>
              {f.replace("_"," ")}
            </button>
          ))}
        </div>

        <div className="divide-y divide-border border-y border-border">
          {filtered.length === 0 && <div className="py-20 text-center text-muted-foreground"><AlertCircle className="mx-auto mb-2 h-6 w-6" /><span className="font-mono text-[10px] uppercase tracking-[0.25em]">No issues yet</span></div>}
          {filtered.map((c) => (
            <article key={c.id} className="flex gap-6 py-7 transition hover:bg-muted/30 -mx-2 px-2">
              <button onClick={() => toggleUpvote(c)} className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-md border transition ${upvotes[c.id]?.mine ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>
                <ArrowBigUp className="h-4 w-4" />
                <span className="font-mono text-sm">{upvotes[c.id]?.count ?? 0}</span>
              </button>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                  <span className={`rounded-full px-2.5 py-0.5 ${statusColor[c.status]}`}>{c.status.replace("_"," ")}</span>
                  <span className="text-muted-foreground">· {c.category}</span>
                  {c.priority === "high" && <span className="text-destructive">· high priority</span>}
                </div>
                <h3 className="mt-2 font-display text-2xl leading-tight">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/75">{c.description}</p>
                {role === "admin" && (
                  <div className="mt-3">
                    <Select value={c.status} onValueChange={(v) => updateStatus(c.id, v)}>
                      <SelectTrigger className="h-8 w-48 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{["open","in_progress","resolved"].map(s=><SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
