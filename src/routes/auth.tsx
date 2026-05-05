import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import hero from "@/assets/hero-courtyard.jpg";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Enter — UnityHub" }, { name: "description", content: "Sign in or create your UnityHub account." }] }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); const [flat, setFlat] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back."); navigate({ to: "/dashboard" }); }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: fullName, flat_number: flat } },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created. Check your email to confirm.");
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: artwork */}
        <aside className="relative hidden overflow-hidden border-r border-border lg:block">
          <img src={hero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
          <div className="absolute left-8 top-8 font-mono text-[10px] uppercase tracking-[0.25em] text-background/80">UnityHub · vol.I</div>
          <div className="absolute bottom-10 left-8 right-8 text-background">
            <p className="font-display text-4xl italic leading-tight">"The home is small, the community is the rest."</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-background/70">Editor's note</p>
          </div>
        </aside>

        {/* Right: form */}
        <main className="flex flex-col px-6 py-10 sm:px-12 lg:px-16">
          <Link to="/" className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition">← unityhub</Link>

          <div className="my-auto w-full max-w-md self-center py-12">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Membership</span>
            <h1 className="mt-2 font-display text-5xl leading-[0.95]">Enter the<br /><em className="italic text-primary">building.</em></h1>

            <div className="mt-10">
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border bg-transparent p-0">
                  <TabsTrigger value="signin" className="rounded-none border-b-2 border-transparent bg-transparent pb-3 font-mono text-xs uppercase tracking-[0.2em] data-[state=active]:border-foreground data-[state=active]:shadow-none">Sign in</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-none border-b-2 border-transparent bg-transparent pb-3 font-mono text-xs uppercase tracking-[0.2em] data-[state=active]:border-foreground data-[state=active]:shadow-none">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-8 space-y-5">
                  <form onSubmit={signIn} className="space-y-5">
                    <Field label="Email" type="email" value={email} onChange={setEmail} />
                    <Field label="Password" type="password" value={password} onChange={setPassword} />
                    <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground py-6 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary">{loading ? "..." : "Sign in →"}</Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-8 space-y-5">
                  <form onSubmit={signUp} className="space-y-5">
                    <Field label="Full name" value={fullName} onChange={setFullName} />
                    <Field label="Flat number" placeholder="A-204" value={flat} onChange={setFlat} />
                    <Field label="Email" type="email" value={email} onChange={setEmail} />
                    <Field label="Password" type="password" value={password} onChange={setPassword} minLength={6} />
                    <Button type="submit" disabled={loading} className="w-full rounded-full bg-foreground py-6 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-primary">{loading ? "..." : "Create account →"}</Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="my-7 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" onClick={google} className="w-full rounded-full border-foreground/20 py-6 font-mono text-xs uppercase tracking-[0.2em] hover:border-foreground">
                <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.5l3-3C17.2 1.7 14.8.8 12 .8 7.4.8 3.4 3.4 1.4 7.3l3.5 2.7C5.9 7 8.7 5 12 5z"/><path fill="#4285F4" d="M23.2 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.3c-.3 1.4-1.1 2.6-2.3 3.4l3.5 2.7c2.1-1.9 3.7-4.8 3.7-8.3z"/><path fill="#FBBC05" d="M4.9 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.4 7c-.7 1.5-1.2 3.2-1.2 5s.4 3.5 1.2 5l3.5-2.7z"/><path fill="#34A853" d="M12 23.2c3.2 0 5.9-1.1 7.9-2.9l-3.5-2.7c-1 .7-2.3 1.1-4.4 1.1-3.3 0-6.1-2-7.1-4.9L1.4 17c2 3.9 6 6.2 10.6 6.2z"/></svg>
                Continue with Google
              </Button>
            </div>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Secure · email & google · no spam</p>
        </main>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, minLength }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; minLength?: number }) {
  return (
    <div className="space-y-2">
      <Label className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</Label>
      <Input
        type={type}
        required
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-none border-0 border-b border-border bg-transparent px-0 text-base focus-visible:border-foreground focus-visible:ring-0 shadow-none"
      />
    </div>
  );
}
