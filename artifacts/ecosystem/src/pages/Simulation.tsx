import { useState } from "react";
import { useRoute } from "wouter";
import { useGetEcosystem, useRunSimulation, useGetSimulationHistory, getGetSimulationHistoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Play, History, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

export default function Simulation() {
  const [, params] = useRoute("/simulation/:id");
  const id = params?.id || "";
  
  const { data: eco } = useGetEcosystem(id);
  const { data: history, isLoading: historyLoading } = useGetSimulationHistory(id);
  const runSimulation = useRunSimulation();
  const queryClient = useQueryClient();

  const [weeks, setWeeks] = useState(52);
  const [activeSimId, setActiveSimId] = useState<string | null>(null);

  const activeSimulation = history?.find(h => h.id === activeSimId) || history?.[0];

  const handleRun = async () => {
    try {
      const res = await runSimulation.mutateAsync({
        id,
        data: { weeks }
      });
      queryClient.invalidateQueries({ queryKey: getGetSimulationHistoryQueryKey(id) });
      setActiveSimId(res.id);
    } catch (e) {
      console.error(e);
      alert("Simulation sequence failed.");
    }
  };

  return (
    <Layout ecosystemId={id}>
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-primary/20">
          <div>
            <h1 className="text-2xl font-display font-black text-white uppercase flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" /> SIMULATION ENGINE
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Run Lotka-Volterra computations to predict future population dynamics.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto bg-black/40 p-2 rounded-xl border border-white/5">
            <div className="px-4">
              <label className="text-xs text-muted-foreground block mb-1">Time Horizon</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" min="10" max="520" step="10" 
                  value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}
                  className="w-32 accent-primary"
                />
                <span className="font-mono text-sm text-primary min-w-[60px]">{weeks} wks</span>
              </div>
            </div>
            <button 
              onClick={handleRun}
              disabled={runSimulation.isPending || !eco}
              className="px-6 py-3 bg-primary text-black font-display font-bold rounded-lg hover:bg-primary/90 neon-glow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> {runSimulation.isPending ? "RUNNING..." : "EXECUTE"}
            </button>
          </div>
        </div>

        {activeSimulation ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
              {/* Main Chart */}
              <div className="glass-panel p-6 rounded-2xl h-[500px]">
                <h3 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-6">Population Dynamics Matrix</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeSimulation.dataPoints} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(3,7,18,0.9)', borderColor: 'rgba(0,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="plants" name="Plants" stroke="#00ff88" strokeWidth={2} dot={false} style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.5))' }} />
                    <Line type="monotone" dataKey="herbivores" name="Herbivores" stroke="#00ffff" strokeWidth={2} dot={false} style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.5))' }} />
                    <Line type="monotone" dataKey="predators" name="Predators" stroke="#ff00aa" strokeWidth={2} dot={false} style={{ filter: 'drop-shadow(0 0 4px rgba(255,0,170,0.5))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Health Chart */}
              <div className="glass-panel p-6 rounded-2xl h-[300px]">
                <h3 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-6">System Health Trajectory</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeSimulation.dataPoints} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(3,7,18,0.9)', borderColor: 'rgba(0,255,255,0.2)', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="healthScore" name="Health Score" stroke="#ffffff" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sidebar Data */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border-secondary/20 bg-secondary/5">
                <h3 className="text-lg font-display font-semibold text-secondary mb-4">FINAL STATE</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <div className="font-mono text-xl text-white">{activeSimulation.weeks} Weeks</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">End Health Status</div>
                    <div className={`font-mono text-xl ${
                      activeSimulation.finalPredictions.healthScore > 70 ? 'text-primary' : 
                      activeSimulation.finalPredictions.healthScore > 40 ? 'text-secondary' : 'text-destructive'
                    }`}>
                      {activeSimulation.finalPredictions.healthScore.toFixed(1)}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Final Stability</div>
                    <div className="font-mono text-xl text-white">{(activeSimulation.finalPredictions.stabilityIndex * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col max-h-[460px]">
                <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" /> PREVIOUS RUNS
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {history?.map((run) => (
                    <button
                      key={run.id}
                      onClick={() => setActiveSimId(run.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        activeSimId === run.id 
                          ? "bg-white/10 border-white/30" 
                          : "bg-black/30 border-white/5 hover:bg-white/5"
                      }`}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {format(new Date(run.runAt), 'MMM dd, HH:mm')}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white">{run.weeks} wks</span>
                        <span className="font-mono text-secondary">{run.finalPredictions.healthScore.toFixed(0)} HP</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 glass-panel rounded-2xl flex flex-col items-center justify-center text-muted-foreground border-dashed border-white/20">
            <Activity className="w-12 h-12 mb-4 opacity-50" />
            <p>No simulation data found. Execute a sequence to generate metrics.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
