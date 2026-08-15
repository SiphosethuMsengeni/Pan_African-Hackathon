/* ============================================================
   STATE
   Persisted to localStorage so that data reported on report.html
   is still there when you open dashboard.html or deliver.html —
   each page is a separate file, but they share one "session".
   ============================================================ */
const STORAGE_KEY = 'flowreach_state_v1';

const defaultNeeds = [
  { id:1, name:"Kwamfundo Primary",   region:"Khayelitsha",     population:420, weeks:11, stockout:"critical", x:30, y:70, matchedQty:0, delivered:false },
  { id:2, name:"Sisonke Clinic",      region:"Nyanga",          population:180, weeks:6,  stockout:"low",      x:55, y:55, matchedQty:0, delivered:false },
  { id:3, name:"Delft Youth Shelter", region:"Delft",           population:95,  weeks:14, stockout:"critical", x:70, y:35, matchedQty:0, delivered:false },
  { id:4, name:"Nolungile High School", region:"Mitchells Plain", population:310, weeks:4, stockout:"low",     x:45, y:80, matchedQty:0, delivered:false },
  { id:5, name:"Gugulethu Community Hall", region:"Gugulethu",  population:150, weeks:2,  stockout:"none",     x:60, y:20, matchedQty:0, delivered:false },
];

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  }catch(e){ /* fall through to defaults */ }
  return { needs: defaultNeeds, donorPool: [], nextNeedId: defaultNeeds.length + 1 };
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ needs, donorPool, nextNeedId }));
}

let { needs, donorPool, nextNeedId } = loadState();

/* ============================================================
   THE PRIORITISATION ENGINE
   Transparent, rules-based urgency score (0–100), built to be
   swapped for a trained model later without changing anything
   downstream (the dashboard, matching and routing all just read
   this one number).
   ============================================================ */
function calcUrgency(need){
  const stockoutPoints = { critical: 40, low: 22, none: 6 }[need.stockout];
  const timePoints = Math.min(need.weeks / 12, 1) * 30;
  const popPoints  = Math.min(need.population / 600, 1) * 30;
  return Math.round(stockoutPoints + timePoints + popPoints);
}

function urgencyTier(score){
  if (score >= 65) return { label:"Critical", pill:"pill-critical" };
  if (score >= 35) return { label:"Elevated", pill:"pill-med" };
  return { label:"Stable", pill:"pill-low" };
}

/* ============================================================
   THE MATCHING ENGINE
   Greedy allocator: walk the priority queue from most to least
   urgent, and hand out available donor stock until either the
   need is fully covered or the pool runs out.
   ============================================================ */
function runAutoMatch(){
  const totalAvailable = donorPool.reduce((sum, d) => sum + d.qty, 0);
  let remaining = totalAvailable;
  const log = [];

  const ranked = [...needs]
    .filter(n => !n.delivered)
    .sort((a, b) => calcUrgency(b) - calcUrgency(a));

  for (const need of ranked) {
    if (remaining <= 0) break;
    const outstanding = need.population - need.matchedQty;
    if (outstanding <= 0) continue;
    const allocation = Math.min(outstanding, remaining);
    need.matchedQty += allocation;
    remaining -= allocation;
    log.push(`Matched ${allocation} packs → ${need.name} (urgency ${calcUrgency(need)})`);
  }

  donorPool = [];
  return log;
}

/* ============================================================
   RENDERING
   Each function checks that its target element exists, since
   any given page only has some of these elements on it.
   ============================================================ */

function renderPreview(){
  const scoreEl = document.getElementById('previewScore');
  if (!scoreEl) return;
  const draft = {
    stockout: document.getElementById('stockout').value || 'critical',
    weeks: Number(document.getElementById('weeks').value) || 0,
    population: Number(document.getElementById('population').value) || 0,
  };
  const score = calcUrgency(draft);
  scoreEl.textContent = score;
  document.getElementById('previewBar').style.width = score + '%';
}

function renderNeedList(){
  const container = document.getElementById('needList');
  if (!container) return;
  const ranked = [...needs].sort((a,b) => calcUrgency(b) - calcUrgency(a));
  container.innerHTML = ranked.map(n => {
    const score = calcUrgency(n);
    const tier = urgencyTier(score);
    const badges = [
      n.matchedQty > 0 ? `<span class="badge badge-matched">matched ${n.matchedQty}/${n.population}</span>` : '',
      n.delivered ? `<span class="badge badge-delivered">delivered</span>` : ''
    ].join('');
    return `
      <div class="need-row">
        <div>
          <div><strong>${n.name}</strong>${badges}</div>
          <div class="meta">${n.region} · ${n.population} people · ${n.weeks}w since last donation</div>
        </div>
        <div class="score-pill ${tier.pill}">${score}</div>
      </div>`;
  }).join('');
}

