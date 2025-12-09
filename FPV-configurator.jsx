import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Battery, Zap, Wind, Weight, RotateCw, BarChart3, Info, CheckCircle, AlertTriangle, Calculator } from 'lucide-react';

// --- CONSTANTS & REFERENCE DATA (From PDF Section 8) ---

const PRESETS = {
  "65mm Whoop (Racing)": {
    statorW: 7, statorH: 2, kv: 30000,
    propSize: 1.22, // 31mm
    propPitch: 1.0, blades: 2,
    voltage: 4.35, // 1S HV
    droneWeight: 18, battWeight: 8, // Total ~26g
    desc: "Indoor racing standard. Ultra-low inertia, high snap."
  },
  "75mm Whoop (Freestyle)": {
    statorW: 10, statorH: 2, kv: 22000,
    propSize: 1.6, // 40mm
    propPitch: 1.5, blades: 3,
    voltage: 4.35,
    droneWeight: 28, battWeight: 13, // Total ~41g
    desc: "Outdoor micro freestyle. More authority for wind."
  },
  "3-inch Toothpick (2S Ultralight)": {
    statorW: 12, statorH: 2.5, kv: 8000,
    propSize: 3.0,
    propPitch: 1.8, blades: 2,
    voltage: 7.4, // 2S
    droneWeight: 55, battWeight: 30, // Total ~85g
    desc: "Featherweight 2S. Extremely agile but struggles in wind."
  },
  "3-inch Toothpick (3S Power)": {
    statorW: 13, statorH: 3, kv: 5000,
    propSize: 3.0,
    propPitch: 2.5, blades: 2,
    voltage: 11.1, // 3S
    droneWeight: 70, battWeight: 45, // Total ~115g
    desc: "High power-to-weight micro. Bridges gap to 3.5-inch."
  },
  "3.5-inch Freestyle": {
    statorW: 18, statorH: 4, kv: 3500,
    propSize: 3.5,
    propPitch: 2.5, blades: 3,
    voltage: 14.8, // 4S
    droneWeight: 160, battWeight: 90, // Total ~250g
    desc: "Sub-250g performance. 5-inch feel in a small package."
  },
  "5-inch Freestyle (Juicy)": {
    statorW: 23, statorH: 6, kv: 1750,
    propSize: 5.1,
    propPitch: 4.3, blades: 3,
    voltage: 22.2, // 6S
    droneWeight: 420, battWeight: 220, // Total ~640g
    desc: "The 2025 Standard. Smooth, heavy, momentum-based."
  },
  "5-inch Racing (Pro)": {
    statorW: 22, statorH: 7, kv: 2050,
    propSize: 5.1,
    propPitch: 4.9, blades: 3,
    voltage: 22.2,
    droneWeight: 320, battWeight: 200, // Total ~520g
    desc: "Explosive top-end, high disk loading, locked-in."
  },
  "7-inch Long Range": {
    statorW: 28, statorH: 6.5, kv: 1300,
    propSize: 7.0,
    propPitch: 3.5, blades: 2,
    voltage: 22.2,
    droneWeight: 550, battWeight: 550, // Total ~1100g (Li-Ion)
    desc: "Efficiency focus. Low RPM cruising."
  },
  "Cinelifter (X8 Heavy)": {
    statorW: 28, statorH: 12, kv: 1050,
    propSize: 8.0,
    propPitch: 4.5, blades: 3,
    voltage: 29.6, // 8S
    droneWeight: 1500, battWeight: 1200, // Payload + Batt
    desc: "Industrial torque density. 8-motor configuration (Simulated as 4 heavy motors)."
  }
};

const STATOR_GUIDE = [
  { prop: 2, min: 250, sweet: 450, max: 600, label: "Micro/Whoop" },
  { prop: 3, min: 280, sweet: 400, max: 600, label: "Toothpick" },
  { prop: 3.5, min: 900, sweet: 1600, max: 2100, label: "Sub-250 Freestyle" },
  { prop: 5, min: 2000, sweet: 2600, max: 3500, label: "Standard 5-inch" },
  { prop: 7, min: 3000, sweet: 4500, max: 5500, label: "Macro/Long Range" },
  { prop: 8, min: 5000, sweet: 7000, max: 12000, label: "Heavy Lift/Cinelifter" }
];

// --- HELPER COMPONENTS ---

