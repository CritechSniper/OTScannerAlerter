import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onChildAdded, remove, query, limitToFirst, get, set } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const callsRef = ref(db, "calls");

let selectedVoice = null;
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  
  // Prioritize stable male/system voices first to eliminate cloud streaming buffering
  selectedVoice = voices.find(v => 
    v.name.includes("Mark") ||
    v.name.includes("George") ||
    // v.name.includes("David") ||
    (v.name.includes("Male") && !v.name.includes("Online"))
  ) || voices.find(v => v.name.includes("Microsoft Guy Online")) || voices[0];

  console.log("Using voice:", selectedVoice?.name || "Default browser voice");
}
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = pickVoice;
}
pickVoice();

const PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

function pushIdToTime(pushId) {
  if (!pushId || pushId.length < 8) return null;
  let timestamp = 0;
  for (let i = 0; i < 8; i++) {
    const c = pushId.charAt(i);
    const idx = PUSH_CHARS.indexOf(c);
    if (idx === -1) return null;
    timestamp = timestamp * 64 + idx;
  }
  return timestamp; // ms
}

function formatTimestamp(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

let currentUtterance = null;

function displayAnnouncement(entry, key, shouldSpeak = true) {
  const [id, studentName, classSection] = entry.split("|");

  if (shouldSpeak) {
    speechSynthesis.cancel(); // Clear pending audio
    const textToSpeak = `${studentName}, ${classSection}.......${studentName}, ${classSection}.`;
    currentUtterance = new SpeechSynthesisUtterance(textToSpeak);

    if (selectedVoice) {
      currentUtterance.voice = selectedVoice;
    }
    
    currentUtterance.rate = 0.70;

    currentUtterance.onend = () => {
      currentUtterance = null;
    };

    speechSynthesis.speak(currentUtterance);
  }

  const ms = pushIdToTime(key);
  const calledAt = ms ? formatTimestamp(ms) : "";

  const container = document.getElementById("calls");
  if (container) {
    container.insertAdjacentHTML('afterbegin', `
      <div style="font-family:Tahoma; text-align:center; margin-bottom: 10px; border-bottom: 1px solid #ccc;">
        <h2 class="font-ibmplex">${id} - ${studentName} - Class ${classSection}</h2>
        <p class="font-sharetech">Called at: ${calledAt}</p>
      </div>
    `);
  }
}

// Track initial load state using page open timestamp
let pageStartTime = Date.now();
let isInitialLoadFinished = false;

// Check existing data once on startup
get(callsRef).then(() => {
  isInitialLoadFinished = true;
});

onChildAdded(callsRef, (snapshot) => {
  const entry = snapshot.val();
  const key = snapshot.key;

  if (typeof entry === "string" && entry.includes("|")) {
    const createdMs = pushIdToTime(key);
    
    // Only speak if initial database snapshot has loaded AND item was created after page load
    const isNew = isInitialLoadFinished || (createdMs && createdMs > pageStartTime);

    displayAnnouncement(entry, key, isNew);
  }
  cleanupOldCalls();
});

async function cleanupOldCalls() {
  const q = query(callsRef, limitToFirst(21));
  const snap = await get(q);
  if (snap.exists()) {
    const entries = [];
    snap.forEach(child => {
      entries.push({ key: child.key, val: child.val() });
    });
    if (entries.length > 20) {
      const oldest = entries[0];
      await remove(ref(db, `calls/${oldest.key}`));
      console.log("Deleted oldest call:", oldest);
    }
  }
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  hours = hours % 12 || 12; 
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

async function checkAndResetCalls() {
  const resetRef = ref(db, 'lastReset');
  const currentDay = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    const snapshot = await get(resetRef);
    if (!snapshot.exists() || snapshot.val() !== currentDay) {
      // Clear only /calls
      await remove(ref(db, 'calls'));
      await set(resetRef, currentDay);
      console.log("New day, cleared calls");
      window.location.reload();
    }
  } catch (error) {
    console.error("Reset error:", error);
  }
}

window.clearFb = async function(path) {
  try {
    const dbRef = ref(db, path);
    await remove(dbRef);
    console.log(`Cleared path: "${path || "ROOT"}"`);
    window.location.reload();
  } catch (err) {
    console.error("Error clearing path:", path, err);
  }
};

// clearFb("calls")
// clearFb("log")
// clearFb("lastReset")
// clearFb("")   // DANGER: wipes entire database

console.log("clearFb()");
checkAndResetCalls();
setInterval(updateClock, 1000);