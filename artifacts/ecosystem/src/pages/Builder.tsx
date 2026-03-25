import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateEcosystem, getListEcosystemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Droplet, Wind, Settings, Cpu, ChevronRight, Check } from "lucide-react";

type SpeciesType = "plant" | "herbivore" | "predator";
type EcoType = "forest" | "river" | "grassland";

interface SpeciesOption {
  id: string;
  name: string;
  type: SpeciesType;
  defaultPop: number;
  min: number;
  max: number;
  emoji: string;
}

const SPECIES_BY_TYPE: Record<EcoType, SpeciesOption[]> = {
  forest: [
    { id: "oak", name: "Oak Tree", type: "plant", defaultPop: 70, min: 10, max: 100, emoji: "🌳" },
    { id: "grass", name: "Wild Grass", type: "plant", defaultPop: 80, min: 10, max: 100, emoji: "🌿" },
    { id: "fern", name: "Fern", type: "plant", defaultPop: 50, min: 10, max: 100, emoji: "🌱" },
    { id: "deer", name: "Deer", type: "herbivore", defaultPop: 40, min: 5, max: 100, emoji: "🦌" },
    { id: "rabbit", name: "Rabbit", type: "herbivore", defaultPop: 60, min: 5, max: 100, emoji: "🐇" },
    { id: "squirrel", name: "Squirrel", type: "herbivore", defaultPop: 50, min: 5, max: 100, emoji: "🐿️" },
    { id: "wolf", name: "Wolf", type: "predator", defaultPop: 15, min: 2, max: 50, emoji: "🐺" },
    { id: "bear", name: "Bear", type: "predator", defaultPop: 10, min: 2, max: 50, emoji: "🐻" },
    { id: "fox", name: "Fox", type: "predator", defaultPop: 20, min: 2, max: 50, emoji: "🦊" },
  ],
  river: [
    { id: "algae", name: "Algae", type: "plant", defaultPop: 90, min: 10, max: 100, emoji: "🌊" },
    { id: "lily", name: "Water Lily", type: "plant", defaultPop: 60, min: 10, max: 100, emoji: "🪷" },
    { id: "reed", name: "Reed", type: "plant", defaultPop: 55, min: 10, max: 100, emoji: "🌾" },
    { id: "fish", name: "Small Fish", type: "herbivore", defaultPop: 70, min: 5, max: 100, emoji: "🐟" },
    { id: "otter", name: "Otter", type: "herbivore", defaultPop: 30, min: 5, max: 100, emoji: "🦦" },
    { id: "duck", name: "Duck", type: "herbivore", defaultPop: 50, min: 5, max: 100, emoji: "🦆" },
    { id: "heron", name: "Heron", type: "predator", defaultPop: 12, min: 2, max: 50, emoji: "🦤" },
    { id: "pike", name: "Pike", type: "predator", defaultPop: 20, min: 2, max: 50, emoji: "🐡" },
    { id: "osprey", name: "Osprey", type: "predator", defaultPop: 8, min: 2, max: 50, emoji: "🦅" },
  ],
  grassland: [
    { id: "grass2", name: "Savanna Grass", type: "plant", defaultPop: 85, min: 10, max: 100, emoji: "🌾" },
    { id: "shrub", name: "Shrub", type: "plant", defaultPop: 55, min: 10, max: 100, emoji: "🌵" },
    { id: "wildflower", name: "Wildflower", type: "plant", defaultPop: 65, min: 10, max: 100, emoji: "🌼" },
    { id: "bison", name: "Bison", type: "herbivore", defaultPop: 45, min: 5, max: 100, emoji: "🦬" },
    { id: "prairie_dog", name: "Prairie Dog", type: "herbivore", defaultPop: 75, min: 5, max: 100, emoji: "🐾" },
    { id: "gazelle", name: "Gazelle", type: "herbivore", defaultPop: 55, min: 5, max: 100, emoji: "🦌" },
    { id: "hawk", name: "Hawk", type: "predator", defaultPop: 18, min: 2, max: 50, emoji: "🦅" },
    { id: "coyote", name: "Coyote", type: "predator", defaultPop: 22, min: 2, max: 50, emoji: "🐺" },
    { id: "snake", name: "Rattlesnake", type: "predator", defaultPop: 30, min: 2, max: 50, emoji: "🐍" },
  ],
};

const DEFAULT_SELECTED: Record<EcoType, string[]> = {
  forest: ["oak", "deer", "wolf"],
  river: ["algae", "fish", "heron"],
  grassland: ["grass2", "bison", "hawk"],
};

