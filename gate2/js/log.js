// -------------------------
// log viewer JS (module)
// -------------------------
// Put this inside a <script type="module">...</script> on log.html
// or save as a .js file and import as module.
// Replace firebaseConfig with your project's config.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  query,
  orderByKey,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

/* ===== YOUR FIREBASE CONFIG - replace these ===== */
const firebaseConfig = {
  apiKey: "AIzaSyD1wwoZmmhWtauyOGCBhOgL_on5ulZsg-4",
  authDomain: "bruv-8068d.firebaseapp.com",
  databaseURL: "https://bruv-8068d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bruv-8068d",
  storageBucket: "bruv-8068d.firebasestorage.app",
  messagingSenderId: "696985591809",
  appId: "1:696985591809:web:e1cc535570213f20ff6000",
  measurementId: "G-7J650R6255"
};
/* ================================================ */

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// query logs ordered by push-key (which preserves time order)
const logRef = query(ref(db, "log"), orderByKey());

const listEl = document.getElementById("logList");
if (!listEl) {
  console.error("No #logList element found. Add <ul id=\"logList\"></ul> to the page.");
}

/**
 * Decode Firebase push ID's timestamp.
 * Firebase push IDs encode a 64-bit-ish timestamp in the first 8 characters.
 * This function converts those first 8 chars into milliseconds since epoch.
 * Reference alphabet used by Firebase push ids:
 */
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
  // timestamp now in milliseconds
  return timestamp;
}

function formatTimestamp(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  // e.g. "6 Sep 2025 — 17:23"
  const day = d.getDate();
  const month = d.toLocaleString(undefined, { month: "short" });
  const year = d.getFullYear();
  let hours = d.getHours();
  let mins = d.getMinutes();
  if (hours < 10) hours = "0" + hours;
  if (mins < 10) mins = "0" + mins;
  return `${day} ${month} ${year} • ${hours}:${mins}`;
}

/**
 * Render the snapshot children into the list.
 * We keep oldest → newest order as returned by orderByKey().
 */
onValue(logRef, (snapshot) => {
  if (!listEl) return;
  listEl.innerHTML = ""; // clear

  // if no logs
  if (!snapshot.exists()) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No logs yet.";
    listEl.appendChild(empty);
    return;
  }

  snapshot.forEach(childSnap => {
    const raw = childSnap.val();           // e.g. "Waleed Ammar|Grade 9 A"
    const key = childSnap.key || "";      // push id

    const li = document.createElement("li");

    const textDiv = document.createElement("div");
    textDiv.className = "entry-text";

    // Parse stored value. We expect "Name|Grade ..." but handle fallbacks.
    let name = raw;
    let grade = "";
    if (typeof raw === "string" && raw.includes("|")) {
      const parts = raw.split("|");
      name = parts[0].trim();
      grade = (parts[1] || "").trim();
    } else if (typeof raw !== "string") {
      // if someone stored an object, try to read common fields
      if (raw && typeof raw === "object") {
        name = raw.name || raw.fullName || raw.student || JSON.stringify(raw);
        grade = raw.grade || raw.class || "";
      } else {
        name = String(raw);
      }
    }

    // final text: "Name - Grade" (no brackets). If no grade, show only name.
    const displayText = grade ? `${name} - ${grade}` : name;
    textDiv.textContent = displayText;

    const timeSpan = document.createElement("span");
    timeSpan.className = "entry-time";

    // Try to decode time from push key
    const ms = pushIdToTime(key);
    if (ms) {
      timeSpan.textContent = formatTimestamp(ms);
    } else {
      timeSpan.textContent = ""; // leave empty if can't decode
    }

    li.appendChild(textDiv);
    li.appendChild(timeSpan);
    listEl.appendChild(li);
  });
});
