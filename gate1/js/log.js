import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  query,
  orderByKey,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
const firebaseConfig = {
	apiKey: "AIzaSyAqjFBhcYZmymEcxFf4G_9Wbk78FD2Fqm4",
	authDomain: "otscanneralerter.firebaseapp.com",
	databaseURL: "https://otscanneralerter-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "otscanneralerter",
	storageBucket: "otscanneralerter.firebasestorage.app",
	messagingSenderId: "686097644253",
	appId: "1:686097644253:web:6f722bf4e7675ba454b934",
  measurementId: "G-T13J4GN8V2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const logRef = query(ref(db, "log"), orderByKey());

const listEl = document.getElementById("logList");
if (!listEl) {
  console.error("No #logList element found. Add <ul id=\"logList\"></ul> to the page.");
}
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
    const raw = childSnap.val();           // e.g. "Waleed Ammar|Grade 9 A" \\
    const key = childSnap.key || "";      // push id                         \\

    const li = document.createElement("li");

    const textDiv = document.createElement("div");
    textDiv.className = "entry-text";

    let name = raw;
    let grade = "";
    if (typeof raw === "string" && raw.includes("|")) {
      const parts = raw.split("|");
      // id = parts[0].trim();      // studentId
      name = parts[1].trim();   // studentName
      grade = parts[2].trim();  // classSection
    } else if (raw && typeof raw === "object") {
      name = raw.name || raw.fullName || raw.student || JSON.stringify(raw);
      grade = raw.grade || raw.class || "";
    } else {
      name = String(raw);
    }

    const displayText = grade ? `${name} - ${grade}` : name;
    textDiv.textContent = displayText;

    const timeSpan = document.createElement("span");
    timeSpan.className = "entry-time";

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

function activateSearchProtocols() {
  const searchInput = document.createElement("input");
  searchInput.id = "searchBar";
  searchInput.type = "text";
  searchInput.placeholder = "Search by name or grade...(Not filtered on word 1st letter)";

  const cont = document.getElementById("cont");
  const logList = document.getElementById("logList");

  if (cont && logList) {
    cont.insertAdjacentElement("afterbegin", searchInput);

    searchInput.style.display = "block";
    searchInput.style.margin = "0 auto 10px auto"; // center + spacing below
    searchInput.style.padding = "5px 10px";
    searchInput.style.fontSize = "16px";

    searchInput.addEventListener("input", () => {
      const filter = searchInput.value.toLowerCase();
      const items = logList.querySelectorAll("li");

      items.forEach(li => {
        const text = li.querySelector(".entry-text")?.textContent.toLowerCase() || "";
        li.style.display = text.includes(filter) ? "" : "none";
      });
    });
  } else {
    console.error("Container or logList not found");
  }
}

activateSearchProtocols();
