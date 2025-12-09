# FPV Propulsion Architect

A physics-based motor selection and flight characteristic prediction tool for FPV drone builders. This interactive configurator helps you choose the right motor, prop, and battery combination before you build, saving time and money on component selection.

![Version](https://img.shields.io/badge/version-v2025.3-cyan)
![React](https://img.shields.io/badge/React-18.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 What This Tool Does

The FPV Propulsion Architect simulates flight characteristics based on motor specifications, prop size, battery voltage, and build weight. It provides:

- **Authority Score**: Ability to arrest momentum and recover from dives
- **Responsiveness Score**: How twitchy/smooth the quad feels
- **Stability Score**: Wind resistance and prop-wash handling (disk loading analysis)
- **Reliability Score**: Expected motor longevity based on thermal stress
- **Thrust-to-Weight Ratio**: Raw power metric
- **Disk Loading**: Weight per unit disk area (affects "feel")

### Key Features

✅ **Practical Tier System** - Budget, Intermediate, and Racing presets for each class
✅ **Video System Considerations** - Accounts for Analog vs. DJI O4 weight differences
✅ **Duct Efficiency Penalties** - 20% thrust penalty for prop-guarded whoops
✅ **Reliability Scoring** - Shows thermal stress and expected motor life
✅ **Real-World Validated** - Presets based on actual builder experience, not just theory
✅ **Accuracy Warnings** - Clear disclosure of model limitations

---

## 📋 Quick Start

### Running the Tool

1. **Clone this repository**
2. **Open `index.html` in your browser** - That's it! No installation needed.

### Using the Configurator

1. **Load a Preset** - Start with a preset that matches your target class (65mm whoop, 5-inch freestyle, etc.)
2. **Select Your Build Configuration**:
   - Toggle **Ducted/Prop Guards** if you're building a whoop
   - Choose **Video System** (Analog or DJI O4)
3. **Adjust Parameters** as needed:
   - Motor specs (stator width/height, KV rating)
   - Prop size
   - Battery voltage
   - Weights (dry frame weight, battery weight)
4. **Review Scores** - Check the four flight characteristic scores
5. **Read Warnings** - Pay attention to component compatibility checks

### Understanding the Scores

| Score Range | Interpretation |
|-------------|----------------|
| **8.5-10** | Excellent (cyan) - Optimal performance |
| **7-8.4** | Good (green) - Well-balanced |
| **4-6.9** | Acceptable (amber) - Workable but may have tradeoffs |
| **0-3.9** | Poor (red) - Problematic, redesign recommended |

---

## 🏗️ Technical Background

### Physics Model

The tool implements the physics model from the "2025 Comprehensive Analysis" document with practical corrections:

1. **Stator Volume** = π × (width/2)² × height
   - Primary torque indicator
   - Validated against STATOR_GUIDE reference table

2. **Thrust Estimation** = (Vol × 0.042) × (Prop/5)^1.5 × (KV×V/1000) × 4 motors
   - Includes duct penalty factor (-20% for prop guards)
   - **Warning**: Ignores prop pitch, blade count—real thrust varies ±30-50%

3. **Authority** = (Thrust-to-Weight - 2) × 0.85
   - Measures ability to recover from dives

4. **Responsiveness** = log10((Vol×100) / (AUW × Prop²)) × 5.5
   - Torque-to-inertia ratio
   - Higher = twitchier

5. **Stability** = 10 - |DiskLoading - 0.65| × 20
   - Target disk loading: 0.65 g/cm²
   - Lower DL = floaty, higher DL = locked-in

6. **Reliability** = KV thermal factor - amp hog penalty
   - Lower KV = cooler = longer motor life
   - Penalizes large stator + high KV combos

### Model Limitations (Important!)

⚠️ **This tool is for comparative analysis and component selection guidance—not absolute performance prediction.**

- Ignores prop pitch, blade count, and air density
- Assumes N52H magnets (budget motors may differ)
- Battery chemistry and internal resistance not modeled
- Real thrust can vary 30-50% based on prop selection

**Always validate with:**
- Thrust stand databases (Chris Rosser, Bardwell)
- Community flight reports
- Test flights with your specific components

---

## 📦 What's in This Repo

```
FPV-configurator/
├── index.html                    # 🚀 Standalone HTML (just open in browser!)
├── FPV-configurator.jsx          # Main React component
└── README.md                     # This file
```

---

## 🛠️ Running the Tool

### 🚀 Quick Start (Recommended)

**Just open `index.html` in your browser!**

```bash
# Clone the repository
git clone https://github.com/cori/FPV-configurator.git
cd FPV-configurator

# Open index.html in your browser
# - Double-click the file, or
# - Right-click → Open with → Your Browser
```

No installation, no build process, no dependencies to install. Just clone and open!

### As a React Component (For Developers)

If you want to integrate this into your own React project:

```bash
# Install dependencies
npm install react react-dom lucide-react

# Import the component
import FPVAnalysisTool from './FPV-configurator.jsx';

# Use in your app
<FPVAnalysisTool />
```

**Note:** The component uses Tailwind CSS classes. Include Tailwind in your project:

```bash
npm install -D tailwindcss
npx tailwindcss init
```

---

## 📊 Preset Reference

### Micro Class (65-75mm Whoops)

| Preset | Motor | KV | Weight | Video | Use Case |
|--------|-------|-----|--------|-------|----------|
| 65mm Analog (Budget) | 0802 | 19,500 | 31g | Analog | Beginner-friendly, reliable |
| 65mm Analog (Intermediate) | 0802 | 25,000 | 29g | Analog | More punch, manageable heat |
| 65mm Racing (Advanced) | 0702 | 30,000 | 26g | Analog | Elite racing, demands tuning |
| 75mm Analog (Standard) | 0802 | 19,500 | 38g | Analog | Indoor/outdoor, proven |
| 75mm O4 HD (Power) | 1002 | 22,000 | 48g | O4 | Necessary for HD weight |

### Standard Class (3-5 inch)

| Preset | Motor | KV | Weight | Battery | Use Case |
|--------|-------|-----|--------|---------|----------|
| 3-inch Toothpick (2S) | 1202.5 | 8,000 | 85g | 2S | Ultralight, wind-sensitive |
| 3-inch Toothpick (3S) | 1303 | 5,000 | 115g | 3S | Performance micro |
| 3.5-inch Freestyle | 1804 | 3,500 | 250g | 4S | Sub-250g class |
| 5-inch Freestyle (Juicy) | 2306 | 1,750 | 640g | 6S | 2025 standard, smooth |
| 5-inch Racing (Pro) | 2207 | 2,050 | 520g | 6S | Explosive, high disk loading |

### Long Range / Heavy Lift

| Preset | Motor | KV | Weight | Battery | Use Case |
|--------|-------|-----|--------|---------|----------|
| 7-inch Long Range | 2806.5 | 1,300 | 1,100g | 6S Li-Ion | Efficiency focus |
| Cinelifter (X8 Heavy) | 2812 | 1,050 | 2,700g | 8S | Industrial torque |

---

## 🔧 Customization

### Adding Your Own Presets

Edit the `PRESETS` object in `FPV-configurator.jsx`:

```javascript
const PRESETS = {
  "My Custom Build": {
    statorW: 22, statorH: 7, kv: 2000,
    propSize: 5.1,
    propPitch: 4.5, blades: 3,
    voltage: 22.2,
    droneWeight: 350, battWeight: 200,
    ducted: false, videoSystem: "O4",
    desc: "Your custom description here",
    tier: "Custom"
  },
  // ... existing presets
};
```

### Adjusting Scoring Thresholds

Modify the scoring functions in the `results` useMemo hook:

```javascript
// Example: Make authority score more forgiving
const scoreAuthRaw = (twr - 1.5) * 1.0;  // Original: (twr - 2) * 0.85
```

---

## 🎯 Real-World Build Examples

### Example 1: Budget 65mm Indoor Whoop
**Use Case**: Learning to fly indoors, occasional outdoor park sessions

**Specs**:
- Motor: 0802 @ 19,500KV
- Props: 31mm 2-blade with guards
- Battery: 1S 300mAh HV (30-40C)
- Video: Analog VTX
- Weight: 31g AUW

**Expected Results**:
- Authority: 6-7 (adequate for recovery)
- Responsiveness: 7-8 (easy to tune)
- Stability: 8-9 (good wind penetration for size)
- Reliability: 9-10 (cool-running, long motor life)

### Example 2: 5-inch Freestyle Juicy Build
**Use Case**: Freestyle with smooth flow, HD recording

**Specs**:
- Motor: 2306 @ 1,750KV
- Props: 5.1" tri-blade (4.3 pitch)
- Battery: 6S 1100mAh (90-120C)
- Video: DJI O4
- Weight: 640g AUW

**Expected Results**:
- Authority: 7-8 (excellent recovery)
- Responsiveness: 5-6 (smooth, cinematic)
- Stability: 9-10 (locked-in, heavy)
- Reliability: 9-10 (low KV = cool)

---

## 🐛 Troubleshooting

### "My build scores poorly but flies great!"

This means:
1. The model isn't accounting for something (prop selection, tune quality)
2. Your flying style suits the characteristics
3. The scoring thresholds don't match your preferences

**Solution**: Use the tool for *comparative* analysis, not absolute judgment.

### "Thrust estimate seems way off"

The model ignores prop pitch and blade count. A 5.1×4.9 tri-blade produces 30-40% more thrust than a 5.1×3.5 bi-blade on the same motor. Use thrust stand databases for real numbers.

### "Why does ducted mode lower my scores?"

Prop guards add 20% drag (thrust penalty) but enable indoor flying. The tool shows the performance cost—you decide if the tradeoff is worth it.

---

## 📚 Further Reading

### Recommended Resources

- **Chris Rosser Thrust Testing**: Comprehensive motor/prop thrust data
- **Joshua Bardwell Database**: Community-sourced motor specifications

### Related Topics

- Disk loading theory and its effect on "feel"
- Kt/Kv inverse relationship
- Stator volume vs. torque production
- 6S efficiency advantages over 4S
- Battery C-rating and internal resistance

---

## 🤝 Contributing

This tool is based on real-world builder experience. Contributions welcome:

1. **Thrust Validation Data**: Help calibrate the model with thrust stand results
2. **Additional Presets**: Submit proven builds with flight characteristics
3. **Prop Database**: Blade count and pitch effects on thrust
4. **ESC Constraints**: AIO board amperage limits and warnings
5. **Battery Chemistry**: GNB27, BT2.0, and internal resistance modeling

### Roadmap

- [ ] Prop selection guidance (blade count, pitch)
- [ ] ESC amperage compatibility checks
- [ ] Battery C-rating requirements calculator
- [ ] Flight controller/ESC integration warnings
- [ ] Community build database with flight reports
- [ ] Calibration against thrust stand data

---

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Original physics model from "2025 Comprehensive Analysis"
- Practical corrections based on community builder experience
- Preset validation from Air65, Meteor75 Pro, and Mobula8 builds
- Chris Rosser and Joshua Bardwell for thrust testing databases

---

## 📞 Contact

For issues, suggestions, or contributions, please open an issue in this repository.

**Fly safe, build smart!** 🚁