const Tooltip = ({ content, children }) => (
  <div className="group relative flex items-center justify-center">
    {children}
    <div className="pointer-events-none absolute bottom-full mb-2 hidden w-64 rounded bg-black p-3 text-xs text-white opacity-0 shadow-lg group-hover:block group-hover:opacity-100 z-50 border border-slate-700 font-mono">
      {content}
      <div className="absolute top-full left-1/2 -ml-1 h-2 w-2 -translate-y-1 rotate-45 bg-black border-r border-b border-slate-700"></div>
    </div>
  </div>
);

const Card = ({ children, title, className = "" }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-xl ${className}`}>
    {title && <h3 className="text-slate-200 font-bold text-lg mb-4 flex items-center gap-2">{title}</h3>}
    {children}
  </div>
);

const Slider = ({ label, value, onChange, min, max, step, unit }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm text-slate-400 mb-1">
      <span>{label}</span>
      <span className="text-cyan-400 font-mono">{value} {unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
    />
  </div>
);

// Dynamic ScoreBar with Tooltip support
const ScoreBar = ({ label, score, desc, mathReveal }) => {
  let colorClass = "bg-slate-500";
  let textClass = "text-slate-500";
  
  if (score < 4) {
    colorClass = "bg-rose-500";
    textClass = "text-rose-400";
  } else if (score >= 4 && score < 7) {
    colorClass = "bg-amber-500";
    textClass = "text-amber-400";
  } else if (score >= 7 && score < 8.5) {
    colorClass = "bg-emerald-500";
    textClass = "text-emerald-400";
  } else {
    colorClass = "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]";
    textClass = "text-cyan-400";
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-1">
        <Tooltip content={mathReveal}>
          <span className="text-slate-300 font-bold border-b border-dotted border-slate-600 cursor-help">{label}</span>
        </Tooltip>
        <span className={`text-2xl font-black ${textClass} transition-colors duration-300`}>
          {score.toFixed(1)}<span className="text-sm text-slate-500 font-normal">/10</span>
        </span>
      </div>
      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`} 
          style={{ width: `${Math.min(100, Math.max(0, score * 10))}%` }}
        />
      </div>
      <div className={`text-xs mt-1 italic text-right transition-colors duration-300 ${textClass.replace('text-','text-opacity-80 ')}`}>
        {desc}
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, unit, mathReveal }) => (
  <Tooltip content={mathReveal}>
    <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50 text-center hover:bg-slate-800 transition-colors cursor-help">
      <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
        {label} <Calculator size={10} className="opacity-50"/>
      </div>
      <div className="text-xl font-mono text-cyan-400 font-bold">
        {value} <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  </Tooltip>
);

// --- MAIN APPLICATION ---

