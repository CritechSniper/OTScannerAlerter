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

let lastScanTime = 0;
const SCAN_COOLDOWN = 5000;

function onScanSuccess(decodedText) {
	startCooldown();
  const now = Date.now();
  if (now - lastScanTime < SCAN_COOLDOWN) {
    console.log("⏳ Ignored scan (cooldown active)");
    return;
  }
  lastScanTime = now;

  logEl.textContent = "Scanned: " + decodedText;
  setTimeout(() => {
    logEl.textContent = "";
  }, 3000);

  let parts = decodedText.split(" - ");
  let studentName = parts[1];
  let classSection = parts[2];

  const callsRef = db.ref("calls");
  const entry = `${studentName}|${classSection}|${Date.now()}`;
  callsRef.push(entry);

  const logRef = db.ref("log");
  const logEntry = `${studentName}|${classSection}`;
  logRef.push(logEntry);

  console.log("📌 Saved:", entry, " & logged:", logEntry);
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

Html5Qrcode.getCameras().then(cameras => {
  const select = document.getElementById("cameraSelect");
  cameras.forEach(cam => {
    const option = document.createElement("option");
    option.value = cam.id;
    option.text = cam.label || `Camera ${cam.id}`;
    select.appendChild(option);
  });

  select.onchange = () => {
    html5QrCode.stop().then(() => {
      html5QrCode.start(
        select.value,
        { fps: 10, qrbox: 250 },
        onScanSuccess
      );
    });
  };

  html5QrCode.start(
    cameras[0].id,
    { fps: 10, qrbox: 250 },
    onScanSuccess
  );
});
