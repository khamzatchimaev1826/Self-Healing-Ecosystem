import { useListEcosystems, useDeleteEcosystem, getListEcosystemsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Leaf, Droplet, Wind, ArrowRight, Trash2, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Home() {
  const { data: ecosystems, isLoading } = useListEcosystems();
  const deleteMutation = useDeleteEcosystem();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to terminate this ecosystem simulation?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListEcosystemsQueryKey() });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'forest': return <Leaf className="w-6 h-6 text-primary" />;
      case 'river': return <Droplet className="w-6 h-6 text-secondary" />;
      case 'grassland': return <Wind className="w-6 h-6 text-accent" />;
      default: return <Activity className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0">
            {/* landing page hero scenic cyberpunk neon landscape */}
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
              alt="Cyberpunk Ecosystem" 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          </div>
          
          <div className="relative z-10 px-8 py-20 lg:py-28 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 leading-tight tracking-tight">
                COMPUTE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text-primary">FUTURE</span> OF NATURE
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl font-medium">
                Design intricate ecosystems, simulate population dynamics via Lotka-Volterra models, and apply machine learning to prevent ecological collapse.
              </p>
              
              <Link 
                href="/builder"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-bold text-lg rounded-xl hover:bg-primary/90 transition-all duration-300 neon-glow hover:-translate-y-1"
              >
                INITIALIZE MODEL <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Active Models Section */}
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-display font-bold text-white tracking-wider flex items-center gap-3">
              <Activity className="w-6 h-6 text-secondary" /> ACTIVE SIMULATIONS
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : ecosystems?.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-2xl">
              <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-display text-white mb-2">NO DATA FOUND</h3>
              <p className="text-muted-foreground">The grid is empty. Initialize a new ecosystem model to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecosystems?.map((eco, idx) => (
                <motion.div
                  key={eco.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={`/dashboard/${eco.id}`}
                    className="block h-full glass-panel rounded-2xl p-6 hover:border-secondary/50 transition-all duration-300 group hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-secondary/10 transition-colors">
                        {getIcon(eco.type)}
                      </div>
                      <button 
                        onClick={(e) => handleDelete(eco.id, e)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-secondary transition-colors">
                      {eco.name}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                      Type: {eco.type}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-muted-foreground mb-1">Health</div>
                        <div className={`font-bold font-display ${
                          eco.predictions.healthScore > 70 ? 'text-primary' : 
                          eco.predictions.healthScore > 40 ? 'text-secondary' : 'text-destructive'
                        }`}>
                          {eco.predictions.healthScore.toFixed(0)} / 100
                        </div>
                      </div>
                      <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                        <div className="text-xs text-muted-foreground mb-1">Species</div>
                        <div className="font-bold text-white">{eco.species.length} Active</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground flex justify-between items-center pt-4 border-t border-white/10">
                      <span>{format(new Date(eco.createdAt), 'MMM dd, yyyy')}</span>
                      <span className="flex items-center gap-1 group-hover:text-secondary transition-colors font-semibold">
                        ENTER NEXUS <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
