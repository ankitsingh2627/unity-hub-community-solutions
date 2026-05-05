import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";

export function AppNav() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-playful">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">UnityHub</span>
        </Link>
        {user ? (
          <nav className="flex items-center gap-1 sm:gap-3 text-sm">
            <Link to="/dashboard" activeProps={{ className: "text-primary font-semibold" }} className="px-2 py-1 hover:text-primary">Home</Link>
            <Link to="/complaints" activeProps={{ className: "text-primary font-semibold" }} className="px-2 py-1 hover:text-primary">Issues</Link>
            <Link to="/announcements" activeProps={{ className: "text-primary font-semibold" }} className="px-2 py-1 hover:text-primary">Notices</Link>
            <Link to="/events" activeProps={{ className: "text-primary font-semibold" }} className="px-2 py-1 hover:text-primary">Events</Link>
            {role === "admin" && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-accent/40 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">Admin</span>
            )}
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate({ to: "/" }); }} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        ) : (
          <Link to="/auth"><Button className="rounded-full bg-gradient-primary shadow-playful hover:opacity-90">Sign in</Button></Link>
        )}
      </div>
    </header>
  );
}
