import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getDatabase, get, ref } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyClGVm-i4aOwMIvo6KV_GTDRNQkBwGM7aM",
  authDomain: "mine-a375c.firebaseapp.com",
  databaseURL: "https://mine-a375c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mine-a375c",
  storageBucket: "mine-a375c.appspot.com",
  messagingSenderId: "117217183864",
  appId: "1:117217183864:web:7f4aef099993670121458d",
  measurementId: "G-CPYBHFPGPX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const handleGateLogin = async (gateKey, redirectPath, storageKey) => {
  const gateData = await get(ref(db, gateKey));
  const gateCode = gateData.exists() ? String(gateData.val()) : null;
  const pinInput = document.getElementById('pinInput').value;

  if (pinInput === gateCode) {
    localStorage.setItem(storageKey, "The user is logged in");
    window.location.href = redirectPath;
  } else {
    alert("Incorrect pin. Try again.");
  }
};

document.getElementById('loginBtn').addEventListener('click', () => {
  if (window.location.href === 'gate1/login') {
    handleGateLogin("Gate1", "./main2.html", "LoggedInGate1")
  } else if( window.location.href === 'gate2/' ) {
    handleGateLogin("Gate2", "./main2.html", "LoggedInGate2")
  } else {
    console.error("Failed to execute the code")
  }
});
