import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FileText,
  Route,
  BarChart3,
  MessageSquare,
  Heart,
  Settings,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Resume & Analysis", icon: FileText, path: "/dashboard/resume" },
  { label: "Skill Roadmap", icon: Route, path: "/dashboard/roadmap" },
  { label: "Progress", icon: BarChart3, path: "/dashboard/progress" },
  { label: "Mock Interview", icon: MessageSquare, path: "/dashboard/interview" },
  { label: "Mental Health", icon: Heart, path: "/dashboard/support" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const planBadgeStyles: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-pro/20 text-pro",
  elite: "bg-elite/20 text-elite",
};

const SidebarContent = ({
  location,
  plan,
  profile,
  handleSignOut,
  onNavClick,
}: {
  location: ReturnType<typeof useLocation>;
  plan: string;
  profile: any;
  handleSignOut: () => void;
  onNavClick?: () => void;
}) => (
  <>
    <div className="p-5 border-b border-border/50 flex items-center gap-2">
      <Link to="/" className="font-display font-bold text-lg">
        <span className="text-primary">Skill</span>ect AI
      </Link>
      <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold", planBadgeStyles[plan])}>
        {plan}
      </span>
    </div>

    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onNavClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300",
            location.pathname === item.path
              ? "bg-primary/10 text-primary font-medium shadow-[0_0_15px_hsl(38_92%_50%_/_0.08)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </Link>
      ))}
    </nav>

    <div className="p-4 border-t border-border/50 space-y-3">
      {plan === "free" && (
        <Link
          to="/pricing"
          onClick={onNavClick}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowUpRight className="w-4 h-4" />
          Upgrade Plan
        </Link>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground truncate">
          {profile?.display_name || "User"}
        </span>
        <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground transition-colors duration-300" title="Sign out">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  </>
);

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, subscription, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const plan = subscription?.plan || "free";

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 glass-strong flex-col fixed inset-y-0 left-0 z-40">
        <SidebarContent
          location={location}
          plan={plan}
          profile={profile}
          handleSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-strong h-14 flex items-center justify-between px-4">
        <Link to="/" className="font-display font-bold text-lg">
          <span className="text-primary">Skill</span>ect AI
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed inset-y-0 left-0 w-72 glass-strong flex flex-col z-50 pt-14"
            >
              <SidebarContent
                location={location}
                plan={plan}
                profile={profile}
                handleSignOut={handleSignOut}
                onNavClick={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 md:ml-64 overflow-auto pt-14 md:pt-0">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardLayout;
