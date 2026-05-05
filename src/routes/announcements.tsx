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
  general: "bg-muted text-foreground",
  urgent: "bg-destructive/15 text-destructive",
  maintenance: "bg-warning/30 text-foreground",
  event: "bg-accent/30 text-foreground",
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
      <div className="container mx-auto px-6 py-12 md:py-16">
        <header className="mb-10 border-b border-border pb-6">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Section · 02</span>
          {role === "admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="rounded-full bg-foreground font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary"><Plus className="mr-1 h-3.5 w-3.5" /> New</Button></DialogTrigger>
              <DialogContent className="rounded-md">
                <DialogHeader><DialogTitle className="font-display text-3xl">Post a notice</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                  <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Content</Label><Textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
                  <div><Label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["general","urgent","maintenance","event"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between border-t border-b border-border py-3">
                    <Label htmlFor="pin" className="cursor-pointer">Pin to top</Label>
                    <Switch id="pin" checked={form.pinned} onCheckedChange={(v) => setForm({ ...form, pinned: v })} />
                  </div>
                  <Button type="submit" className="w-full rounded-full bg-foreground py-5 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary">Post</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
          </div>
          <h1 className="mt-3 font-display text-6xl leading-[0.95] md:text-8xl">Notices<em className="italic text-primary">.</em></h1>
          <p className="mt-3 max-w-xl text-foreground/75">All the latest from your society — pinned, dated, never lost.</p>
        </header>

        <div className="divide-y divide-border border-y border-border">
          {items.length === 0 && <div className="py-20 text-center text-muted-foreground"><Megaphone className="mx-auto mb-2 h-6 w-6" /><span className="font-mono text-[10px] uppercase tracking-[0.25em]">No announcements yet</span></div>}
          {items.map((a) => (
            <article key={a.id} className={`py-8 transition hover:bg-muted/30 -mx-2 px-2 ${a.pinned ? "border-l-2 border-primary pl-6" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                    {a.pinned && <span className="flex items-center gap-1 text-primary"><Pin className="h-3 w-3" /> pinned</span>}
                    <span className={`rounded-full px-2.5 py-0.5 ${catColor[a.category] ?? "bg-muted"}`}>{a.category}</span>
                    <span className="text-muted-foreground">· {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                  </div>
                  <h3 className="mt-2 font-display text-3xl leading-tight">{a.title}</h3>
                  <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-foreground/85">{a.content}</p>
                </div>
                {role === "admin" && <button onClick={() => remove(a.id)} className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive">Delete</button>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
