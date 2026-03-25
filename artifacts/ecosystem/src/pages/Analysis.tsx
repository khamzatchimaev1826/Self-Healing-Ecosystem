import { useRoute, Link } from "wouter";
import { useGetEcosystem } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { AlertTriangle, ShieldCheck, ActivitySquare, BrainCircuit, Clock, Zap, TreePine, Play } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { motion } from "framer-motion";

const PRIORITY_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  CRITICAL: { bg: "bg-red-950/50", border: "border-red-500/40", text: "text-red-400", badge: "bg-red-500/20 text-red-400 border border-red-500/50" },
  HIGH:     { bg: "bg-orange-950/30", border: "border-orange-500/30", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-400 border border-orange-500/50" },
  MEDIUM:   { bg: "bg-secondary/5", border: "border-secondary/20", text: "text-secondary", badge: "bg-secondary/20 text-secondary border border-secondary/50" },
  LOW:      { bg: "bg-primary/5", border: "border-primary/20", text: "text-primary", badge: "bg-primary/20 text-primary border border-primary/50" },
};

export default function Analysis() {
  const [, params] = useRoute("/analysis/:id");
  const id = params?.id || "";
  
  const { data: eco, isLoading } = useGetEcosystem(id);

  if (isLoading || !eco) {
    return (
      <Layout ecosystemId={id}>
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const { predictions } = eco;
  const isDanger = predictions.collapseRisk > 0.5;
  const isCritical = predictions.collapseRisk > 0.7;

  const radialData = [
    { name: "Risk", value: predictions.collapseRisk * 100, fill: isCritical ? "#ef4444" : isDanger ? "#f97316" : "hsl(var(--secondary))" }
  ];

  const riskFactors = [
    { label: "Pollution Pressure", value: predictions.collapseRisk > 0.3 && eco.pollution > 0.4, severity: eco.pollution > 0.7 ? "HIGH" : "MEDIUM" },
    { label: "Deforestation Rate", value: predictions.collapseRisk > 0.2 && eco.deforestationRate > 0.2, severity: eco.deforestationRate > 0.5 ? "HIGH" : "MEDIUM" },
    { label: "Low Biodiversity", value: predictions.biodiversityIndex < 0.5, severity: predictions.biodiversityIndex < 0.3 ? "HIGH" : "MEDIUM" },
    { label: "Population Instability", value: predictions.stabilityIndex < 0.5, severity: predictions.stabilityIndex < 0.3 ? "HIGH" : "MEDIUM" },
    { label: "System Health Decline", value: predictions.healthScore < 50, severity: predictions.healthScore < 40 ? "HIGH" : "MEDIUM" },
  ].filter(f => f.value);

  return (
    <Layout ecosystemId={id}>
      <div className="space-y-6">
        <header className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-white uppercase tracking-wider flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-accent" /> DEEP ANALYSIS
            </h1>
            <p className="text-muted-foreground mt-2">ML inferences — {eco.name} ({eco.type})</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/simulation/${eco.id}`} className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 rounded-lg text-sm font-bold transition-colors">
              <Play className="w-4 h-4" /> RUN SIMULATION
            </Link>
          </div>
        </header>

        {/* Top metrics row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collapse Risk Gauge */}
          <div className={`glass-panel p-8 rounded-2xl flex flex-col items-center justify-center ${isCritical ? 'border-red-500/30' : isDanger ? 'border-orange-500/30' : 'border-secondary/20'}`}>
            <h3 className="text-lg font-display font-semibold text-white mb-2 w-full text-center">COLLAPSE RISK</h3>
            <div className="w-full h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                  barSize={15} data={radialData} startAngle={180} endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                <span className={`text-4xl font-display font-black ${isCritical ? 'text-red-400' : isDanger ? 'text-orange-400' : 'text-secondary'}`}>
                  {(predictions.collapseRisk * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground uppercase mt-1">probability</span>
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full ${
              isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
              isDanger ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
              'bg-secondary/20 text-secondary border border-secondary/50'
            }`}>
              {isDanger ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              {isCritical ? 'COLLAPSE IMMINENT' : isDanger ? 'CRITICAL RISK' : 'RISK ACCEPTABLE'}
            </div>
          </div>

          {/* Core metrics */}
          <div className="glass-panel p-6 rounded-2xl grid grid-cols-2 gap-4 lg:col-span-2">
            {[
              { label: "Health Score", value: `${predictions.healthScore.toFixed(0)}/100`, color: predictions.healthScore > 70 ? 'text-primary' : predictions.healthScore > 40 ? 'text-secondary' : 'text-red-400', icon: ActivitySquare },
              { label: "Recovery Time", value: predictions.recoveryTimeWeeks === 0 ? "None needed" : `${predictions.recoveryTimeWeeks} weeks`, color: "text-white", icon: Clock },
              { label: "Biodiversity Index", value: `${(predictions.biodiversityIndex * 100).toFixed(0)}%`, color: predictions.biodiversityIndex > 0.6 ? 'text-primary' : predictions.biodiversityIndex > 0.4 ? 'text-secondary' : 'text-red-400', icon: TreePine },
              { label: "Stability Index", value: `${(predictions.stabilityIndex * 100).toFixed(0)}%`, color: predictions.stabilityIndex > 0.6 ? 'text-primary' : predictions.stabilityIndex > 0.4 ? 'text-secondary' : 'text-red-400', icon: Zap },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-white/5 p-5 rounded-xl border border-white/10 flex flex-col justify-between">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" /> {label}
                </div>
                <div className={`text-3xl font-display font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Health status banner */}
        <div className={`glass-panel p-4 rounded-xl flex items-center gap-4 ${
          predictions.healthStatus === 'Healthy' ? 'border-primary/30 bg-primary/5' :
          predictions.healthStatus === 'Stressed' ? 'border-secondary/30 bg-secondary/5' :
          'border-red-500/30 bg-red-500/5'
        }`}>
          <div className={`text-2xl font-display font-black ${
            predictions.healthStatus === 'Healthy' ? 'text-primary' :
            predictions.healthStatus === 'Stressed' ? 'text-secondary' : 'text-red-400'
          }`}>
            STATUS: {predictions.healthStatus.toUpperCase()}
          </div>
          {predictions.recoveryTimeWeeks > 0 && (
            <span className="text-muted-foreground text-sm">
              — Estimated {predictions.recoveryTimeWeeks} weeks to recovery with intervention
            </span>
          )}
        </div>

        {/* Risk Factors */}
        {riskFactors.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-display font-semibold text-white mb-4 border-b border-white/10 pb-3">RISK FACTORS</h3>
            <div className="flex flex-wrap gap-3">
              {riskFactors.map((f, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                  f.severity === 'HIGH' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5" /> {f.label}
                  <span className="text-xs opacity-70">[{f.severity}]</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="glass-panel p-8 rounded-2xl">
          <h3 className="text-xl font-display font-semibold text-accent mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5" /> AI RECOVERY RECOMMENDATIONS
          </h3>
          {predictions.recommendations.length > 0 ? (
            <div className="space-y-4">
              {predictions.recommendations.map((rec, i) => {
                const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.LOW;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex flex-col md:flex-row items-start gap-4 p-5 rounded-xl border transition-all ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold font-mono text-sm ${style.badge}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className={`font-display font-semibold ${style.text}`}>{rec.action}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${style.badge}`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.impact}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
                      <Clock className="w-3 h-3" /> {rec.timeline}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-primary opacity-60" />
              <p>No critical recommendations — system is stable.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
