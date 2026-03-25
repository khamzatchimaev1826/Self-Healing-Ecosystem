import { useRoute } from "wouter";
import { useGetEcosystem } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { AlertTriangle, ShieldCheck, ActivitySquare, BrainCircuit } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

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

  const radialData = [
    { name: "Risk", value: predictions.collapseRisk * 100, fill: isDanger ? "hsl(var(--destructive))" : "hsl(var(--secondary))" }
  ];

  return (
    <Layout ecosystemId={id}>
      <div className="space-y-6">
        <header className="border-b border-white/10 pb-6 mb-6">
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-wider flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-accent" /> DEEP ANALYSIS
          </h1>
          <p className="text-muted-foreground mt-2">Machine learning inferences based on current parameter vectors.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Gauge */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center border-accent/20 lg:col-span-1">
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
                <span className={`text-4xl font-display font-black ${isDanger ? 'text-destructive' : 'text-secondary'}`}>
                  {(predictions.collapseRisk * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className={`mt-4 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full ${isDanger ? 'bg-destructive/20 text-destructive border border-destructive/50' : 'bg-secondary/20 text-secondary border border-secondary/50'}`}>
              {isDanger ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              {isDanger ? 'CRITICAL RISK LEVEL' : 'RISK ACCEPTABLE'}
            </div>
          </div>

          {/* Core Metrics */}
          <div className="glass-panel p-8 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col justify-center">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <ActivitySquare className="w-4 h-4 text-primary" /> Est. Recovery Time
              </div>
              <div className="text-5xl font-display font-bold text-white">
                {predictions.recoveryTimeWeeks} <span className="text-2xl text-muted-foreground">WKS</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Calculated time for the ecosystem to return to a stable state post-intervention.</p>
            </div>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col justify-center">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Health Status
              </div>
              <div className={`text-4xl font-display font-bold ${
                  predictions.healthStatus === 'Healthy' ? 'text-primary' :
                  predictions.healthStatus === 'Stressed' ? 'text-secondary' : 'text-destructive'
                }`}>
                {predictions.healthStatus.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground mt-4">Current systemic evaluation based on population ratios and environmental stress.</p>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-panel p-8 rounded-2xl">
          <h3 className="text-xl font-display font-semibold text-accent mb-6 border-b border-white/10 pb-4">AI RECOMMENDATIONS</h3>
          {predictions.recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-4 items-start bg-black/40 p-5 rounded-xl border border-white/5 hover:border-accent/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold font-mono">
                    {i+1}
                  </div>
                  <p className="text-white text-sm leading-relaxed pt-1">{rec}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No specific recommendations at this time. System is stable.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
