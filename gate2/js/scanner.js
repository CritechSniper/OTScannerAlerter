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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const logEl = document.getElementById("log");

let lastScanTime = 0;
const SCAN_COOLDOWN = 5000;
const formatTime = ()=>{
  const date = new Date();
  const parts = date.toString().split(" ")
  const formattedDate = `Timestamp => Day: ${parts[0]} | Date: ${parts[1]} / ${parts[2]} / ${parts[3]} | Time: ${date.toLocaleTimeString()}`
  return formattedDate
}
async function onScanSuccess(decodedText) {
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
  await sm(
      `${parts[0]}@iischoolabudhabi.com`, 
      `Your child, ${studentName}, of ${classSection} has been called in Gate-2. this is just an alert. If this wasn't you, Kindly contact the school\n${formatTime()}\nBy: ot_scanner_services`, 
      `⚠️${studentName} has been called ⚠️`, 
      false
    )

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