export default function FPVAnalysisTool() {
  // --- STATE ---
  const [inputs, setInputs] = useState({
    statorW: 23,
    statorH: 6,
    kv: 1750,
    propSize: 5.1,
    propPitch: 4.3,
    blades: 3,
    voltage: 22.2,
    droneWeight: 420,
    battWeight: 220
  });

  // --- PHYSICS ENGINE (Section 7) ---
  
  const results = useMemo(() => {
    // 1. Basic Geometry
    const statorVol = Math.PI * Math.pow(inputs.statorW / 2, 2) * inputs.statorH; // mm^3
    const auw = inputs.droneWeight + inputs.battWeight; // g
    const auwKg = auw / 1000;

    // 2. Thrust Estimate
    const k_thrust = 0.042; 
    const thrustPerMotorG = (statorVol * k_thrust) * Math.pow(inputs.propSize / 5, 1.5) * ((inputs.kv * inputs.voltage) / 1000);
    const totalThrustG = thrustPerMotorG * 4;
    const twr = totalThrustG / auw;

    // 3. Authority Score
    const scoreAuthRaw = (twr - 2) * 0.85;
    const scoreAuth = Math.min(10, Math.max(0, scoreAuthRaw));

    // 4. Responsiveness (Torque vs Inertia)
    const inertiaProxy = auw * Math.pow(inputs.propSize, 2);
    const respIndex = (statorVol * 100) / inertiaProxy;
    const scoreRespRaw = Math.log10(respIndex) * 5.5;
    const scoreResp = Math.min(10, Math.max(0, scoreRespRaw));

    // 5. Stability (Disk Loading)
    const propRadiusCm = (inputs.propSize * 2.54) / 2;
    const diskAreaCm2 = 4 * Math.PI * Math.pow(propRadiusCm, 2);
    const diskLoading = auw / diskAreaCm2; // g/cm^2
    const idealDL = 0.65;
    const scoreStabRaw = 10 - (Math.abs(diskLoading - idealDL) * 20);
    const scoreStab = Math.min(10, Math.max(1, scoreStabRaw));

    return {
      statorVol,
      auw,
      twr,
      totalThrustG,
      diskLoading,
      scoreAuth,
      scoreResp,
      scoreStab,
      inertiaProxy,
      respIndex,
      scoreAuthRaw,
      scoreStabRaw
    };
  }, [inputs]);

  // --- ANALYSIS GENERATORS ---

  const getStatorAnalysis = () => {
    const vol = results.statorVol;
    const { propSize, droneWeight, battWeight, statorW, statorH, kv } = inputs;
    const auw = droneWeight + battWeight;
    
    // 1. Identify Guide Class
    const guide = STATOR_GUIDE.reduce((prev, curr) => 
      Math.abs(curr.prop - propSize) < Math.abs(prev.prop - propSize) ? curr : prev
    );

    // 2. Cinelifter / Heavy Lift Special Logic (Prop > 6 and High Weight)
    if (propSize >= 6 && auw > 1300) {
        if (vol < 5000) {
            return {
                text: "⚠️ Warning: Stator volume critically low for Heavy Lift payload. Motor saturation likely.",
                color: "text-rose-400"
            };
        }
        if (statorH < 9) {
            return {
                text: "⚠️ Caution: For heavy payloads, consider taller stators (e.g., 2810, 2812) to sustain torque under continuous load.",
                color: "text-amber-400"
            };
        }
        return {
            text: "✅ Industrial Grade Torque Density. Excellent for X8 or heavy payloads.",
            color: "text-cyan-400"
        };
    }

    // 3. KV Mismatch Logic (High Volume + High KV = Battery Killer)
    if (vol > guide.sweet + 500 && kv > 2000 && propSize > 4) {
        return {
            text: "⚠️ Amp Hog Warning: Large stator volume + High KV will drain packs instantly. Good for 1-lap qualifying, bad for freestyle.",
            color: "text-rose-400"
        };
    }

    // 4. Standard Volume Logic
    if (Math.abs(guide.prop - propSize) > 1.5) return { text: "Custom prop size detected. Standard heuristics may apply loosely.", color: "text-slate-400" };

    if (vol < guide.min) return { text: "⚠️ Under-motored. Likely to overheat or lack authority recovery.", color: "text-rose-400" };
    if (vol > guide.max) return { text: "⚠️ Over-motored. Excess bell weight is hurting your response score unnecessarily.", color: "text-amber-400" };
    if (vol >= guide.sweet - 300 && vol <= guide.sweet + 500) return { text: `✅ Perfect 'Sweet Spot' stator volume for ${guide.label}.`, color: "text-emerald-400" };
    
    return { text: "Acceptable stator sizing, but slight optimization possible.", color: "text-slate-300" };
  };

  const getStabilityDesc = () => {
     const dl = results.diskLoading;
     if (dl < 0.45) return "Very Floaty. Susceptible to wind gusts.";
     if (dl >= 0.45 && dl < 0.55) return "Floaty / Efficient. Good for cinematic lines.";
     if (dl >= 0.55 && dl <= 0.8) return "Locked-in. Ideal freestyle balance.";
     if (dl > 0.8 && dl <= 1.0) return "Heavy / Racing. High downwash stability.";
     return "Brick-like. Prone to prop-wash in descent.";
  };

  const getFlightFeel = () => {
    let feel = [];
    if (results.scoreAuth > 8) feel.push("Explosive Power");
    else if (results.scoreAuth < 4) feel.push("Underpowered");
    
    if (results.scoreResp > 8.5) feel.push("Twitchy/Razor Sharp");
    else if (results.scoreResp < 5) feel.push("Smooth/Cinematic");
    
    const dl = results.diskLoading;
    if (dl < 0.5) feel.push("Floaty");
    else if (dl > 0.8) feel.push("Heavy/Locked");
    else feel.push("Balanced Stability");
    
    return feel.join(" • ");
  };

  // --- HANDLERS ---
  
  const loadPreset = (key) => {
    const p = PRESETS[key];
    setInputs({
      statorW: p.statorW,
      statorH: p.statorH,
      kv: p.kv,
      propSize: p.propSize,
      propPitch: p.propPitch,
      blades: p.blades,
      voltage: p.voltage,
      droneWeight: p.droneWeight,
      battWeight: p.battWeight
    });
  };

  const update = (field, val) => setInputs(prev => ({ ...prev, [field]: val }));

  const statorAnalysis = getStatorAnalysis();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-10 border-b border-slate-800 pb-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
            FPV PROPULSION ARCHITECT <span className="text-sm font-mono text-slate-500 font-normal ml-2">v2025.3</span>
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Simulate flight characteristics before you build. Based on the 2025 Comprehensive Analysis physics model.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: CONTROLS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* PRESETS */}
            <Card title={<><Zap size={18} className="text-yellow-400"/> Quick Load Presets</>}>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(PRESETS).map(name => (
                  <button 
                    key={name}
                    onClick={() => loadPreset(name)}
                    className="text-xs bg-slate-700 hover:bg-cyan-900 hover:text-cyan-200 text-slate-300 py-2 px-3 rounded transition-colors text-left truncate"
                    title={PRESETS[name].desc}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </Card>

            {/* MOTOR SPECS */}
            <Card title={<><Settings size={18} className="text-cyan-400"/> Motor Configuration</>}>
              <Slider label="Stator Width" value={inputs.statorW} min={7} max={32} step={1} unit="mm" onChange={v => update('statorW', v)} />
              <Slider label="Stator Height" value={inputs.statorH} min={2} max={15} step={0.5} unit="mm" onChange={v => update('statorH', v)} />
              <Slider label="KV Rating" value={inputs.kv} min={800} max={35000} step={50} unit="KV" onChange={v => update('kv', v)} />
              <div className="mt-4 p-3 bg-slate-900 rounded text-xs text-slate-400 flex items-center gap-2">
                <Info size={14} />
                <Tooltip content={`Volume = π * (${inputs.statorW/2})² * ${inputs.statorH}`}>
                  <span className="cursor-help border-b border-dotted border-slate-600">Stator Volume:</span>
                </Tooltip>
                <span className="text-cyan-400 font-mono ml-auto">{results.statorVol.toFixed(0)} mm³</span>
              </div>
            </Card>

            {/* PROP & POWER */}
            <Card title={<><Wind size={18} className="text-cyan-400"/> Prop & Power</>}>
              <Slider label="Prop Diameter" value={inputs.propSize} min={1.2} max={10} step={0.1} unit="in" onChange={v => update('propSize', v)} />
              <Slider label="System Voltage" value={inputs.voltage} min={3.7} max={50} step={0.1} unit="V" onChange={v => update('voltage', v)} />
              <div className="flex gap-2 text-xs text-slate-500 mt-2 font-mono">
                 <span className="cursor-pointer hover:text-cyan-400" onClick={() => update('voltage', 4.35)}>[1S]</span>
                 <span className="cursor-pointer hover:text-cyan-400" onClick={() => update('voltage', 7.4)}>[2S]</span>
                 <span className="cursor-pointer hover:text-cyan-400" onClick={() => update('voltage', 11.1)}>[3S]</span>
                 <span className="cursor-pointer hover:text-cyan-400" onClick={() => update('voltage', 16.8)}>[4S]</span>
                 <span className="cursor-pointer hover:text-cyan-400" onClick={() => update('voltage', 22.2)}>[6S]</span>
              </div>
            </Card>

            {/* WEIGHT */}
            <Card title={<><Weight size={18} className="text-cyan-400"/> Mass Properties</>}>
              <Slider label="Dry Weight" value={inputs.droneWeight} min={10} max={2000} step={5} unit="g" onChange={v => update('droneWeight', v)} />
              <Slider label="Battery Weight" value={inputs.battWeight} min={5} max={1500} step={5} unit="g" onChange={v => update('battWeight', v)} />
              <div className="mt-2 text-right font-bold text-white">AUW: {results.auw} g</div>
            </Card>

          </div>

          {/* RIGHT COLUMN: ANALYSIS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* MAIN METRICS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox 
                label="Thrust:Weight" 
                value={results.twr.toFixed(1)} 
                unit=": 1" 
                mathReveal={`Thrust (${(results.totalThrustG/1000).toFixed(2)}kg) / AUW (${(results.auw/1000).toFixed(2)}kg)`}
              />
              <MetricBox 
                label="Disk Loading" 
                value={results.diskLoading.toFixed(2)} 
                unit="g/cm²" 
                mathReveal={`AUW (${results.auw}g) / DiskArea (4 * π * ${(inputs.propSize * 1.27).toFixed(1)}cm²)`}
              />
              <MetricBox 
                label="Stator Volume" 
                value={results.statorVol.toFixed(0)} 
                unit="mm³" 
                mathReveal={`π * r² * h = π * ${(inputs.statorW/2).toFixed(1)}² * ${inputs.statorH}`}
              />
              <MetricBox 
                label="Est. Thrust" 
                value={(results.totalThrustG / 1000).toFixed(1)} 
                unit="kg" 
                mathReveal={`(Vol * 0.042) * (Prop/5)^1.5 * (KV*V/1000) * 4 motors`}
              />
            </div>

            {/* FLIGHT CHARACTER CARD */}
            <Card title={<><BarChart3 size={18} className="text-cyan-400"/> Flight Character Analysis</>} className="bg-slate-800/80 backdrop-blur">
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* SCORES */}
                <div className="flex-1">
                  <ScoreBar 
                    label="Authority" 
                    score={results.scoreAuth} 
                    desc={results.scoreAuth > 7 ? "High ability to arrest momentum. Ideal for freestyle." : "Low authority. Careful with dives."}
                    mathReveal={`Score = min(10, (TWR ${results.twr.toFixed(1)} - 2) * 0.85)`}
                  />
                  <ScoreBar 
                    label="Responsiveness" 
                    score={results.scoreResp} 
                    desc={results.scoreResp > 8 ? "Extremely twitchy. High PID D-term required." : results.scoreResp < 4 ? "Slow spool up. Smooth & cinematic." : "Balanced control."}
                    mathReveal={`Index = (Vol*100) / (AUW * Prop²) = ${results.respIndex.toFixed(1)}. Score = log10(Index) * 5.5`}
                  />
                  <ScoreBar 
                    label="Stability (Wind/Propwash)" 
                    score={results.scoreStab} 
                    desc={getStabilityDesc()}
                    mathReveal={`Target DL: 0.65. Score = 10 - (|${results.diskLoading.toFixed(2)} - 0.65| * 20)`}
                  />
                </div>

                {/* VERDICT BOX */}
                <div className="md:w-64 flex flex-col justify-center bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-2">Predicted Feel</div>
                  <div className="text-xl font-bold text-white mb-4 leading-tight">
                    {getFlightFeel()}
                  </div>
                  
                  <div className="h-px bg-slate-800 my-2"></div>
                  
                  <div className="text-xs text-slate-500 uppercase font-bold mb-2">Engineering Check</div>
                  <div className={`text-sm mb-2 font-medium ${statorAnalysis.color}`}>
                    {statorAnalysis.text}
                  </div>
                </div>

              </div>
            </Card>

            {/* COMPONENT COMPATIBILITY CHECK */}
            <Card className="border-l-4 border-l-cyan-500">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <RotateCw size={16} className="text-cyan-400"/> Component Balance Check
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  {results.scoreResp > 9 && results.scoreAuth < 4 ? <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5"/> : <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5"/>}
                  <span>
                    {results.scoreResp > 9 && results.scoreAuth < 4 
                      ? "Warning: High Responsiveness but Low Authority. This is typical of ultralights but may struggle to recover from prop-wash." 
                      : "Responsiveness and Authority are well balanced."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  {results.twr > 15 ? <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5"/> : <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5"/>}
                  <span>
                    {results.twr > 15 
                      ? "Warning: Extreme Thrust-to-Weight (>15:1). Ensure battery C-rating is sufficient (>100C) to prevent immediate sag." 
                      : "Thrust-to-Weight is within manageable limits for standard batteries."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Info size={16} className="text-cyan-500 shrink-0 mt-0.5"/>
                  <span>
                    {inputs.propSize < 4 
                      ? "Micro Class Logic: Inertia reduction is prioritized over raw torque. Stator width matters less than bell mass." 
                      : "Macro Class Logic: Stator Volume is king. Ensure stator height is sufficient to maintain torque at high RPM."}
                  </span>
                </li>
              </ul>
            </Card>

            {/* FOOTER NOTES */}
            <div className="text-xs text-slate-600 mt-4 text-center">
              Based on the "2025 Comprehensive Analysis" physics model. 
              Assumes modern N52 magnets and standard airfoil geometry. 
              Values are theoretical estimates for component selection.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


