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
  open: "bg-warning/20 text-foreground",
  in_progress: "bg-secondary/30 text-foreground",
  resolved: "bg-success/20 text-foreground",
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
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black">Society Issues</h1>
            <p className="mt-1 text-muted-foreground">Raise it. Upvote it. Track it till resolved.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-full bg-gradient-primary shadow-playful"><Plus className="mr-1 h-4 w-4" /> New issue</Button></DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle className="font-display text-2xl">Raise a new issue</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Maintenance","Plumbing","Electrical","Security","Cleanliness","Lift","Parking","Other"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as "low" | "medium" | "high" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["low","medium","high"].map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-full bg-gradient-primary shadow-playful">Submit issue</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6 flex gap-2">
          {["all","open","in_progress","resolved"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter===f?"bg-gradient-primary text-primary-foreground shadow-playful":"bg-muted hover:bg-muted/70"}`}>
              {f.replace("_"," ")}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filtered.length === 0 && <div className="rounded-3xl bg-muted/40 p-10 text-center text-muted-foreground"><AlertCircle className="mx-auto mb-2 h-8 w-8" />No issues yet. Be the first to raise one!</div>}
          {filtered.map((c) => (
            <article key={c.id} className="flex gap-4 rounded-3xl bg-card p-5 shadow-soft transition hover:shadow-playful">
              <button onClick={() => toggleUpvote(c)} className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl transition ${upvotes[c.id]?.mine ? "bg-gradient-primary text-primary-foreground shadow-playful" : "bg-muted hover:bg-primary/10"}`}>
                <ArrowBigUp className="h-5 w-5" />
                <span className="text-sm font-bold">{upvotes[c.id]?.count ?? 0}</span>
              </button>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold">{c.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[c.status]}`}>{c.status.replace("_"," ")}</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{c.category}</span>
                  {c.priority === "high" && <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">high priority</span>}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.description}</p>
                {role === "admin" && (
                  <div className="mt-3">
                    <Select value={c.status} onValueChange={(v) => updateStatus(c.id, v)}>
                      <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
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
