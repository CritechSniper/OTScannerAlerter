const params = new URLSearchParams(window.location.search);
const gate = params.get("accessReq");

if (gate) {
  console.log("Access needed for:", gate);
  if (gate == "gate1") {
    gate("Gate 1")
  }
  if (gate == "gate2") {
    gate("Gate 2")
  
  }
}

let btn = document.getElementById("btn");

function gate(name) {
  const inp = document.getElementById("inp");
  inp.innerHTML = `<label for="pinInput"> ${name} </label>`;
}