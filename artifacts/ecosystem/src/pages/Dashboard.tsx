import { useState } from "react";
import { useRoute } from "wouter";
import { useGetEcosystem, useApplyIntervention, getGetEcosystemQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ShieldAlert, Zap, Thermometer, Droplets, Wind, Axe, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [, params] = useRoute("/dashboard/:id");
  const id = params?.id || "";
  
  const { data: eco, isLoading } = useGetEcosystem(id);
  const applyIntervention = useApplyIntervention();
  const queryClient = useQueryClient();

  const [interventionType, setInterventionType] = useState<any>("reforestation");
  const [intensity, setIntensity] = useState(0.5);

  const handleIntervention = async () => {
    if (!eco) return;
    try {
      await applyIntervention.mutateAsync({
        id,
        data: { type: interventionType, intensity }
      });
      queryClient.invalidateQueries({ queryKey: getGetEcosystemQueryKey(id) });
    } catch (e) {
      console.error(e);
      alert("Intervention failed.");
    }
  };

  if (isLoading || !eco) {
    return (
      <Layout ecosystemId={id}>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const hpColor = eco.predictions.healthScore > 70 ? 'text-primary' : 
                  eco.predictions.healthScore > 40 ? 'text-secondary' : 'text-destructive';
  
  const hpShadow = eco.predictions.healthScore > 70 ? 'shadow-[0_0_30px_rgba(0,255,136,0.3)]' : 
                   eco.predictions.healthScore > 40 ? 'shadow-[0_0_30px_rgba(0,255,255,0.3)]' : 'shadow-[0_0_30px_rgba(255,0,85,0.3)]';

  return (
    <Layout ecosystemId={id}>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-display font-black text-white uppercase tracking-wider mb-2">
              {eco.name}
            </h1>
            <div className="flex gap-4 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              <span className="flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> ID: {eco.id.substring(0,8)}</span>
              <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> TYPE: {eco.type}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status</div>
            <div className={`text-xl font-display font-bold px-4 py-1 bg-white/5 border rounded-lg ${
              eco.predictions.healthStatus === 'Healthy' ? 'text-primary border-primary/30' :
              eco.predictions.healthStatus === 'Stressed' ? 'text-secondary border-secondary/30' : 'text-destructive border-destructive/30'
            }`}>
              {eco.predictions.healthStatus}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Health Gauge */}
          <div className={`glass-panel p-8 rounded-2xl flex flex-col items-center justify-center ${hpShadow} transition-all`}>
            <div className="relative w-48 h-48 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="currentColor" 
                  strokeWidth="8"
                  strokeDasharray={`${eco.predictions.healthScore * 2.827} 282.7`}
                  className={`${hpColor} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-display font-black ${hpColor}`}>
                  {eco.predictions.healthScore.toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">SYS_HEALTH</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full text-center mt-4 border-t border-white/10 pt-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">STABILITY IDX</div>
                <div className="text-xl font-mono text-white">{(eco.predictions.stabilityIndex * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">COLLAPSE RISK</div>
                <div className="text-xl font-mono text-destructive">{(eco.predictions.collapseRisk * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Environmental parameters */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <h3 className="text-lg font-display font-semibold text-white mb-4 border-b border-white/10 pb-2">ENVIRONMENT</h3>
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Thermometer className="w-5 h-5 text-secondary" /> Temperature
                </div>
                <div className="font-mono text-lg text-white">{eco.temperature}°C</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Droplets className="w-5 h-5 text-secondary" /> Rainfall
                </div>
                <div className="font-mono text-lg text-white">{eco.rainfall} mm</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-destructive/20">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Wind className="w-5 h-5 text-destructive" /> Pollution
                </div>
                <div className="font-mono text-lg text-white">{(eco.pollution * 100).toFixed(0)}%</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-destructive/20">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Axe className="w-5 h-5 text-destructive" /> Deforestation
                </div>
                <div className="font-mono text-lg text-white">{(eco.deforestationRate * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Interventions */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col border-secondary/30">
            <h3 className="text-lg font-display font-semibold text-secondary mb-4 border-b border-white/10 pb-2">APPLY INTERVENTION</h3>
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Protocol</label>
                <select 
                  value={interventionType} 
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-secondary"
                >
                  <option value="reforestation">Reforestation</option>
                  <option value="pollution_reduction">Pollution Reduction</option>
                  <option value="species_introduction">Species Introduction</option>
                  <option value="habitat_restoration">Habitat Restoration</option>
                  <option value="hunting_ban">Hunting Ban</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-muted-foreground">Intensity Level</label>
                  <span className="text-xs font-mono text-secondary">{(intensity * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={intensity} 
                  onChange={(e) => setIntensity(Number(e.target.value))} 
                  className="w-full accent-secondary"
                />
              </div>
              <button 
                onClick={handleIntervention}
                disabled={applyIntervention.isPending}
                className="w-full mt-auto py-3 bg-secondary/20 border border-secondary/50 text-secondary hover:bg-secondary hover:text-black font-bold font-display tracking-widest rounded-lg transition-all duration-300 disabled:opacity-50 mt-4"
              >
                {applyIntervention.isPending ? "EXECUTING..." : "EXECUTE PROTOCOL"}
              </button>
            </div>
          </div>
        </div>

        {/* Applied Interventions Log */}
        {eco.interventions.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-display font-semibold text-white mb-4">INTERVENTION LOG</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground text-xs uppercase tracking-widest">
                    <th className="pb-3 px-4">Timestamp</th>
                    <th className="pb-3 px-4">Protocol</th>
                    <th className="pb-3 px-4">Intensity</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {eco.interventions.map((int, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{format(new Date(int.appliedAt), 'yyyy-MM-dd HH:mm:ss')}</td>
                      <td className="py-3 px-4 text-white uppercase">{int.type.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-white/10 rounded-full h-1.5 max-w-[100px]">
                          <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${int.intensity * 100}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
