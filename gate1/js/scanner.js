import { Mailer } from "../../mailer.js";
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

const SCAN_COOLDOWN = 2000;
const formatTime = () => {
  const date = new Date();
  const parts = date.toString().split(" ")
  const formattedDate = `Timestamp => Day: ${parts[0]} | Date: ${parts[1]} / ${parts[2]} / ${parts[3]} | Time: ${date.toLocaleTimeString()}`
  return formattedDate
}

let isCooldown = false;

async function onScanSuccess(decodedText) {
  if (isCooldown) {
    return;
  }

  isCooldown = true;
  setTimeout(() => {
    isCooldown = false;
  }, SCAN_COOLDOWN);

  logEl.textContent += "Scanned: " + decodedText + "\n";
  // setTimeout(() => logEl.textContent = "", 3000);

  let [id, studentName, classSection] = decodedText.split(" - ");
  const entry = `${id}|${studentName}|${classSection}`;

  const callsRef = db.ref("calls");
  const logRef = db.ref("log");

  await Promise.all([
    callsRef.push(entry),
    logRef.push(entry)
  ]);

  console.log(entry);
  mailer(id, studentName, classSection);
}

const html5QrCode = new Html5Qrcode("reader");

Html5Qrcode.getCameras().then(cameras => {
  if (!cameras || !cameras.length) {
    console.error("No cameras found");
    return;
  }

  const select = document.getElementById("cameraSelect");

  cameras.forEach(cam => {
    const option = document.createElement("option");
    option.value = cam.id;
    option.text = cam.label || `Camera ${cam.id}`;
    select.appendChild(option);
  });

  // Start scanning with the first camera
  html5QrCode.start(
    cameras[0].id,
    { fps: 10, qrbox: 250 },
    onScanSuccess
  );

  select.onchange = () => {
    html5QrCode.stop().then(() => {
      html5QrCode.start(
        select.value,
        { fps: 10, qrbox: 250 },
        onScanSuccess
      );
    }).catch(err => console.error("Failed to stop scanner:", err));
  };
}).catch(err => console.error("Failed to get cameras:", err));

async function mailer(id, studentName, classSection) {
  try {
    const mailer = new Mailer() //Do not remove this line...
    await mailer.mail(
      `${id}@iischoolabudhabi.com`,
      `${id} - ${studentName}, of ${classSection} has been called in Gate-2. This is just an alert. If this wasn't you, Kindly contact the school\n${formatTime()}\n\nBy: ot_scanner_services`,
      `⚠️${studentName} has been called ⚠️`,
    )
  } catch (err) {
    console.log("Failed to send email, error listed below: ")
    console.log(err)
  }
}
const cooldownEl = document.getElementById("Cooldown");

function watchCooldown() {
  let lastState = null;
  const cdo = document.getElementById("overlay");

  setInterval(() => {
    if (typeof isCooldown === "undefined") return;

    if (isCooldown && lastState !== true) {
      cdo.style.display = "block";
      lastState = true;
      cooldownEl.textContent = "⏳ Cooldown active...";
    } else if (!isCooldown && lastState !== false) {
      cdo.style.display = "none";
      lastState = false;
      cooldownEl.textContent = "";
    }
  }, 100);
}

watchCooldown();
