const granted = sessionStorage.getItem("access") === "accessgranted24h";
const grantedTime = sessionStorage.getItem("accessTime");
const now = Date.now();

const twentyFourHours = 24 * 60 * 60 * 1000;

if (!granted || !grantedTime || now - grantedTime > twentyFourHours) {
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("accessTime");
  window.location.href = "../login.html"; 
}
