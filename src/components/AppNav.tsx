import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Home } from "lucide-react";

export function AppNav() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Home className="h-4 w-4" />
          </span>
          UnityHub
        </Link>
        {user ? (
          <nav className="flex items-center gap-1 sm:gap-2 text-sm">
            <NavLink to="/dashboard" label="Home" />
            <NavLink to="/complaints" label="Complaints" />
            <NavLink to="/announcements" label="Notices" />
            <NavLink to="/events" label="Events" />
            {role === "admin" && (
              <span className="hidden sm:inline rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">Admin</span>
            )}
            <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} aria-label="Sign out" className="ml-1 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition">
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        ) : (
          <Link to="/auth" className="text-sm font-medium text-primary hover:underline">Sign in</Link>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, label }: { to: "/dashboard" | "/complaints" | "/announcements" | "/events"; label: string }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-muted text-foreground" }}
      className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
    >
      {label}
    </Link>
  );
}
