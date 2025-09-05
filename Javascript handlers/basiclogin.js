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
let inp = document.getElementById("inp");
let btn = document.getElementById("btn");
function gate1() {
  inp.innerHTML = `<label for="pinInput">Gate 1 </label>`;
}
function gate2() {
  inp.innerHTML = `<label for="pinInput">Gate 2 </label>`;
}