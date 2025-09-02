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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const logEl = document.getElementById("log");

// --- Throttle control ---
let lastScanTime = 0;
const SCAN_COOLDOWN = 5000; // 5 seconds

function onScanSuccess(decodedText) {
	const now = Date.now();
	if (now - lastScanTime < SCAN_COOLDOWN) {
		console.log("⏳ Ignored scan (cooldown active)");
		return;
	}
	lastScanTime = now;

	logEl.textContent = "Scanned: " + decodedText;

	setTimeout(() => {
			logEl.textContent = ""; // Clear after 3 seconds
	}, 3000);


	let parts = decodedText.split(" - ");
	let year = parts[0];
	let studentName = parts[1];
	let classSection = parts[2];
	let classTeacher = parts[3];
	console.log(year, studentName, classSection, classTeacher);

	const callsRef = db.ref("calls");
	callsRef.push({
		studentName,
		classSection,
		classTeacher,
		timestamp: Date.now()
	});
}

const html5QrCode = new Html5Qrcode("reader");
Html5Qrcode.getCameras().then(cameras => {
	if (cameras && cameras.length) {
		html5QrCode.start(
			cameras[0].id,
			{ fps: 10, qrbox: 250 },
			onScanSuccess
		);
	}
});
function disabled() {
	const firebaseConfig = false
}