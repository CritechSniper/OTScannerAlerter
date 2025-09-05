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

let btn = document.getElementById("btn");

function gate(name) {
  const inp = document.getElementById("inp");
  inp.innerHTML = `<label for="pinInput"> ${name} </label>`;
}