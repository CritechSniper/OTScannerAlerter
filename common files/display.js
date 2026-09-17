import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getDatabase,
  ref,
  onChildAdded,
  onChildChanged,
  remove,
  query,
  limitToFirst,
  get,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const callsRef = ref(db, "calls");

let selectedVoice = null;
function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  selectedVoice =
    voices.find(
      (v) =>
        v.name.includes("Google US English") ||
        v.name.includes("Google UK English Male"),
    ) ||
    voices.find((v) => v.name.includes("Google") && v.name.includes("Male")) ||
    voices.find(
      (v) =>
        v.name.includes("David") ||
        v.name.includes("Mark") ||
        v.name.includes("George"),
    ) ||
    voices.find((v) => v.name.includes("Male")) ||
    voices[0];
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = pickVoice;
}
pickVoice();

const PUSH_CHARS =
  "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

function pushIdToTime(pushId) {
  if (!pushId || pushId.length < 8) return null;
  let timestamp = 0;
  for (let i = 0; i < 8; i++) {
    const char = pushId.charAt(i);
    const idx = PUSH_CHARS.indexOf(char);
    if (idx === -1) return null;
    timestamp = timestamp * 64 + idx;
  }
  return timestamp;
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

// Speech Queue State Management
const speechQueue = [];
let isSpeaking = false;

function processSpeechQueue() {
  if (isSpeaking || speechQueue.length === 0) return;

  isSpeaking = true;
  const textToSpeak = speechQueue.shift();
  const utterance = new SpeechSynthesisUtterance(textToSpeak);

  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.rate = 1.0;

  utterance.onend = () => {
    isSpeaking = false;
    processSpeechQueue(); // Speak next item in queue
  };

  utterance.onerror = (e) => {
    console.error("Speech error:", e);
    isSpeaking = false;
    processSpeechQueue(); // Skip and move to next on error
  };

  speechSynthesis.speak(utterance);
}

function queueSpeech(text) {
  speechQueue.push(text);
  processSpeechQueue();
}

function displayAnnouncement(entry, key, shouldSpeak = true) {
  const [id, studentName, classSection, status = "0"] = entry.split("|");

  if (shouldSpeak) {
    const textToSpeak = `${studentName}, ${classSection}.......${studentName}, ${classSection}.`;
    queueSpeech(textToSpeak);
  }

  const ms = pushIdToTime(key);
  const calledAt = ms ? formatTimestamp(ms) : "";
  const container = document.getElementById("calls");

  if (container) {
    const existingCard = document.getElementById(`card-${key}`);
    const isReceived = status === "1";

    // If card exists (e.g. state changed via Firebase update), update card in-place
    if (existingCard) {
      const dot = existingCard.querySelector(".status-dot");
      const btn = existingCard.querySelector(".confirm-btn");
      if (dot)
        dot.className = `status-dot ${isReceived ? "status-green" : "status-red"}`;
      if (btn) {
        btn.className = `confirm-btn ${isReceived ? "btn-reset" : "btn-depart"}`;
        btn.textContent = isReceived ? "Mark as Waiting" : "Confirm Departure";
        btn.setAttribute(
          "onclick",
          `window.confirmDeparture('${key}', '${entry}')`,
        );
      }
      return;
    }

    // Insert new card
    container.insertAdjacentHTML(
      "afterbegin",
      `
        <div id="card-${key}" class="student-card" onclick="window.toggleCardDrawer('${key}')">
          <span class="status-dot ${isReceived ? "status-green" : "status-red"}"></span>
          <h2 class="font-ibmplex">${id} <span id="dot">•</span> ${studentName} <span id="dot">•</span> ${classSection}</h2>
          <p class="font-sharetech">Called at: ${calledAt}</p>
          
          <div id="drawer-${key}" class="action-drawer" style="display: none;" onclick="event.stopPropagation()">
            <button 
              class="confirm-btn ${isReceived ? "btn-reset" : "btn-depart"}" 
              onclick="window.confirmDeparture('${key}', '${entry}')">
              ${isReceived ? "Mark as Waiting" : "Confirm Departure"}
            </button>
          </div>
        </div>
      `,
    );
  }
}

// Global scope attachments for ES Module accessibility
window.toggleCardDrawer = function (key) {
  const drawer = document.getElementById(`drawer-${key}`);
  if (drawer) {
    const isHidden = drawer.style.display === "none";
    document
      .querySelectorAll(".action-drawer")
      .forEach((d) => (d.style.display = "none"));
    drawer.style.display = isHidden ? "block" : "none";
  }
};

window.confirmDeparture = function (key, currentEntry) {
  const parts = currentEntry.split("|");
  const currentStatus = parts[3] || "0";
  const newStatus = currentStatus === "1" ? "0" : "1";

  const updatedEntry = `${parts[0]}|${parts[1]}|${parts[2]}|${newStatus}`;

  // Update both nodes in a single atomic write
  const updates = {};
  updates[`calls/${key}`] = updatedEntry;
  updates[`log/${key}`] = updatedEntry;

  update(ref(db), updates);
};

let pageStartTime = Date.now();
let isInitialLoadFinished = false;

get(callsRef).then(() => {
  isInitialLoadFinished = true;
});

// Listener for NEW calls
onChildAdded(callsRef, (snapshot) => {
  const entry = snapshot.val();
  const key = snapshot.key;

  if (typeof entry === "string" && entry.includes("|")) {
    const createdMs = pushIdToTime(key);
    const isNew =
      isInitialLoadFinished || (createdMs && createdMs > pageStartTime);
    displayAnnouncement(entry, key, isNew);
  }
  cleanupOldCalls();
});

// Listener for STATUS UPDATES across screens (without re-speaking)
onChildChanged(callsRef, (snapshot) => {
  const entry = snapshot.val();
  const key = snapshot.key;
  if (typeof entry === "string" && entry.includes("|")) {
    displayAnnouncement(entry, key, false);
  }
});

async function cleanupOldCalls() {
  const q = query(callsRef, limitToFirst(21));
  const snap = await get(q);
  if (snap.exists()) {
    const entries = [];
    snap.forEach((child) => {
      entries.push({ key: child.key, val: child.val() });
    });
    if (entries.length > 20) {
      const oldest = entries[0];
      await remove(ref(db, `calls/${oldest.key}`));
    }
  }
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  hours = hours % 12 || 12;
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

async function checkAndResetCalls() {
  const resetRef = ref(db, "lastReset");
  const currentDay = new Date().toISOString().split("T")[0];

  try {
    const snapshot = await get(resetRef);
    if (!snapshot.exists() || snapshot.val() !== currentDay) {
      await remove(ref(db, "calls"));
      await set(resetRef, currentDay);
      window.location.reload();
    }
  } catch (error) {
    console.error("Reset error:", error);
  }
}

window.clearFb = async function (path) {
  try {
    await remove(ref(db, path));
    window.location.reload();
  } catch (err) {
    console.error("Error clearing path:", path, err);
  }
};

console.log("clearFb()");
checkAndResetCalls();
setInterval(updateClock, 1000);
