import React, { useState, useRef, useEffect } from "react";
import {
  Home, Sprout, CloudRain, CalendarDays, Coins, Bot, User, Bell, Globe,
  Camera, Mic, Upload, ChevronRight, Droplets, Wind, Sun, TrendingUp,
  TrendingDown, Minus, CheckCircle2, Circle, Award, Leaf, MapPin, X, Send,
  ThermometerSun, Sparkles, ArrowRight, Edit3
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";

/* ======================================================================
   Zavuka Farms — "Grow Smarter. Farm Stronger." — for young farmers, girls and boys
   Design tokens: forest/leaf/olive/terracotta/sand/gold/sky
   Display face: Fraunces (organic serif) · Body: Manrope · Data: IBM Plex Mono
   Signature element: The Farming Journey trail — a hand-drawn winding path
   ====================================================================== */

const T = {
  forest: "#1B4332",
  forestLight: "#2D6A4F",
  leaf: "#52B788",
  leafLight: "#95D5B2",
  olive: "#7C8C4A",
  terracotta: "#D9663B",
  terracottaDark: "#B94E28",
  sand: "#F6EFDD",
  sandDark: "#EBDCB4",
  gold: "#E9B44C",
  sky: "#6FB1D6",
  ink: "#1E2A1F",
};

/* ----------------------------- MOCK SERVICES -----------------------------
   Each "service" simulates an async network call and returns a Promise.
   Replace the body of each function with a real fetch() to swap in live
   data later — the calling components never need to change.
--------------------------------------------------------------------------*/

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const weatherService = {
  async getForecast() {
    await delay(400);
    return {
      location: "Alice, Eastern Cape",
      current: { temp: 24, rainChance: 72, humidity: 68, wind: 14, condition: "Partly Cloudy" },
      insight: "Rain is expected in 2 days. Consider preparing your field and clearing drainage today.",
      week: [
        { day: "Mon", temp: 24, rain: 20, icon: "sun" },
        { day: "Tue", temp: 23, rain: 45, icon: "cloud" },
        { day: "Wed", temp: 21, rain: 72, icon: "rain" },
        { day: "Thu", temp: 20, rain: 80, icon: "rain" },
        { day: "Fri", temp: 22, rain: 30, icon: "cloud" },
        { day: "Sat", temp: 25, rain: 10, icon: "sun" },
        { day: "Sun", temp: 26, rain: 5, icon: "sun" },
      ],
    };
  },
};

const cropService = {
  async getCrops() {
    await delay(300);
    return [
      { id: "maize", name: "Maize", emoji: "🌽", health: 87, stage: "Vegetative", risk: "Low", lastChecked: "Today" },
      { id: "beans", name: "Beans", emoji: "🌱", health: 74, stage: "Flowering", risk: "Medium", lastChecked: "2 days ago" },
      { id: "tomatoes", name: "Tomatoes", emoji: "🍅", health: 91, stage: "Fruiting", risk: "Low", lastChecked: "Today" },
    ];
  },
  async analyseImage(_imageDataUrl) {
    await delay(1800);
    const outcomes = [
      { issue: "Nitrogen deficiency", confidence: 87, noticed: "Yellowing of older, lower leaves.", action: "Check soil nutrient levels and consider a nitrogen-rich top dressing." },
      { issue: "Early blight (possible)", confidence: 76, noticed: "Small dark concentric spots on leaf surfaces.", action: "Remove affected leaves and improve airflow between plants." },
      { issue: "Healthy growth", confidence: 94, noticed: "Even green colour and strong stem structure.", action: "No action needed — maintain current watering and feeding routine." },
    ];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  },
};

const plantingService = {
  // Rule-based recommendation engine — swap for a trained model later.
  async recommend({ crop, location, soil, size }) {
    await delay(900);
    const base = { maize: 87, beans: 79, tomatoes: 83 }[crop] || 75;
    const soilBonus = soil === "loamy" ? 8 : soil === "sandy" ? -4 : 2;
    const confidence = Math.max(50, Math.min(97, base + soilBonus));
    return {
      window: crop === "maize" ? "18–25 August" : crop === "beans" ? "2–9 September" : "10–17 September",
      confidence,
      rainfall: "Favourable — moderate rainfall expected across the window.",
      temperature: "Suitable — average temperatures within optimal range.",
      soilSuitability: soil === "loamy" ? "Excellent" : soil === "sandy" ? "Fair — consider added compost" : "Good",
      recommendation: `Conditions are becoming favourable for ${crop || "your crop"} in ${location || "your area"}. Prepare the field now and aim to plant within the recommended window. Estimated plot: ${size || "—"} ha.`,
    };
  },
};

const marketService = {
  async getPrices() {
    await delay(350);
    return {
      rows: [
        { crop: "Maize", market: "Cape Town", price: "R4,850/t", trend: "up", change: "8%" },
        { crop: "Beans", market: "Cape Town", price: "R7,200/t", trend: "flat", change: "2%" },
        { crop: "Tomatoes", market: "Cape Town", price: "R9.50/kg", trend: "up", change: "12%" },
      ],
      opportunity: "🌽 Maize prices are trending upward. Consider monitoring the market for another 3–5 days before selling.",
      trend: [
        { day: "Mon", maize: 4520 }, { day: "Tue", maize: 4610 }, { day: "Wed", maize: 4680 },
        { day: "Thu", maize: 4700 }, { day: "Fri", maize: 4790 }, { day: "Sat", maize: 4820 }, { day: "Sun", maize: 4850 },
      ],
    };
  },
};

const aiService = {
  // Point this at a real LLM endpoint later; keep the mock map for demo mode.
  async ask(question) {
    await delay(650);
    const q = question.toLowerCase();
    if (q.includes("plant") && q.includes("maize")) return "Based on your local rainfall outlook, the best window to plant maize is 18–25 August. Prepare your soil this week so you're ready.";
    if (q.includes("rain")) return "Rain is likely mid-week, with a 72% chance on Wednesday. It's a good time to check drainage before then.";
    if (q.includes("yellow")) return "Yellowing on older leaves often points to a nitrogen deficiency. Try a soil test and a nitrogen-rich top dressing, then recheck in a week.";
    if (q.includes("sell") || q.includes("maize") && q.includes("price")) return "Maize prices are trending up (+8% this week). It may be worth holding for another 3–5 days before selling if storage allows.";
    if (q.includes("yield")) return "Three things tend to move the needle most: consistent watering during flowering, timely weeding, and matching fertiliser to your soil test — not a flat schedule.";
    return "Good question — here's a general tip: keep an eye on your Weather and Crop Health tabs this week, both feed directly into timing decisions like this one.";
  },
};

const farmerService = {
  async getProfile() {
    await delay(200);
    return {
      name: "Siphosethu Mtshali",
      farmName: "Emthonjeni Farm",
      location: "Eastern Cape",
      size: "2.5 hectares",
      crops: "Maize, Beans",
      season: "Summer 2026",
      goals: "Increase maize yield by 15% and help other young farmers nearby start selling at local markets.",
    };
  },
};

/* ------------------------------ TRANSLATIONS ------------------------------ */
const LANGS = { en: "English", xh: "isiXhosa", zu: "isiZulu", sw: "Kiswahili" };
const STR = {
  en: { greeting: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" }, sub: "Let's make today a great farming day.", home: "Home", farm: "My Farm", weather: "Weather", planting: "Planting", market: "Market", advisor: "AI Advisor", profile: "Profile" },
  xh: { greeting: { morning: "Molo", afternoon: "Molo", evening: "Molo ngokuhlwa" }, sub: "Masenze namhlanje ibe lusuku oluhle lokulima.", home: "Ikhaya", farm: "Ifama Yam", weather: "Imozulu", planting: "Ukutyala", market: "Imarike", advisor: "I-AI", profile: "Iprofayile" },
  zu: { greeting: { morning: "Sawubona", afternoon: "Sawubona", evening: "Sawubona ntambama" }, sub: "Asenze namuhla kube usuku oluhle lokulima.", home: "Ikhaya", farm: "Ipulazi Lami", weather: "Isimo Sezulu", planting: "Ukutshala", market: "Imakethe", advisor: "I-AI", profile: "Iphrofayela" },
  sw: { greeting: { morning: "Habari za asubuhi", afternoon: "Habari za mchana", evening: "Habari za jioni" }, sub: "Hebu tufanye leo iwe siku nzuri ya kilimo.", home: "Nyumbani", farm: "Shamba Langu", weather: "Hali ya Hewa", planting: "Kupanda", market: "Soko", advisor: "AI Msaidizi", profile: "Wasifu" },
};

function timeOfDay(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

/* --------------------------------- UI BITS -------------------------------- */

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
      .aw-root { font-family: 'Manrope', sans-serif; color: ${T.ink}; }
      .aw-display { font-family: 'Fraunces', serif; }
      .aw-mono { font-family: 'IBM Plex Mono', monospace; }
      .aw-scroll::-webkit-scrollbar { display: none; }
      .aw-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes aw-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .aw-rise { animation: aw-rise 0.5s ease both; }
      @keyframes aw-sway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
      .aw-sway { animation: aw-sway 3.5s ease-in-out infinite; transform-origin: bottom center; }
      @keyframes aw-pulse-soft { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
      .aw-pulse { animation: aw-pulse-soft 1.4s ease-in-out infinite; }
      .aw-card { background: #FFFFFF; border-radius: 22px; box-shadow: 0 1px 2px rgba(27,67,50,0.06), 0 8px 24px rgba(27,67,50,0.06); }
      .aw-btn-primary { background: linear-gradient(135deg, ${T.leaf}, ${T.forestLight}); color: white; }
      .aw-btn-terracotta { background: linear-gradient(135deg, ${T.terracotta}, ${T.terracottaDark}); color: white; }
    `}</style>
  );
}

function ProgressRing({ value, size = 56, stroke = 6, color = T.leaf }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF3EA" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="50%" y="52%" textAnchor="middle" dy=".3em" className="aw-mono" fontSize={size * 0.26} fill={T.forest} fontWeight={600}>
        {value}%
      </text>
    </svg>
  );
}

function TrendBadge({ trend, change }) {
  const map = {
    up: { icon: TrendingUp, bg: "#E7F5EC", fg: T.forest },
    down: { icon: TrendingDown, bg: "#FBEAE6", fg: T.terracottaDark },
    flat: { icon: Minus, bg: "#F2F0E8", fg: T.olive },
  };
  const M = map[trend] || map.flat;
  const Icon = M.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold aw-mono" style={{ background: M.bg, color: M.fg }}>
      <Icon size={12} /> {change}
    </span>
  );
}

/* --------------------------------- SECTIONS -------------------------------- */

function WeatherCard({ data }) {
  if (!data) return <LoadingCard label="Checking weather conditions..." />;
  const iconFor = (icon) => (icon === "rain" ? <CloudRain size={20} /> : icon === "cloud" ? <Sun size={20} className="opacity-70" /> : <Sun size={20} />);
  return (
    <div className="aw-card p-5 aw-rise" style={{ background: `linear-gradient(145deg, ${T.sky}22, #ffffff)` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: T.sky }}>Weather Watch</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="aw-display text-4xl font-semibold" style={{ color: T.forest }}>{data.current.temp}°C</span>
            <span className="text-sm text-gray-500">{data.current.condition}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end text-sm font-semibold" style={{ color: T.sky }}>
            <Droplets size={15} /> {data.current.rainChance}%
          </div>
          <p className="text-xs text-gray-400">chance of rain</p>
        </div>
      </div>

      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Wind size={13} /> {data.current.wind} km/h</span>
        <span className="flex items-center gap-1"><Droplets size={13} /> {data.current.humidity}% humidity</span>
        <span className="flex items-center gap-1"><MapPin size={13} /> {data.location}</span>
      </div>

      <div className="flex gap-2 mt-4 overflow-x-auto aw-scroll pb-1">
        {data.week.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 min-w-[54px]" style={{ background: "#F6FBF8" }}>
            <span className="text-[11px] text-gray-400 font-semibold">{d.day}</span>
            <span style={{ color: T.sky }}>{iconFor(d.icon)}</span>
            <span className="aw-mono text-xs font-semibold" style={{ color: T.forest }}>{d.temp}°</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl p-3" style={{ background: `${T.gold}1f` }}>
        <Sparkles size={16} className="mt-0.5 shrink-0" style={{ color: T.terracotta }} />
        <p className="text-sm leading-snug" style={{ color: T.ink }}>{data.insight}</p>
      </div>
    </div>
  );
}

const CROP_EMOJI_POOL = ["🌽", "🌱", "🍅", "🥔", "🥕", "🌻", "🍠", "🥬"];

function CropHealthSection({ crops, onOpenCheck, onUpdateCrop, onRemoveCrop, onAddCrop }) {
  const [editing, setEditing] = useState(false);
  if (!crops) return <LoadingCard label="Reading crop health..." />;

  const addCrop = () => {
    const name = window.prompt("Name of the new crop?", "New Crop");
    if (!name) return;
    onAddCrop({
      id: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name, emoji: CROP_EMOJI_POOL[Math.floor(Math.random() * CROP_EMOJI_POOL.length)],
      health: 80, stage: "Seedling", risk: "Low", lastChecked: "Today",
    });
  };

  return (
    <div className="aw-card p-5 aw-rise">
      <div className="flex items-center justify-between mb-3">
        <h3 className="aw-display text-lg font-semibold" style={{ color: T.forest }}>Crop Health</h3>
        <div className="flex items-center gap-2">
          {onUpdateCrop && (
            <button onClick={() => setEditing((v) => !v)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: editing ? T.leaf : "#F6FBF8", color: editing ? "white" : T.forest }}>
              <Edit3 size={13} /> {editing ? "Done" : "Edit"}
            </button>
          )}
          <button onClick={onOpenCheck} className="text-xs font-semibold px-3 py-1.5 rounded-full aw-btn-primary flex items-center gap-1">
            <Camera size={13} /> Check Crop Health
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {crops.map((c) => (
          <div key={c.id} className="rounded-2xl p-3 flex items-start gap-3 relative" style={{ background: "#F6FBF8" }}>
            {editing && onRemoveCrop && (
              <button onClick={() => onRemoveCrop(c.id)} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "white", color: T.terracottaDark }}>
                <X size={11} />
              </button>
            )}
            <ProgressRing value={c.health} size={52} color={c.health > 85 ? T.leaf : c.health > 60 ? T.gold : T.terracotta} />
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="space-y-1">
                  <input value={c.name} onChange={(e) => onUpdateCrop(c.id, { name: e.target.value })} className="w-full bg-transparent font-semibold text-sm outline-none border-b" style={{ color: T.forest, borderColor: T.leafLight }} />
                  <input type="range" min="0" max="100" value={c.health} onChange={(e) => onUpdateCrop(c.id, { health: Number(e.target.value) })} className="w-full" />
                  <input value={c.stage} onChange={(e) => onUpdateCrop(c.id, { stage: e.target.value })} placeholder="Growth stage" className="w-full text-xs outline-none border-b bg-transparent" style={{ borderColor: "#E3E9DF" }} />
                  <select value={c.risk} onChange={(e) => onUpdateCrop(c.id, { risk: e.target.value })} className="w-full text-xs outline-none border-b bg-transparent">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              ) : (
                <>
                  <p className="font-semibold text-sm flex items-center gap-1" style={{ color: T.forest }}>{c.emoji} {c.name}</p>
                  <p className="text-xs text-gray-400">{c.stage} · {c.risk} risk</p>
                  <p className="text-[11px] text-gray-400">Checked {c.lastChecked}</p>
                </>
              )}
            </div>
          </div>
        ))}
        {editing && onAddCrop && (
          <button onClick={addCrop} className="rounded-2xl p-3 flex items-center justify-center gap-2 border-2 border-dashed text-sm font-semibold" style={{ borderColor: T.leafLight, color: T.forest }}>
            + Add crop
          </button>
        )}
      </div>
    </div>
  );
}

