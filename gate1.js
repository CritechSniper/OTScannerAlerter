let admin = false;
let typed = "";

document.addEventListener('keydown', function(e) {
    if (e.key.length === 1) {
        typed += e.key;
        if (typed.toLowerCase().includes("admin")) {
            admin = true;
            alert("Admin mode enabled");
        }
    }
    
    if (!admin) {
        if (e.key === "F12") {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J
        if ((e.ctrlKey && e.shiftKey) && 
            (e.key === "I" || e.key === "C" || e.key === "J")) {
            e.preventDefault();
            window.location.href = localStorage.getItem("lastPage")
            return false;
        }
    }
});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());

document.addEventListener('keydown', event => {
  if ( event.key.toLowerCase() === "h") {
    const logo = document.getElementById('Logo')
    logo.style.display = (logo.style.display === "none") ? "block" : "none";
  }
})

if (!window.location.href.includes("login.html")) {
  localStorage.setItem("lastPage", window.location.href);
}
// Save last visited page (skip if it's login page)
if (!window.location.href.includes("login.html")) {
  localStorage.setItem("lastPage", window.location.href);
}
// if (localStorage.getItem("accessG", true)) {}
// else {
//   window.location.href = "login.html";
// }
if (localStorage.getItem("accessGt", true)) {}
else {
  const gate = "gate1";
  window.location.href = `login.html?accessReq=${gate}`;
}