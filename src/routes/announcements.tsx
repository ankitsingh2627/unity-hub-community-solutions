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
import { Switch } from "@/components/ui/switch";
import { Plus, Pin, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/announcements")({
  component: () => <RequireAuth><Announcements /></RequireAuth>,
  head: () => ({ meta: [{ title: "Announcements — UnityHub" }] }),
});

type A = { id: string; title: string; content: string; category: string; pinned: boolean; created_at: string };

const catColor: Record<string, string> = {
  general: "bg-secondary/30",
  urgent: "bg-destructive/15 text-destructive",
  maintenance: "bg-warning/25",
  event: "bg-accent/30",
};

function Announcements() {
  const { role } = useAuth();
  const [items, setItems] = useState<A[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", pinned: false });

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false });
    setItems((data ?? []) as A[]);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("announcements").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Notice posted!"); setOpen(false);
    setForm({ title: "", content: "", category: "general", pinned: false });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    toast.success("Removed"); load();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black">Announcements</h1>
            <p className="mt-1 text-muted-foreground">All the latest from your society.</p>
          </div>
          {role === "admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="rounded-full bg-gradient-primary shadow-playful"><Plus className="mr-1 h-4 w-4" /> New notice</Button></DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader><DialogTitle className="font-display text-2xl">Post an announcement</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                  <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div><Label>Content</Label><Textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
                  <div><Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["general","urgent","maintenance","event"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                    <Label htmlFor="pin" className="cursor-pointer">Pin to top</Label>
                    <Switch id="pin" checked={form.pinned} onCheckedChange={(v) => setForm({ ...form, pinned: v })} />
                  </div>
                  <Button type="submit" className="w-full rounded-full bg-gradient-primary shadow-playful">Post</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-4">
          {items.length === 0 && <div className="rounded-3xl bg-muted/40 p-10 text-center text-muted-foreground"><Megaphone className="mx-auto mb-2 h-8 w-8" />No announcements yet.</div>}
          {items.map((a) => (
            <article key={a.id} className={`rounded-3xl bg-card p-6 shadow-soft transition hover:shadow-playful ${a.pinned ? "ring-2 ring-primary/40" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.pinned && <Pin className="h-4 w-4 text-primary" />}
                    <h3 className="font-display text-xl font-bold">{a.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${catColor[a.category] ?? "bg-muted"}`}>{a.category}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{a.content}</p>
                  <div className="mt-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</div>
                </div>
                {role === "admin" && <Button variant="ghost" size="sm" onClick={() => remove(a.id)} className="text-destructive">Delete</Button>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