function renderMap(){
  const svg = document.getElementById('needMap');
  if (!svg) return;
  const pins = needs.map(n => {
    const score = calcUrgency(n);
    const r = 6 + (score / 100) * 10;
    const cls = n.stockout === 'critical' ? 'pin-critical' : n.stockout === 'low' ? 'pin-low' : 'pin-none';
    const cx = (n.x / 100) * 380 + 10;
    const cy = (n.y / 100) * 260 + 20;
    return `<g>
        <circle cx="${cx}" cy="${cy}" r="${r}" class="${cls}" opacity="0.85"/>
        <text x="${cx}" y="${cy - r - 6}" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" fill="#6E5560">${n.name.split(' ')[0]}</text>
      </g>`;
  }).join('');
  svg.innerHTML = pins;
}

function renderRoutes(){
  const grid = document.getElementById('routeGrid');
  if (!grid) return;
  const matchedNotDelivered = needs.filter(n => n.matchedQty > 0 && !n.delivered);

  const byRegion = {};
  matchedNotDelivered.forEach(n => {
    byRegion[n.region] = byRegion[n.region] || [];
    byRegion[n.region].push(n);
  });

  const regions = Object.keys(byRegion);
  if (regions.length === 0){
    grid.innerHTML = `<p style="color:var(--ink-soft);font-size:14px;">No routes yet — match donor stock to a need on the dashboard to generate a delivery run.</p>`;
    return;
  }

  grid.innerHTML = regions.map(region => {
    const stops = byRegion[region];
    const items = stops.map(n => `<li><span>${n.name}</span><span>${n.matchedQty} packs</span></li>`).join('');
    return `
      <div class="panel route-card" data-region="${region}">
        <h4>${region} run · ${stops.length} stop${stops.length > 1 ? 's' : ''}</h4>
        <ul>${items}</ul>
        <button class="confirm-btn" onclick="confirmDelivery('${region}')">Confirm delivered</button>
      </div>`;
  }).join('');
}

function renderAll(){
  renderNeedList();
  renderMap();
  renderRoutes();
}

/* ============================================================
   EVENT HANDLERS — wired only if the relevant elements exist,
   so this one file can be shared by every page.
   ============================================================ */

['stockout','weeks','population'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', renderPreview);
});

const needForm = document.getElementById('needForm');
if (needForm){
  needForm.addEventListener('submit', function(e){
    e.preventDefault();
    const newNeed = {
      id: nextNeedId++,
      name: document.getElementById('name').value,
      region: document.getElementById('region').value,
      population: Number(document.getElementById('population').value),
      weeks: Number(document.getElementById('weeks').value),
      stockout: document.getElementById('stockout').value,
      x: Math.round(20 + Math.random() * 60),
      y: Math.round(20 + Math.random() * 60),
      matchedQty: 0,
      delivered: false,
    };
    needs.push(newNeed);
    saveState();
    this.reset();
    renderPreview();
    const confirmEl = document.getElementById('reportConfirm');
    if (confirmEl){
      confirmEl.textContent = `Thanks — ${newNeed.name} has been added to the priority queue.`;
      confirmEl.style.display = 'block';
    }
  });
}

const matchBtn = document.getElementById('matchBtn');
if (matchBtn){
  matchBtn.addEventListener('click', function(){
    const name = document.getElementById('donorName').value || 'Anonymous donor';
    const qty = Number(document.getElementById('donorQty').value);
    if (!qty || qty <= 0) return;

    donorPool.push({ name, qty });
    const log = runAutoMatch();
    saveState();

    const logBox = document.getElementById('matchLog');
    const header = `<div><strong>${name}</strong> added ${qty} packs to the pool.</div>`;
    logBox.innerHTML = header + (log.length ? log.map(l => `<div>→ ${l}</div>`).join('') : '<div>No outstanding need to match right now.</div>');

    document.getElementById('donorName').value = '';
    document.getElementById('donorQty').value = '';
    renderAll();
  });
}

function confirmDelivery(region){
  needs.forEach(n => { if (n.region === region && n.matchedQty > 0) n.delivered = true; });
  saveState();
  renderAll();
}

/* ============================================================
   INITIAL RENDER
   ============================================================ */
renderPreview();
renderAll();






