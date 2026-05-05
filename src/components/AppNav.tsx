import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

export function AppNav() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-medium tracking-tight">unityhub</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">est.2026</span>
        </Link>
        {user ? (
          <nav className="flex items-center gap-5 text-sm">
            <NavLink to="/dashboard" label="Home" />
            <NavLink to="/complaints" label="Issues" />
            <NavLink to="/announcements" label="Notices" />
            <NavLink to="/events" label="Events" />
            {role === "admin" && (
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-accent sm:inline">·admin</span>
            )}
            <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} aria-label="Sign out" className="text-muted-foreground hover:text-foreground transition">
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        ) : (
          <Link to="/auth" className="font-mono text-xs uppercase tracking-[0.2em] border-b border-foreground pb-0.5 hover:text-primary hover:border-primary transition">
            Enter →
          </Link>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, label }: { to: "/dashboard" | "/complaints" | "/announcements" | "/events"; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "text-foreground after:scale-x-100" }}
      className="relative font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-foreground after:transition-transform after:origin-left"
    >
      {label}
    </Link>
  );
}