export default function Builder() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createMutation = useCreateEcosystem();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [type, setType] = useState<EcoType>("forest");
  const [temperature, setTemperature] = useState(22);
  const [rainfall, setRainfall] = useState(1200);
  const [pollution, setPollution] = useState(0.15);
  const [deforestationRate, setDeforestationRate] = useState(0.2);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(DEFAULT_SELECTED.forest);
  const [populations, setPopulations] = useState<Record<string, number>>({});

  const handleTypeChange = (newType: EcoType) => {
    setType(newType);
    setSelectedSpecies(DEFAULT_SELECTED[newType]);
    setPopulations({});
  };

  const toggleSpecies = (id: string) => {
    setSelectedSpecies(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getPopulation = (sp: SpeciesOption): number => {
    return populations[sp.id] ?? sp.defaultPop;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Ecosystem needs a designation.");

    const allSpecies = SPECIES_BY_TYPE[type];
    const chosenSpecies = allSpecies
      .filter(s => selectedSpecies.includes(s.id))
      .map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        initialPopulation: getPopulation(s),
      }));

    if (chosenSpecies.length === 0) return alert("Select at least one species.");

    try {
      const result = await createMutation.mutateAsync({
        data: {
          name: name.trim(),
          type,
          temperature,
          rainfall,
          pollution,
          deforestationRate,
          species: chosenSpecies,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListEcosystemsQueryKey() });
      setLocation(`/dashboard/${result.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to initialize ecosystem.");
    }
  };

  const availableSpecies = SPECIES_BY_TYPE[type];
  const plantOptions = availableSpecies.filter(s => s.type === "plant");
  const herbivoreOptions = availableSpecies.filter(s => s.type === "herbivore");
  const predatorOptions = availableSpecies.filter(s => s.type === "predator");

  const selectedCount = selectedSpecies.length;
  const hasPlant = availableSpecies.some(s => s.type === "plant" && selectedSpecies.includes(s.id));
  const hasHerbivore = availableSpecies.some(s => s.type === "herbivore" && selectedSpecies.includes(s.id));
  const hasPredator = availableSpecies.some(s => s.type === "predator" && selectedSpecies.includes(s.id));

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Cpu className="w-8 h-8 text-primary" /> MODEL BUILDER
          </h1>
          <p className="text-muted-foreground mt-2">Configure environmental parameters and initial species vectors.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                type="button"
                onClick={() => s < step || name ? setStep(s) : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step === s ? 'bg-primary text-black' : step > s ? 'bg-primary/30 text-primary' : 'bg-white/10 text-muted-foreground'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </button>
              {i < 2 && <div className={`h-0.5 w-16 ${step > s ? 'bg-primary/40' : 'bg-white/10'}`} />}
            </div>
          ))}
          <div className="ml-4 flex gap-4 text-xs text-muted-foreground">
            {["Designation", "Environment", "Species"].map((label, i) => (
              <span key={label} className={step === i + 1 ? "text-white font-semibold" : ""}>{label}</span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
                  <h2 className="text-xl font-display font-semibold text-white border-b border-white/10 pb-4">CORE DESIGNATION</h2>
                  <div>
                    <label className="block text-sm font-semibold tracking-wider text-muted-foreground mb-2">ECOSYSTEM NAME</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Amazon Rainforest Sector 7"
                      className="w-full bg-input/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold tracking-wider text-muted-foreground mb-4">BIOME TYPE</label>
                    <div className="grid grid-cols-3 gap-4">
                      {([
                        { id: "forest", icon: Leaf, label: "Forest", desc: "Dense tree canopy, high biodiversity", color: "text-primary", glow: "hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]" },
                        { id: "river", icon: Droplet, label: "River", desc: "Aquatic ecosystem, water-dependent species", color: "text-secondary", glow: "hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]" },
                        { id: "grassland", icon: Wind, label: "Grassland", desc: "Open plains, grazing species", color: "text-accent", glow: "hover:shadow-[0_0_20px_rgba(255,107,53,0.2)]" },
                      ] as const).map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTypeChange(t.id as EcoType)}
                          className={`flex flex-col items-center p-5 rounded-xl border transition-all duration-200 ${t.glow} ${
                            type === t.id
                              ? "bg-white/10 border-white/40 shadow-lg"
                              : "bg-black/30 border-white/5 hover:bg-white/5 text-muted-foreground"
                          }`}
                        >
                          <t.icon className={`w-8 h-8 mb-2 ${type === t.id ? t.color : ''}`} />
                          <span className="text-sm uppercase font-bold">{t.label}</span>
                          <span className="text-xs text-muted-foreground mt-1 text-center">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { if (!name.trim()) return alert("Enter an ecosystem name first."); setStep(2); }}
                  className="w-full mt-4 py-4 bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 font-display font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  NEXT: ENVIRONMENT <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                  <h2 className="text-xl font-display font-semibold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-secondary" /> ENVIRONMENTAL VECTORS
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { label: "Temperature (°C)", value: temperature, setValue: setTemperature, min: 15, max: 45, step: 1, unit: "°C", color: "secondary", note: "Optimal: 20–30°C", danger: temperature > 38 || temperature < 17 },
                      { label: "Rainfall (mm/yr)", value: rainfall, setValue: setRainfall, min: 200, max: 3000, step: 100, unit: "mm", color: "secondary", note: "Optimal: 500–1500mm", danger: rainfall < 300 || rainfall > 2500 },
                      { label: "Pollution Level (%)", value: pollution, setValue: setPollution, min: 0, max: 1, step: 0.01, unit: `${(pollution * 100).toFixed(0)}%`, color: "destructive", note: "Critical above 70%", danger: pollution > 0.7, format: (v: number) => `${(v * 100).toFixed(0)}%` },
                      { label: "Deforestation Rate (%/yr)", value: deforestationRate, setValue: setDeforestationRate, min: 0, max: 1, step: 0.01, unit: `${(deforestationRate * 10).toFixed(1)}%/yr`, color: "destructive", note: "Critical above 3%/yr", danger: deforestationRate > 0.3 },
                    ].map(({ label, value, setValue, min, max, step: s, unit, color, note, danger }) => (
                      <div key={label}>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-semibold text-muted-foreground">{label}</label>
                          <span className={`font-mono text-sm font-bold ${danger ? 'text-destructive' : `text-${color}`}`}>{unit}</span>
                        </div>
                        <input
                          type="range" min={min} max={max} step={s} value={value}
                          onChange={e => setValue(Number(e.target.value))}
                          className={`w-full ${danger ? 'accent-destructive' : 'accent-secondary'}`}
                        />
                        <div className="text-xs text-muted-foreground mt-1">{note}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-4 bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 font-bold rounded-xl transition-all">BACK</button>
                  <button type="button" onClick={() => setStep(3)} className="flex-1 py-4 bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 font-display font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    NEXT: SPECIES MATRIX <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                  <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-display font-semibold text-white">SPECIES MATRIX</h2>
                    <div className="flex gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${hasPlant ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'}`}>🌿 Plants</span>
                      <span className={`px-2 py-1 rounded-full ${hasHerbivore ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-muted-foreground'}`}>🦌 Herbivores</span>
                      <span className={`px-2 py-1 rounded-full ${hasPredator ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-muted-foreground'}`}>🐺 Predators</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">Select species and configure initial population indices (10–100 scale). Include at least one from each trophic level for a balanced ecosystem.</p>

                  {[
                    { label: "Primary Producers (Plants)", options: plantOptions, color: "primary", gradient: "from-primary/20" },
                    { label: "Herbivores (Secondary Consumers)", options: herbivoreOptions, color: "secondary", gradient: "from-secondary/20" },
                    { label: "Predators (Apex Consumers)", options: predatorOptions, color: "orange-400", gradient: "from-orange-500/20" },
                  ].map(({ label, options, color, gradient }) => (
                    <div key={label} className="mb-6">
                      <h3 className={`text-sm font-semibold text-${color} uppercase tracking-widest mb-3`}>{label}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {options.map(sp => {
                          const selected = selectedSpecies.includes(sp.id);
                          const pop = getPopulation(sp);
                          return (
                            <div
                              key={sp.id}
                              className={`relative rounded-xl border transition-all duration-200 ${
                                selected
                                  ? `bg-gradient-to-br ${gradient} to-transparent border-${color}/40`
                                  : "bg-black/30 border-white/5 opacity-60"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleSpecies(sp.id)}
                                className="w-full p-4 text-left"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-lg">{sp.emoji}</span>
                                  {selected && <Check className={`w-4 h-4 text-${color}`} />}
                                </div>
                                <div className="font-semibold text-white text-sm">{sp.name}</div>
                              </button>
                              {selected && (
                                <div className="px-4 pb-4">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Population Index</span>
                                    <span className={`font-mono text-${color} font-bold`}>{pop}</span>
                                  </div>
                                  <input
                                    type="range" min={sp.min} max={sp.max} step={1}
                                    value={pop}
                                    onChange={e => setPopulations(prev => ({ ...prev, [sp.id]: Number(e.target.value) }))}
                                    className={`w-full accent-${color === 'orange-400' ? 'orange' : color}`}
                                    onClick={e => e.stopPropagation()}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                                    <span>{sp.min}</span><span>{sp.max}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-muted-foreground">
                    {selectedCount} species selected
                    {!hasPlant && <span className="text-orange-400 ml-3">⚠ No plant species selected</span>}
                    {!hasHerbivore && <span className="text-orange-400 ml-3">⚠ No herbivores selected</span>}
                    {!hasPredator && <span className="text-secondary ml-3">ℹ No predators (optional)</span>}
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button type="button" onClick={() => setStep(2)} className="px-6 py-4 bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 font-bold rounded-xl transition-all">BACK</button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || selectedCount === 0}
                    className="flex-1 py-5 bg-gradient-to-r from-primary/80 to-primary text-primary-foreground font-display font-black text-lg rounded-xl hover:opacity-90 neon-glow transition-all uppercase tracking-widest disabled:opacity-50"
                  >
                    {createMutation.isPending ? "COMPUTING MODELS..." : "INITIALIZE SIMULATION"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </Layout>
  );
}
