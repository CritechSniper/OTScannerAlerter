const params = new URLSearchParams(window.location.search);
const gateAccess = params.get("accessReq");

if (gateAccess) {
  console.log("Access needed for:", gateAccess);
  if (gateAccess == "gate1") {
    gate("Gate 1")
  }
  if (gateAccess == "gate2") {
    gate("Gate 2")
  }
}


function gate(name) {
  let btn = document.getElementById("btn");
  const inp = document.getElementById("inp");
  inp.innerHTML = `<label for="pinInput"> ${name} </label>`;
  btn.innerHTML = `<button id="loginBtn" onclick="conPinG(document.getElementById('pinInput').value)">Login</button>`;
}
(async function () {
  // Load CryptoJS if not already present
  if (typeof CryptoJS === "undefined") {
    await new Promise(resolve => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }

  // Define the conPinG function
  function conPinG(pin) {
    const inputHash = CryptoJS.SHA256(pin).toString();

    const gateHashes = {
      gate1: "99cb706a222bf586be1857fcbe2392cd5f14cd567ff8c01ebe447cb063ffa746",
      gate2: "b0e4fb6728114e6256a6a7e80ffb5df454d8bff173c1699bf270e5b986285aab"
    };

    const expectedHash = gateHashes[gateAccess];

    if (inputHash === expectedHash) {
      localStorage.setItem("accessGt", gateAccess); // Store which gate was accessed
      console.log("✅ Access granted to", gateAccess);
      window.location.href = localStorage.getItem("lastPage")
    } else {
      console.warn("❌ Incorrect PIN for", gateAccess);
    }
  }

  // Expose globally
  window.conPinG = conPinG;
})();