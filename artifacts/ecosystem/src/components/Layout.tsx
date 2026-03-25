import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Beaker, LayoutDashboard, PlusSquare, Network, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export function Layout({ children, ecosystemId }: { children: ReactNode; ecosystemId?: string }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Nexus", icon: Network },
    { href: "/builder", label: "Builder", icon: PlusSquare },
  ];

  const ecoNavItems = ecosystemId ? [
    { href: `/dashboard/${ecosystemId}`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/simulation/${ecosystemId}`, label: "Simulation", icon: Activity },
    { href: `/analysis/${ecosystemId}`, label: "Analysis", icon: BarChart3 },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Beaker className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
              <Link href="/" className="font-display font-bold text-xl tracking-widest text-white hover:text-primary transition-colors">
                ECO<span className="text-primary">SYS</span>
              </Link>
            </div>
            <nav className="flex space-x-1 sm:space-x-4">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? "text-primary bg-primary/10 border border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.15)]" 
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
              
              {ecosystemId && (
                <div className="h-6 w-px bg-white/10 mx-2 self-center"></div>
              )}

              {ecoNavItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? "text-secondary bg-secondary/10 border border-secondary/30 shadow-[0_0_15px_rgba(0,255,255,0.15)]" 
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background/50 py-6 text-center text-xs text-muted-foreground">
        <p className="font-display tracking-widest">SELF-HEALING ECOSYSTEM MODEL v1.0 // REPLIT AGENT</p>
      </footer>
    </div>
  );
}
