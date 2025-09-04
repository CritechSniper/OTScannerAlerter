// // Safety features
//     document.addEventListener('keydown', function (e) {
//     // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, F12
//       if (
//         (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
//         (e.ctrlKey && e.key === 'U') ||
//         (e.key === 'F12')
//       ) {
//         e.preventDefault();
//         window.location.href = "https://www.google.com/search?q=You+have+been+blocked"
//       }
//     });
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
            window.location.href = "https://www.google.com/search?q=You+have+been+redirected";
            return false;
        }
    }
});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());