const JOURNEY_STAGES = [
  { key: "soil", label: "Prepare Soil", emoji: "🌱" },
  { key: "seeds", label: "Plant Seeds", emoji: "🌾" },
  { key: "water", label: "Water & Monitor", emoji: "💧" },
  { key: "protect", label: "Protect Crops", emoji: "🌿" },
  { key: "grow", label: "Grow", emoji: "☀️" },
  { key: "harvest", label: "Harvest", emoji: "🌾" },
  { key: "sell", label: "Sell", emoji: "💰" },
];
const BADGES = [
  { emoji: "🌱", label: "First Seed" }, { emoji: "💧", label: "Water Watcher" },
  { emoji: "🌿", label: "Crop Protector" }, { emoji: "🌾", label: "Harvest Hero" },
  { emoji: "💰", label: "Smart Seller" },
];

function JourneyTrail({ currentIndex = 3, progress = 65 }) {
  return (
    <div className="aw-card p-5 aw-rise">
      <div className="flex items-center justify-between mb-1">
        <h3 className="aw-display text-lg font-semibold" style={{ color: T.forest }}>Your Farming Journey</h3>
        <span className="aw-mono text-xs font-semibold px-2 py-1 rounded-full" style={{ background: `${T.leaf}22`, color: T.forest }}>{progress}%</span>
      </div>
      <div className="rounded-2xl p-4 mb-4" style={{ background: `linear-gradient(135deg, ${T.forest}, ${T.forestLight})` }}>
        <p className="text-xs uppercase tracking-wide text-white/70 font-semibold">Current Stage</p>
        <p className="text-white aw-display text-xl font-semibold mt-0.5">🌿 {JOURNEY_STAGES[currentIndex].label}</p>
        <p className="text-white/80 text-sm mt-1">Your maize is currently in the vegetative growth stage.</p>
        <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: T.gold, transition: "width 1s ease" }} />
        </div>
      </div>

      {/* Winding path */}
      <div className="relative overflow-x-auto aw-scroll pb-2">
        <svg viewBox="0 0 720 90" width="100%" height="90" className="min-w-[640px]">
          <path d="M20,70 C 90,10 150,10 210,50 S 330,90 390,50 S 510,10 570,50 S 660,90 700,50" fill="none" stroke="#DCE7DC" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 10" />
          {JOURNEY_STAGES.map((s, i) => {
            const x = 20 + i * (680 / (JOURNEY_STAGES.length - 1));
            const y = i % 2 === 0 ? 55 : 25;
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <g key={s.key} transform={`translate(${x},${y})`}>
                <circle r={active ? 17 : 13} fill={done ? T.leaf : active ? T.terracotta : "#fff"} stroke={done || active ? "none" : "#D8E2D4"} strokeWidth="2" />
                <text textAnchor="middle" dy=".35em" fontSize="13">{s.emoji}</text>
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between min-w-[640px] px-1 -mt-1">
          {JOURNEY_STAGES.map((s, i) => (
            <span key={s.key} className="text-[10px] font-semibold text-center w-16 -ml-6 first:ml-0" style={{ color: i <= currentIndex ? T.forest : "#B7C2B3" }}>{s.label}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-4 overflow-x-auto aw-scroll pb-1">
        {BADGES.map((b, i) => (
          <div key={b.label} className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 min-w-[74px]" style={{ background: i < 3 ? `${T.gold}22` : "#F3F3F0", opacity: i < 3 ? 1 : 0.5 }}>
            <span className="text-xl">{b.emoji}</span>
            <span className="text-[10px] font-semibold text-center" style={{ color: T.forest }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingCard({ label }) {
  return (
    <div className="aw-card p-6 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full aw-pulse" style={{ background: `${T.leaf}44` }} />
      <p className="text-sm text-gray-400 aw-pulse">{label}</p>
    </div>
  );
}

function NotificationsPanel({ open, onClose }) {
  const items = [
    { icon: <CloudRain size={16} />, title: "Weather Alert", body: "Heavy rainfall expected tomorrow.", color: T.sky },
    { icon: <Sprout size={16} />, title: "Crop Reminder", body: "Your maize should be checked today.", color: T.leaf },
    { icon: <Coins size={16} />, title: "Market Alert", body: "Maize prices increased by 8%.", color: T.gold },
    { icon: <CalendarDays size={16} />, title: "Planting Reminder", body: "Your recommended planting window begins in 3 days.", color: T.terracotta },
  ];
  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="aw-display text-lg font-semibold" style={{ color: T.forest }}>Notifications</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          {items.map((n, i) => (
            <div key={i} className="rounded-2xl p-3 flex gap-3" style={{ background: "#F6FBF8" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${n.color}22`, color: n.color }}>{n.icon}</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: T.forest }}>{n.title}</p>
                <p className="text-xs text-gray-500">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- PAGES -------------------------------- */

function DashboardPage({ lang, weather, crops, onOpenCheck, farmerName, cropHandlers }) {
  const s = STR[lang];
  const firstName = (farmerName || "Farmer").split(" ")[0];
  return (
    <div className="space-y-4 pb-4">
      <div className="aw-rise">
        <p className="text-sm text-gray-400">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="aw-display text-3xl font-semibold" style={{ color: T.forest }}>{s.greeting[timeOfDay()]}, {firstName} 👋</h1>
        <p className="text-gray-500 mt-1">{s.sub}</p>
      </div>
      <WeatherCard data={weather} />
      <CropHealthSection crops={crops} onOpenCheck={onOpenCheck} {...cropHandlers} />
      <JourneyTrail />
    </div>
  );
}

function CropCheckModal({ open, onClose }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setPreview(e.target.result);
      setResult(null);
      setLoading(true);
      const r = await cropService.analyseImage(e.target.result);
      setResult(r);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const reset = () => { setPreview(null); setResult(null); setLoading(false); };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => { onClose(); reset(); }} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[88vh] overflow-y-auto aw-scroll p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="aw-display text-xl font-semibold" style={{ color: T.forest }}>AI Crop Check</h3>
          <button onClick={() => { onClose(); reset(); }}><X size={18} /></button>
        </div>

        {!preview && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-2 cursor-pointer"
            style={{ borderColor: T.leafLight, background: "#F6FBF8" }}
          >
            <Upload style={{ color: T.leaf }} />
            <p className="text-sm font-semibold" style={{ color: T.forest }}>Drop a crop photo here</p>
            <p className="text-xs text-gray-400">or tap to upload / take a photo</p>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <img src={preview} alt="Crop preview" className="w-full h-48 object-cover rounded-2xl" />
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-400 aw-pulse">
                <Sparkles size={16} /> Analysing your crop...
              </div>
            )}
            {result && !loading && (
              <div className="rounded-2xl p-4 space-y-2" style={{ background: "#F6FBF8" }}>
                <h4 className="aw-display font-semibold" style={{ color: T.forest }}>AI Crop Analysis</h4>
                <p className="text-sm"><span className="font-semibold">Possible issue:</span> {result.issue}</p>
                <p className="text-sm"><span className="font-semibold">Confidence:</span> {result.confidence}%</p>
                <p className="text-sm"><span className="font-semibold">What we noticed:</span> {result.noticed}</p>
                <p className="text-sm"><span className="font-semibold">Recommended action:</span> {result.action}</p>
                <p className="text-[11px] text-gray-400 pt-1 border-t mt-2">AI-generated assessment. Consult an agricultural expert for confirmation.</p>
              </div>
            )}
            <button onClick={reset} className="text-sm font-semibold px-4 py-2 rounded-full w-full aw-btn-primary">Check another photo</button>
          </div>
        )}
      </div>
    </div>
  );
}

function FarmPage({ crops, onOpenCheck, cropHandlers }) {
  return (
    <div className="space-y-4 pb-4">
      <h2 className="aw-display text-2xl font-semibold aw-rise" style={{ color: T.forest }}>🌱 My Farm</h2>
      <CropHealthSection crops={crops} onOpenCheck={onOpenCheck} {...cropHandlers} />
      <JourneyTrail />
    </div>
  );
}

function WeatherPage({ weather }) {
  if (!weather) return <LoadingCard label="Checking weather conditions..." />;
  return (
    <div className="space-y-4 pb-4">
      <h2 className="aw-display text-2xl font-semibold aw-rise" style={{ color: T.forest }}>🌦️ Weather</h2>
      <WeatherCard data={weather} />
      <div className="aw-card p-5">
        <h3 className="aw-display text-lg font-semibold mb-3" style={{ color: T.forest }}>7-Day Outlook</h3>
        <div className="space-y-2">
          {weather.week.map((d) => (
            <div key={d.day} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#F6FBF8" }}>
              <span className="text-sm font-semibold w-12" style={{ color: T.forest }}>{d.day}</span>
              <span className="flex items-center gap-1 text-xs text-gray-500"><Droplets size={13} /> {d.rain}%</span>
              <span className="aw-mono text-sm font-semibold" style={{ color: T.forest }}>{d.temp}°C</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlantingPage() {
  const [form, setForm] = useState({ crop: "maize", location: "Eastern Cape", soil: "loamy", size: "2.5" });
  const [loading, setLoading] = useState(false);
  const [rec, setRec] = useState(null);

  const submit = async () => {
    setLoading(true);
    setRec(await plantingService.recommend(form));
    setLoading(false);
  };

  useEffect(() => { submit(); /* seed with defaults */ }, []); // eslint-disable-line

  return (
    <div className="space-y-4 pb-4">
      <h2 className="aw-display text-2xl font-semibold aw-rise" style={{ color: T.forest }}>🌱 Smart Planting Guide</h2>

      <div className="aw-card p-5 grid grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-gray-500 col-span-1">
          Crop
          <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option value="maize">Maize</option><option value="beans">Beans</option><option value="tomatoes">Tomatoes</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-500 col-span-1">
          Location
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-gray-500 col-span-1">
          Soil type
          <select value={form.soil} onChange={(e) => setForm({ ...form, soil: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
            <option value="loamy">Loamy</option><option value="sandy">Sandy</option><option value="clay">Clay</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-gray-500 col-span-1">
          Farm size (ha)
          <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
        <button onClick={submit} className="col-span-2 mt-1 text-sm font-semibold px-4 py-2.5 rounded-full aw-btn-primary">Get Planting Recommendation</button>
      </div>

      {loading && <LoadingCard label="Calculating planting window..." />}
      {rec && !loading && (
        <div className="aw-card p-5 space-y-3 aw-rise">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-gray-400">Recommended Planting Window</p>
              <p className="aw-display text-2xl font-semibold" style={{ color: T.forest }}>{rec.window}</p>
            </div>
            <ProgressRing value={rec.confidence} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div className="rounded-xl p-3" style={{ background: "#F6FBF8" }}><p className="text-xs text-gray-400">Rainfall</p><p className="font-semibold" style={{ color: T.forest }}>{rec.rainfall}</p></div>
            <div className="rounded-xl p-3" style={{ background: "#F6FBF8" }}><p className="text-xs text-gray-400">Temperature</p><p className="font-semibold" style={{ color: T.forest }}>{rec.temperature}</p></div>
            <div className="rounded-xl p-3" style={{ background: "#F6FBF8" }}><p className="text-xs text-gray-400">Soil</p><p className="font-semibold" style={{ color: T.forest }}>{rec.soilSuitability}</p></div>
          </div>
          <div className="flex items-start gap-2 rounded-2xl p-3" style={{ background: `${T.gold}1f` }}>
            <Sparkles size={16} className="mt-0.5 shrink-0" style={{ color: T.terracotta }} />
            <p className="text-sm">{rec.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MarketPage() {
  const [data, setData] = useState(null);
  useEffect(() => { marketService.getPrices().then(setData); }, []);
  if (!data) return <LoadingCard label="Finding market trends..." />;
  return (
    <div className="space-y-4 pb-4">
      <h2 className="aw-display text-2xl font-semibold aw-rise" style={{ color: T.forest }}>💰 Market Watch</h2>
      <div className="aw-card p-5">
        <div className="space-y-2">
          {data.rows.map((r) => (
            <div key={r.crop} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: "#F6FBF8" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: T.forest }}>{r.crop}</p>
                <p className="text-xs text-gray-400">{r.market}</p>
              </div>
              <p className="aw-mono text-sm font-semibold">{r.price}</p>
              <TrendBadge trend={r.trend} change={r.change} />
            </div>
          ))}
        </div>
      </div>
      <div className="aw-card p-5">
        <h3 className="aw-display text-lg font-semibold mb-3" style={{ color: T.forest }}>Maize Price Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.trend}>
            <defs>
              <linearGradient id="mz" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.leaf} stopOpacity={0.5} />
                <stop offset="100%" stopColor={T.leaf} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEE" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
            <Tooltip />
            <Area type="monotone" dataKey="maize" stroke={T.forest} fill="url(#mz)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="aw-card p-5 flex items-start gap-2" style={{ background: `${T.gold}1f` }}>
        <Sparkles size={16} className="mt-0.5 shrink-0" style={{ color: T.terracotta }} />
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: T.forest }}>Best Selling Opportunity</p>
          <p className="text-sm">{data.opportunity}</p>
        </div>
      </div>
    </div>
  );
}

const SUGGESTED_Q = [
  "When should I plant maize?", "Will it rain this week?", "Why are my leaves turning yellow?",
  "What should I plant this season?", "When should I sell my maize?", "How can I improve my yield?",
];

function AdvisorPage({ farmerName }) {
  const firstName = (farmerName || "there").split(" ")[0];
  const [messages, setMessages] = useState([
    { from: "bot", text: `Hi ${firstName} 👋 I'm your Zavuka AI advisor. Ask me anything about your farm.` },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const send = async (text) => {
    const q = text ?? input;
    if (!q.trim()) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setThinking(true);
    const answer = await aiService.ask(q);
    setThinking(false);
    setMessages((m) => [...m, { from: "bot", text: answer }]);
  };

  return (
    <div className="flex flex-col h-full pb-2">
      <div className="aw-rise mb-3">
        <h2 className="aw-display text-2xl font-semibold" style={{ color: T.forest }}>🤖 Zavuka AI</h2>
        <p className="text-sm text-gray-400">Your smart farming companion.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto aw-scroll pb-2 mb-2">
        {SUGGESTED_Q.map((q) => (
          <button key={q} onClick={() => send(q)} className="whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border" style={{ borderColor: T.leafLight, color: T.forest }}>
            {q}
          </button>
        ))}
      </div>

      <div className="aw-card flex-1 p-4 overflow-y-auto aw-scroll space-y-3 min-h-[300px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
              style={m.from === "user" ? { background: T.forest, color: "white" } : { background: "#F6FBF8", color: T.ink }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2.5 text-sm aw-pulse" style={{ background: "#F6FBF8" }}>thinking…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#F6FBF8", color: T.forest }} title="Voice input"><Mic size={16} /></button>
        <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#F6FBF8", color: T.forest }} title="Send crop photo"><Camera size={16} /></button>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask Zavuka AI…"
          className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: "#E3E9DF" }}
        />
        <button onClick={() => send()} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 aw-btn-primary"><Send size={16} /></button>
      </div>
    </div>
  );
}

function ProfilePage({ profile, setProfile }) {
  const [editing, setEditing] = useState(false);
  if (!profile) return <LoadingCard label="Loading your profile..." />;

  const Field = ({ label, keyName }) => (
    <div className="rounded-xl p-3" style={{ background: "#F6FBF8" }}>
      <p className="text-xs text-gray-400">{label}</p>
      {editing ? (
        <input value={profile[keyName]} onChange={(e) => setProfile({ ...profile, [keyName]: e.target.value })} className="w-full bg-transparent font-semibold text-sm outline-none border-b" style={{ color: T.forest, borderColor: T.leafLight }} />
      ) : (
        <p className="font-semibold text-sm" style={{ color: T.forest }}>{profile[keyName]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between aw-rise">
        <h2 className="aw-display text-2xl font-semibold" style={{ color: T.forest }}>👤 My Farm Profile</h2>
        <button onClick={() => setEditing((v) => !v)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: editing ? T.leaf : "#F6FBF8", color: editing ? "white" : T.forest }}>
          <Edit3 size={13} /> {editing ? "Done" : "Edit"}
        </button>
      </div>
      <div className="aw-card p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Farmer Name" keyName="name" />
        <Field label="Farm Name" keyName="farmName" />
        <Field label="Location" keyName="location" />
        <Field label="Farm Size" keyName="size" />
        <Field label="Main Crops" keyName="crops" />
        <Field label="Current Season" keyName="season" />
      </div>
      <div className="aw-card p-5">
        <p className="text-xs text-gray-400 mb-1">Farming Goals</p>
        {editing ? (
          <textarea value={profile.goals} onChange={(e) => setProfile({ ...profile, goals: e.target.value })} className="w-full text-sm rounded-xl border p-2 outline-none" rows={3} />
        ) : (
          <p className="text-sm" style={{ color: T.forest }}>{profile.goals}</p>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- NAV / SHELL -------------------------------- */

const NAV = [
  { key: "home", icon: Home },
  { key: "farm", icon: Sprout },
  { key: "weather", icon: CloudRain },
  { key: "planting", icon: CalendarDays },
  { key: "market", icon: Coins },
  { key: "advisor", icon: Bot },
  { key: "profile", icon: User },
];

export default function ZavukaFarms() {
  const [tab, setTab] = useState("home");
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [crops, setCrops] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    weatherService.getForecast().then(setWeather);
    cropService.getCrops().then(setCrops);
    farmerService.getProfile().then(setProfile);
  }, []);

  const cropHandlers = {
    onUpdateCrop: (id, patch) => setCrops((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    onRemoveCrop: (id) => setCrops((cs) => cs.filter((c) => c.id !== id)),
    onAddCrop: (crop) => setCrops((cs) => [...cs, crop]),
  };

  const s = STR[lang];

  return (
    <div className="aw-root min-h-screen w-full flex" style={{ background: T.sand }}>
      <GlobalStyle />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 p-5 gap-1" style={{ background: T.forest }}>
        <div className="mb-6">
          <p className="aw-display text-white text-xl font-semibold leading-tight">Zavuka<br />Farms</p>
          <p className="text-white/50 text-[11px] mt-1">Grow Smarter. Farm Stronger.</p>
          <p className="text-white/40 text-[11px] mt-1">Built for young farmers — girls &amp; boys.</p>
        </div>
        {NAV.map(({ key, icon: Icon }) => (
          <button
            key={key} onClick={() => setTab(key)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: tab === key ? "rgba(255,255,255,0.12)" : "transparent", color: tab === key ? "white" : "rgba(255,255,255,0.55)" }}
          >
            <Icon size={17} /> {s[key]}
          </button>
        ))}
        <div className="mt-auto flex items-center gap-2 text-white/50 text-xs pt-4">
          <Leaf size={13} /> Demo mode · mock data
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4 sticky top-0 z-30 backdrop-blur" style={{ background: `${T.sand}dd` }}>
          <p className="aw-display font-semibold md:hidden" style={{ color: T.forest }}>Zavuka Farms</p>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setLangOpen((v) => !v)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "white", color: T.forest }}>
                <Globe size={16} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-10 w-36">
                  {Object.entries(LANGS).map(([code, name]) => (
                    <button key={code} onClick={() => { setLang(code); setLangOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" style={{ color: lang === code ? T.leaf : T.ink, fontWeight: lang === code ? 700 : 500 }}>
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setNotifOpen(true)} className="w-9 h-9 rounded-full flex items-center justify-center relative" style={{ background: "white", color: T.forest }}>
              <Bell size={16} />
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full" style={{ background: T.terracotta }} />
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: T.leaf }}>{(profile?.name || "F").charAt(0)}</div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-8 pb-24 md:pb-8 max-w-3xl w-full mx-auto flex flex-col">
          {tab === "home" && <DashboardPage lang={lang} weather={weather} crops={crops} onOpenCheck={() => setCheckOpen(true)} farmerName={profile?.name} cropHandlers={cropHandlers} />}
          {tab === "farm" && <FarmPage crops={crops} onOpenCheck={() => setCheckOpen(true)} cropHandlers={cropHandlers} />}
          {tab === "weather" && <WeatherPage weather={weather} />}
          {tab === "planting" && <PlantingPage />}
          {tab === "market" && <MarketPage />}
          {tab === "advisor" && <AdvisorPage farmerName={profile?.name} />}
          {tab === "profile" && <ProfilePage profile={profile} setProfile={setProfile} />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t flex justify-around py-2 px-1" style={{ borderColor: "#EEE" }}>
        {NAV.map(({ key, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl" style={{ color: tab === key ? T.forest : "#B7C2B3" }}>
            <Icon size={19} strokeWidth={tab === key ? 2.4 : 2} />
            <span className="text-[10px] font-semibold">{s[key]}</span>
          </button>
        ))}
      </nav>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <CropCheckModal open={checkOpen} onClose={() => setCheckOpen(false)} />
    </div>
  );
}