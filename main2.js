// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onChildAdded, remove, query, limitToFirst, get, set }
	from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase config
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

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Reference to calls (same as scanner)
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

function speakAnnouncement(studentName, classSection, timestamp) {
	const now = new Date().toLocaleTimeString();
	const calledAt = new Date(timestamp).toLocaleTimeString();
	const msg = new SpeechSynthesisUtterance(
		`${studentName} from class ${classSection}.`
	);
	if (selectedVoice) msg.voice = selectedVoice;
	msg.rate = 0.95;
	speechSynthesis.speak(msg);

	// Update screen
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
	const data = snapshot.val();
	if (data && data.studentName && data.classSection && data.timestamp) {
		speakAnnouncement(data.studentName, data.classSection, data.timestamp);
	}
	cleanupOldCalls();
});

async function cleanupOldCalls() {
	const q = query(callsRef, limitToFirst(21));
	const snap = await get(q);
	if (snap.exists()) {
		const entries = [];
		snap.forEach(child => {
			entries.push({ key: child.key, ...child.val() });
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

  // const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert '0' to '12'
  const formattedHours = String(hours).padStart(2, '0');

  document.getElementById('clock').textContent = `${formattedHours}:${minutes}:${seconds} `; //${ampm} add after seconds
}

function getDayIdentifier() {
  const now = new Date();
  const day = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
  return `lastReset:${day}`;
}

async function checkAndResetDatabase() {
  const db = getDatabase();
  const resetRef = ref(db, 'lastReset'); // No path nesting, just a root-level string

  try {
    const snapshot = await get(resetRef);
    const currentDayString = getDayIdentifier();

    if (!snapshot.exists() || snapshot.val() !== currentDayString) {
      // Day has changed — clear database
      const rootRef = ref(db);
      await remove(rootRef); // Clears everything

      // Set new reset marker
      await set(resetRef, currentDayString);
      console.log("New Day", currentDayString);
    } else {
      console.log("Same day");
    }
  } catch (error) {
    console.error("Error checking or resetting database:", error);
  }
}
checkAndResetDatabase();
setInterval(updateClock, 1000);