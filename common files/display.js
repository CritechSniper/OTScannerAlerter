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

function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const todayKey = getTodayKey();
const callsRef = ref(db, `calls/${todayKey}`);

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
    processSpeechQueue();
  };

  utterance.onerror = (e) => {
    console.error("Speech error:", e);
    isSpeaking = false;
    processSpeechQueue();
  };

  speechSynthesis.speak(utterance);
}

function queueSpeech(text) {
  speechQueue.push(text);
  processSpeechQueue();
}

function displayAnnouncement(data, key, shouldSpeak = true) {
  if (!data) return;

  const id = data.id || "";
  const studentName = data.name || "";
  const classSection = data.classSection || "";
  const status = Number(data.status) || 0;
  const timestamp = data.timestamp || Date.now();

  if (shouldSpeak) {
    const textToSpeak = `${studentName}, ${classSection}.......${studentName}, ${classSection}.`;
    queueSpeech(textToSpeak);
  }

  const calledAt = formatTimestamp(timestamp);
  const container = document.getElementById("calls");

  if (container) {
    const existingCard = document.getElementById(`card-${key}`);
    const isReceived = status === 1;

    // Update existing card on state change
    if (existingCard) {
      const dot = existingCard.querySelector(".status-dot");
      const btn = existingCard.querySelector(".confirm-btn");
      if (dot)
        dot.className = `status-dot ${isReceived ? "status-green" : "status-red"}`;
      if (btn) {
        btn.className = `confirm-btn ${isReceived ? "btn-reset" : "btn-depart"}`;
        btn.textContent = isReceived ? "Mark as Waiting" : "Confirm Departure";
        btn.onclick = () => window.confirmDeparture(key, status);
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
              onclick="window.confirmDeparture('${key}', ${status})">
              ${isReceived ? "Mark as Waiting" : "Confirm Departure"}
            </button>
          </div>
        </div>
      `,
    );
  }
}

// Global scope attachments for DOM handlers
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

window.confirmDeparture = function (key, currentStatus) {
  const newStatus = Number(currentStatus) === 1 ? 0 : 1;

  // Targeted status update in both active calls and logs
  const updates = {};
  updates[`calls/${todayKey}/${key}/status`] = newStatus;
  updates[`log/${todayKey}/${key}/status`] = newStatus;

  update(ref(db), updates);
};

let pageStartTime = Date.now();
let isInitialLoadFinished = false;

get(callsRef).then(() => {
  isInitialLoadFinished = true;
});

// Listener for NEW calls today
onChildAdded(callsRef, (snapshot) => {
  const data = snapshot.val();
  const key = snapshot.key;

  if (data && typeof data === "object") {
    const isNew =
      isInitialLoadFinished || (data.timestamp && data.timestamp > pageStartTime);
    displayAnnouncement(data, key, isNew);
  }
  cleanupOldCalls();
});

// Listener for STATUS UPDATES across screens
onChildChanged(callsRef, (snapshot) => {
  const data = snapshot.val();
  const key = snapshot.key;
  if (data && typeof data === "object") {
    displayAnnouncement(data, key, false);
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
      await remove(ref(db, `calls/${todayKey}/${oldest.key}`));
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

// Auto-cleanup: Removes old dates under /calls while preserving /log
async function checkAndResetCalls() {
  try {
    const allCallsSnap = await get(ref(db, "calls"));
    if (allCallsSnap.exists()) {
      const callsData = allCallsSnap.val();
      for (const dateFolder in callsData) {
        if (dateFolder !== todayKey) {
          // Delete old daily active calls
          await remove(ref(db, `calls/${dateFolder}`));
        }
      }
    }
  } catch (error) {
    console.error("Date cleanup error:", error);
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

checkAndResetCalls();
setInterval(updateClock, 1000);