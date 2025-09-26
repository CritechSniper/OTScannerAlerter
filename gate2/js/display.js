import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onChildAdded, remove, query, limitToFirst, get, set }
  from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const callsRef = ref(db, "calls");

let selectedVoice = null;
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  const preferred = [
    "Microsoft Aria Online (Natural) - English (United States)",
    "Microsoft Guy Online (Natural) - English (United States)",
    "Microsoft Libby Online (Natural) - English (United Kingdom)",
    "Microsoft Hayley Online - English (Australia)"
  ];
  selectedVoice = voices.find(v => preferred.includes(v.name)) || voices[0];
  console.log("Using voice:", selectedVoice?.name || "Default browser voice");
}
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = pickVoice;
}
pickVoice();

function speakAnnouncement(entry) {
  const [studentName, classSection, ts] = entry.split("|");
  const calledAt = ts ? new Date(parseInt(ts)).toLocaleTimeString() : "";

  const msg = new SpeechSynthesisUtterance(
    `${studentName} from class ${classSection}..... ${studentName} from class ${classSection}..... ${studentName} from class ${classSection}`
  );
  if (selectedVoice) msg.voice = selectedVoice;
  msg.rate = 0.95;
  speechSynthesis.speak(msg);
  // speechSynthesis.speak(msg);

  const container = document.getElementById("calls");
  if (container) {
    container.insertAdjacentHTML('afterbegin', `
      <div style="font-family:Tahoma; text-align:center; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding: 5px;">
        <h2 class="font-ibmplex">${studentName} - Class ${classSection}</h2>
        <p class="font-sharetech">Called at: ${calledAt}</p>
      </div>
    `);
  }
}

onChildAdded(callsRef, (snapshot) => {
	const entry = snapshot.val();
	if (typeof entry === "string" && entry.includes("|")) {
	speakAnnouncement(entry);
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
      remove(ref(db, `calls/${oldest.key}`));
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
  document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
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
    }
  } catch (error) {
    console.error("Reset error:", error);
  }
}

window.clearFb = async function(path) {
	try {
		const dbRef = ref(db, path);  // path can be "calls", "log", "lastReset", or "" for root
		await remove(dbRef);
		console.log(`✅ Cleared path: "${path || "ROOT"}"`);
	} catch (err) {
		console.error("❌ Error clearing path:", path, err);
	}
};

// clearFb("calls")
// clearFb("log")
// clearFb("lastReset")
// clearFb("")   // DANGER: wipes entire database

checkAndResetCalls();
setInterval(updateClock, 1000);