
const BOSNIAN_MONTHS = [
  "januar","februar","mart","april","maj","juni",
  "juli","august","septembar","oktobar","novembar","decembar"
];
const BOSNIAN_DAYS = ["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"];

let DATA = null;

function zonedParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DATA?.timezone || "Europe/Oslo",
    year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",second:"2-digit",
    hourCycle:"h23", weekday:"short"
  }).formatToParts(date);
  return Object.fromEntries(parts.map(p => [p.type,p.value]));
}

function dateKey(p) { return `${p.year}-${p.month}-${p.day}`; }
function mins(hm){ const [h,m]=hm.split(":").map(Number); return h*60+m; }

function relativeText(delta) {
  const past = delta < 0;
  let n = Math.abs(delta);
  if (n < 1) return "sada";
  if (n < 60) return `${past ? "prije" : "za"} ${n} ${n===1 ? "minutu" : "minuta"}`;
  const h = Math.floor(n/60), m = n%60;
  if (m === 0) return `${past ? "prije" : "za"} ${h} ${h===1 ? "sat" : h<5 ? "sata" : "sati"}`;
  return `${past ? "prije" : "za"} ${h} h ${m} min`;
}

function formatCountdown(deltaSec) {
  if (deltaSec < 0) return "—";
  const h = Math.floor(deltaSec/3600);
  const m = Math.floor((deltaSec%3600)/60);
  const s = deltaSec%60;
  return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
}

function render() {
  const p = zonedParts();
  const key = dateKey(p);
  const dayNum = Number(p.day);
  const monthNum = Number(p.month)-1;
  const jsNow = new Date();
  const weekdayIndex = new Date(`${key}T12:00:00`).getDay();

  document.getElementById("date").textContent =
    `${BOSNIAN_DAYS[weekdayIndex]}, ${dayNum}. ${BOSNIAN_MONTHS[monthNum]} ${p.year}.`;

  const nowMin = Number(p.hour)*60 + Number(p.minute);
  const nowSec = nowMin*60 + Number(p.second);
  const row = DATA.times[key];
  const notice = document.getElementById("notice");
  const grid = document.getElementById("prayers");

  document.getElementById("clock").textContent = `${p.hour}:${p.minute}:${p.second}`;

  if (!row) {
    grid.innerHTML = "";
    notice.classList.remove("hidden");
    notice.textContent = "Za ovaj datum još nije dodana vaktija. Pošalji novi raspored da ga dodamo.";
    document.getElementById("nextPrayer").textContent = "Nema podataka";
    document.getElementById("countdown").textContent = "—";
    return;
  }
  notice.classList.add("hidden");

  let nextIdx = row.findIndex(t => mins(t) >= nowMin);
  let nextPrayer = null, deltaSec = -1;

  if (nextIdx >= 0) {
    nextPrayer = DATA.prayers[nextIdx];
    deltaSec = mins(row[nextIdx])*60 - nowSec;
  } else {
    // after the final prayer, show next day's first prayer if available
    const tomorrow = new Date(`${key}T12:00:00`);
    tomorrow.setDate(tomorrow.getDate()+1);
    const tkey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,"0")}-${String(tomorrow.getDate()).padStart(2,"0")}`;
    if (DATA.times[tkey]) {
      nextPrayer = DATA.prayers[0];
      deltaSec = (24*60 + mins(DATA.times[tkey][0]) - nowMin)*60 - Number(p.second);
      nextIdx = -1;
    }
  }

  grid.innerHTML = DATA.prayers.map((name,i) => {
    const delta = mins(row[i]) - nowMin;
    const active = i === nextIdx ? " active" : "";
    return `<article class="prayer${active}">
      <div class="prayer-name">${name}</div>
      <div class="prayer-time">${row[i]}</div>
      <div class="relative">${relativeText(delta)}</div>
    </article>`;
  }).join("");

  document.getElementById("nextPrayer").textContent = nextPrayer || "Završeno za danas";
  document.getElementById("countdown").textContent = formatCountdown(deltaSec);
}

async function init() {
  try {
    const res = await fetch("timetable.json", {cache:"no-store"});
    DATA = await res.json();
    render();
    setInterval(render,1000);
  } catch (e) {
    document.getElementById("notice").classList.remove("hidden");
    document.getElementById("notice").textContent = "Nije moguće učitati vaktiju.";
  }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
}
init();
