const params = new URLSearchParams(window.location.search);
const gate = params.get("accessReq");

if (gate) {
  console.log("Access needed for:", gate);
  if (gate == "gate1") {
    gate1();
  }
  if (gate == "gate2") {
    gate2();
  }
}

let btn = document.getElementById("btn");

function gate1() {
  const inp = document.getElementById("inp");
  inp.innerHTML = `<label for="pinInput">Gate 1 </label>`;
}
function gate2() {
  const inp = document.getElementById("inp");
  inp.innerHTML = `<label for="pinInput">Gate 2 </label>`;
}