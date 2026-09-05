import { Mailer } from "../../mailer.js";

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const logEl = document.getElementById("log");

const SCAN_COOLDOWN = 2000;
const formatTime = () => {
  const date = new Date();
  const parts = date.toString().split(" ");
  const formattedDate = `Timestamp => Day: ${parts[0]} | Date: ${parts[1]} / ${parts[2]} / ${parts[3]} | Time: ${date.toLocaleTimeString()}`;
  return formattedDate;
};

let isCooldown = false;

async function onScanSuccess(decodedText) {
  if (isCooldown) {
    return;
  }

  isCooldown = true;
  setTimeout(() => {
    isCooldown = false;
  }, SCAN_COOLDOWN);

  // logEl.textContent += "Scanned: " + decodedText + "\n";
  const logged = document.createElement("div");
  logged.textContent = "Scanned: " + decodedText;
  logEl.appendChild(logged);

  let [id, studentName, classSection] = decodedText.split(" - ");
  const entry = `${id}|${studentName}|${classSection}`;

  const callsRef = db.ref("calls");
  const logRef = db.ref("log");

  await Promise.all([callsRef.push(entry), logRef.push(entry)]);

  console.log(entry);
  mailer(id, studentName, classSection);
}

const html5QrCode = new Html5Qrcode("reader");

Html5Qrcode.getCameras()
  .then((cameras) => {
    if (!cameras || !cameras.length) {
      console.error("No cameras found");
      return;
    }

    const select = document.getElementById("cameraSelect");

    cameras.forEach((cam) => {
      const option = document.createElement("option");
      option.value = cam.id;
      option.text = cam.label || `Camera ${cam.id}`;
      select.appendChild(option);
    });

    html5QrCode.start(cameras[0].id, { fps: 10, qrbox: 250 }, onScanSuccess);

    select.onchange = () => {
      html5QrCode
        .stop()
        .then(() => {
          html5QrCode.start(
            select.value,
            { fps: 10, qrbox: 250 },
            onScanSuccess,
          );
        })
        .catch((err) => console.error("Failed to stop scanner:", err));
    };
  })
  .catch((err) => console.error("Failed to get cameras:", err));

async function mailer(id, studentName, classSection) {
  try {
    const mailer = new Mailer();
    await mailer.mail(
      `${id}@iischoolabudhabi.com`,
      `<div style="max-width: 500px; margin: 30px auto; padding: 24px; font-family: Arial, sans-serif; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center; color: #333333;">
      
      <div style="display: inline-block; background-color: #f4f6f8; color: #2c3e50; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px;">
        Gate Alert
      </div>

      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: #222222;">
        <strong>${id} - ${studentName}</strong>, of <strong>${classSection}</strong> has been called.
      </p>
      
      <p style="font-size: 14px; color: #666666; margin: 0 0 20px 0; line-height: 1.4;">
        This is just an alert. If this wasn't you, Kindly contact the school
      </p>

      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />

      <p style="font-size: 12px; color: #888888; margin: 0 0 4px 0;">
        ${formatTime()}
      </p>
      
      <p style="font-size: 11px; color: #aaaaaa; margin: 8px 0 0 0;">
        By: ot_scanner_services
      </p>

    </div>`,
      `⚠️${studentName} has been called ⚠️`,
    );
  } catch (error) {
    console.error("Failed to send mail:", error);
  }
}

function watchCooldown() {
  let lastState = null;
  const cdo = document.getElementById("overlay");

  setInterval(() => {
    if (typeof isCooldown === "undefined") return;

    if (isCooldown && lastState !== true) {
      cdo.style.display = "block";
      lastState = true;
    } else if (!isCooldown && lastState !== false) {
      cdo.style.display = "none";
      lastState = false;
    }
  }, 100);
}

watchCooldown();
