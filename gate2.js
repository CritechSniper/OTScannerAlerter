let admin = false;
let typed = "";

document.addEventListener('keydown', function(e) {
    if (e.key.length === 1) {
        typed += e.key;
        if (typed.toLowerCase().includes("admin")) {
            admin = true;
            setTimeout(()=>{
              console.log("%c-Admin mode enabled-", "color: white, background-color: green, border: 0px solid black, border-radius: 5px, padding: 3px")
            }, 500)
        }
    }
    
    if (!admin) {
        if (e.key === "F12") {
            e.preventDefault();
            return false;
        }
        if ((e.ctrlKey && e.shiftKey) && 
            (e.key === "I" || e.key === "C" || e.key === "J"))
            {
            e.preventDefault();
            localStorage.getItem("lastPage");
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
if (localStorage.getItem("accessGt2", true)) {}
else {
  window.location.href = '../login.html?accessReq=gate2';
}