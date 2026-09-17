import { Mailer } from "../../mailer.js";

// --- Firebase Initialization ---
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- Configuration & Constants ---
const SCAN_COOLDOWN_SEC = 5; // Standardized cooldown time in seconds
const SCAN_COOLDOWN_MS = SCAN_COOLDOWN_SEC * 1000;

// --- State Variables ---
let isCooldown = false;
let scanCooldownTimer = null;

// --- DOM Elements ---
const logEl = document.getElementById("log");
const scannedPersonEl = document.getElementById("scannedPerson");
const overlayEl = document.getElementById("overlay");
const countdownEl = document.getElementById("scanCountdown");

// --- Helper Functions ---
const formatTime = () => {
  const date = new Date();
  const parts = date.toString().split(" ");
  return `Timestamp => Day: ${parts[0]} | Date: ${parts[1]} / ${parts[2]} / ${parts[3]} | Time: ${date.toLocaleTimeString()}`;
};

function toggleOverlay(visible) {
  if (overlayEl) {
    overlayEl.style.display = visible ? "block" : "none";
  }
}

function triggerScanCooldown(durationSeconds) {
  if (!countdownEl) return;

  if (scanCooldownTimer) {
    clearInterval(scanCooldownTimer);
  }

  let timeLeft = durationSeconds;
  countdownEl.textContent = `Next scan available in ${timeLeft}s`;
  countdownEl.style.color = "orange";

  scanCooldownTimer = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      countdownEl.textContent = `Next scan available in ${timeLeft}s`;
    } else {
      clearInterval(scanCooldownTimer);
      scanCooldownTimer = null;
      countdownEl.textContent = "Ready to scan";
      countdownEl.style.color = "green";
    }
  }, 1000);
}

function tagUnderLoader(id, studentName, classSection) {
  if (scannedPersonEl) {
    scannedPersonEl.textContent = `${id} ${studentName} ${classSection}`;
  }
}

// --- Main Scan Callback ---
async function onScanSuccess(decodedText) {
  if (isCooldown) return;

  // Activate Cooldown & UI updates
  isCooldown = true;
  toggleOverlay(true);
  triggerScanCooldown(SCAN_COOLDOWN_SEC);

  setTimeout(() => {
    isCooldown = false;
    toggleOverlay(false);
  }, SCAN_COOLDOWN_MS);

  // Parse QR String Format: "ID - Name - Grade Class - Teacher"
  let [id = "", studentName = "", rawClassSection = ""] =
    decodedText.split(" - ");

  id = id.trim();
  studentName = studentName.trim();
  const classSection = rawClassSection.replace(/^Grade\s+/i, "").trim();

  // Database Format: "0000|Waleed|10 A"
  const entry = `${id}|${studentName}|${classSection}`;

  try {
    const callsRef = db.ref("calls");
    const newKey = callsRef.push().key;

    const updates = {};
    updates[`calls/${newKey}`] = entry;
    updates[`log/${newKey}`] = entry;

    await db.ref().update(updates);

    // Update UI Log
    if (logEl) {
      const logged = document.createElement("div");
      logged.textContent = `${id} • ${studentName} • ${classSection}`;
      logEl.insertBefore(logged, logEl.firstChild);
    }

    tagUnderLoader(id, studentName, classSection);
    mailer(id, studentName, classSection);
  } catch (error) {
    console.error("Failed to update database record:", error);
  }
}

// --- Email Dispatcher ---
async function mailer(id, studentName, classSection) {
  try {
    const mailerInstance = new Mailer();
    const emailHtml = `
      <div style="max-width: 500px; margin: 30px auto; padding: 24px; font-family: Arial, sans-serif; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center; color: #333333;">
        <div style="display: inline-block; background-color: #f4f6f8; color: #2c3e50; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px;">
          Gate Alert
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: #222222;">
          <strong>${id} - ${studentName}</strong>, of <strong>${classSection}</strong> has been called.
        </p>
        <p style="font-size: 14px; color: #666666; margin: 0 0 20px 0; line-height: 1.4;">
          This is just an alert. If this wasn't you, kindly contact the school.
        </p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888888; margin: 0 0 4px 0;">
          ${formatTime()}
        </p>
        <p style="font-size: 11px; color: #aaaaaa; margin: 8px 0 0 0;">
          By: ot_scanner_services
        </p>
      </div>`;

    await mailerInstance.mail(
      `${id}@iischoolabudhabi.com`,
      emailHtml,
      `⚠️${studentName} has been called ⚠️`,
    );
  } catch (error) {
    console.error("Failed to send mail:", error);
  }
}

// --- Scanner Initialization & Camera Selection ---
const html5QrCode = new Html5Qrcode("reader");

async function initScanner() {
  try {
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras || !cameras.length) {
      console.error("No cameras found");
      return;
    }

    const select = document.getElementById("cameraSelect");
    if (select) {
      select.innerHTML = "";
      cameras.forEach((cam) => {
        const option = document.createElement("option");
        option.value = cam.id;
        option.text = cam.label || `Camera ${cam.id}`;
        select.appendChild(option);
      });

      select.onchange = async () => {
        try {
          await html5QrCode.stop();
          await html5QrCode.start(
            select.value,
            { fps: 20, qrbox: 250 },
            onScanSuccess,
          );
        } catch (err) {
          console.error("Failed to switch camera:", err);
        }
      };
    }

    await html5QrCode.start(
      cameras[0].id,
      { fps: 20, qrbox: 250 },
      onScanSuccess,
    );
  } catch (err) {
    console.error("Failed to initialize camera scanner:", err);
  }
}

// Start Scanner
initScanner();
