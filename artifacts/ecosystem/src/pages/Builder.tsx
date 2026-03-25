import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateEcosystem, getListEcosystemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Leaf, Droplet, Wind, Plus, X, Settings, Cpu } from "lucide-react";

type SpeciesInput = { id: string; name: string; type: "plant" | "herbivore" | "predator"; initialPopulation: number };

const SPECIES_DB = [
  { name: "Oak Tree", type: "plant" },
  { name: "Wild Grass", type: "plant" },
  { name: "Algae", type: "plant" },
  { name: "Deer", type: "herbivore" },
  { name: "Rabbit", type: "herbivore" },
  { name: "Small Fish", type: "herbivore" },
  { name: "Wolf", type: "predator" },
  { name: "Fox", type: "predator" },
  { name: "Shark", type: "predator" },
] as const;

export default function Builder() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createMutation = useCreateEcosystem();

  const [name, setName] = useState("");
  const [type, setType] = useState<"forest" | "river" | "grassland">("forest");
  const [temperature, setTemperature] = useState(20);
  const [rainfall, setRainfall] = useState(1000);
  const [pollution, setPollution] = useState(0.1);
  const [deforestationRate, setDeforestationRate] = useState(0.05);
  
  const [species, setSpecies] = useState<SpeciesInput[]>([
    { id: "1", name: "Oak Tree", type: "plant", initialPopulation: 5000 },
    { id: "2", name: "Deer", type: "herbivore", initialPopulation: 200 },
    { id: "3", name: "Wolf", type: "predator", initialPopulation: 10 }
  ]);

  const addSpecies = () => {
    setSpecies([...species, { id: Math.random().toString(), name: SPECIES_DB[0].name, type: "plant", initialPopulation: 100 }]);
  };

  const removeSpecies = (id: string) => {
    setSpecies(species.filter(s => s.id !== id));
  };

  const updateSpecies = (id: string, field: keyof SpeciesInput, value: string | number) => {
    setSpecies(species.map(s => {
      if (s.id === id) {
        if (field === "name") {
          const matched = SPECIES_DB.find(db => db.name === value);
          return { ...s, name: value as string, type: matched?.type || s.type };
        }
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Ecosystem needs a designation.");

    try {
      const result = await createMutation.mutateAsync({
        data: {
          name,
          type,
          temperature,
          rainfall,
          pollution,
          deforestationRate,
          species: species.map(({ id, ...rest }) => ({ ...rest, id })) // re-map to satisfy API if needed, actually API expects id
        }
      });
      queryClient.invalidateQueries({ queryKey: getListEcosystemsQueryKey() });
      setLocation(`/dashboard/${result.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to initialize ecosystem.");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Cpu className="w-8 h-8 text-primary" />
            MODEL BUILDER
          </h1>
          <p className="text-muted-foreground mt-2">Configure environmental parameters and initial species vectors.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl">
            <h2 className="text-xl font-display font-semibold text-white mb-6 border-b border-white/10 pb-4">CORE DESIGNATION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold tracking-wider text-muted-foreground mb-2">ECOSYSTEM NAME</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sector 7 Forest"
                  className="w-full bg-input/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold tracking-wider text-muted-foreground mb-4">BIOME TYPE</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "forest", icon: Leaf, color: "text-primary" },
                    { id: "river", icon: Droplet, color: "text-secondary" },
                    { id: "grassland", icon: Wind, color: "text-accent" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                        type === t.id 
                          ? "bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                          : "bg-black/30 border-white/5 hover:bg-white/5 text-muted-foreground"
                      }`}
                    >
                      <t.icon className={`w-6 h-6 mb-2 ${type === t.id ? t.color : ''}`} />
                      <span className="text-xs uppercase font-bold">{t.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Parameters */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl">
            <h2 className="text-xl font-display font-semibold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-secondary" /> ENVIRONMENTAL VECTORS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-muted-foreground">Temperature (°C)</label>
                    <span className="text-secondary font-mono">{temperature}°</span>
                  </div>
                  <input type="range" min="-10" max="50" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full accent-secondary" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-muted-foreground">Rainfall (mm/yr)</label>
                    <span className="text-secondary font-mono">{rainfall}mm</span>
                  </div>
                  <input type="range" min="0" max="5000" step="100" value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))} className="w-full accent-secondary" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-muted-foreground">Pollution Level (0-1)</label>
                    <span className="text-destructive font-mono">{pollution.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={pollution} onChange={(e) => setPollution(Number(e.target.value))} className="w-full accent-destructive" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-muted-foreground">Deforestation Rate</label>
                    <span className="text-destructive font-mono">{deforestationRate.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={deforestationRate} onChange={(e) => setDeforestationRate(Number(e.target.value))} className="w-full accent-destructive" />
                </div>
              </div>
            </div>
          </div>

          {/* Species */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-display font-semibold text-white">SPECIES MATRIX</h2>
              <button 
                type="button" 
                onClick={addSpecies}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-colors text-sm font-bold"
              >
                <Plus className="w-4 h-4" /> ADD
              </button>
            </div>

            <div className="space-y-4">
              {species.map((s, idx) => (
                <motion.div 
                  key={s.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col sm:flex-row items-end sm:items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5"
                >
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-muted-foreground mb-1">Species Class</label>
                    <select 
                      value={s.name}
                      onChange={(e) => updateSpecies(s.id, "name", e.target.value)}
                      className="w-full bg-input/80 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary"
                    >
                      {SPECIES_DB.map(db => (
                        <option key={db.name} value={db.name}>{db.name} ({db.type})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-muted-foreground mb-1">Initial Population</label>
                    <input 
                      type="number" 
                      min="1"
                      value={s.initialPopulation}
                      onChange={(e) => updateSpecies(s.id, "initialPopulation", Number(e.target.value))}
                      className="w-full bg-input/80 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div className="w-full sm:w-auto flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => removeSpecies(s.id)}
                      className="p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive rounded-lg transition-colors"
                      disabled={species.length === 1}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-5 bg-gradient-to-r from-primary/80 to-primary text-primary-foreground font-display font-black text-xl rounded-xl hover:opacity-90 neon-glow transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {createMutation.isPending ? "COMPUTING..." : "INITIALIZE SIMULATION"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
