// // Check access
// const access = localStorage.getItem("LoggedInGate1");
// const accessTime = parseInt(localStorage.getItem("AccessTime"), 10);
// const now = Date.now();
// const twentyFourHours = 24 * 60 * 60 * 1000;

// if (!access || !accessTime || now - accessTime > twentyFourHours) {
//   // no access or expired → force login
//   localStorage.removeItem("LoggedInGate1");
//   localStorage.removeItem("AccessTime");
//   window.location.href = "login.html";
// }
