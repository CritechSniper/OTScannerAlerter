import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const logRef = ref(db, "log");
const containerEl = document.getElementById("cont") || document.body;

function formatTimestamp(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  let hours = d.getHours();
  let mins = d.getMinutes();
  if (hours < 10) hours = "0" + hours;
  if (mins < 10) mins = "0" + mins;
  return `${hours}:${mins}`;
}

// Option 2: UK English format without commas (e.g., "Wed 30 Sep 2026")
function formatDateHeader(dateStr) {
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;

  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

onValue(logRef, (snapshot) => {
  let logListEl = document.getElementById("logList");

  if (!logListEl) {
    logListEl = document.createElement("div");
    logListEl.id = "logList";
    containerEl.appendChild(logListEl);
  }

  logListEl.innerHTML = "";

  if (!snapshot.exists()) {
    const empty = document.createElement("div");
    empty.className = "empty-log";
    empty.textContent = "No log records found.";
    logListEl.appendChild(empty);
    return;
  }

  const logData = snapshot.val();
  const sortedDates = Object.keys(logData).sort().reverse();

  sortedDates.forEach((dateKey) => {
    const dateEntries = logData[dateKey];
    if (!dateEntries || typeof dateEntries !== "object") return;

    const section = document.createElement("section");
    section.className = "date-accordion";
    section.dataset.date = dateKey;

    const header = document.createElement("button");
    header.className = "accordion-header";
    const formattedDate = formatDateHeader(dateKey);
    const entryCount = Object.keys(dateEntries).length;

    header.innerHTML = `
      <span class="header-title">${formattedDate}</span>
      <span class="header-meta">
        <span class="badge-count">${entryCount} ${entryCount === 1 ? "call" : "calls"}</span>
        <span class="arrow-icon">▼</span>
      </span>
    `;

    const content = document.createElement("div");
    content.className = "accordion-content";

    const ul = document.createElement("ul");
    ul.className = "entry-list";

    const sortedEntryKeys = Object.keys(dateEntries).reverse();

    sortedEntryKeys.forEach((key) => {
      const data = dateEntries[key];
      const li = document.createElement("li");
      li.className = "log-item";

      const textDiv = document.createElement("div");
      textDiv.className = "entry-text";

      let studentId = "";
      let name = "";
      let grade = "";
      let status = 0;
      let timestamp = null;

      if (data && typeof data === "object") {
        studentId = data.studentId || data.id || "";
        name = data.studentName || data.name || "Unknown";
        grade = data.classSection || data.class || "";
        status = data.status || 0;
        timestamp = data.timestamp || null;
      } else if (typeof data === "string" && data.includes("|")) {
        const parts = data.split("|");
        studentId = parts[0] ? parts[0].trim() : "";
        name = parts[1] ? parts[1].trim() : "";
        grade = parts[2] ? parts[2].trim() : "";
        status = parts[3] ? parts[3].trim() : "0";
      }

      // Highlighted ID Box
      if (studentId) {
        const idBadge = document.createElement("span");
        idBadge.className = "id-badge";
        idBadge.textContent = studentId;
        textDiv.appendChild(idBadge);
      }

      // Student Name & Grade Text Node
      const nameText = document.createTextNode(
        grade ? ` ${name} - ${grade}` : ` ${name}`
      );
      textDiv.appendChild(nameText);

      // Teacher Confirmed Badge
      if (Number(status) === 1) {
        const statusBadge = document.createElement("span");
        statusBadge.className = "status-badge";
        statusBadge.textContent = "Teacher Confirmed";
        textDiv.appendChild(statusBadge);
      }

      const timeSpan = document.createElement("span");
      timeSpan.className = "entry-time";
      timeSpan.textContent = timestamp ? formatTimestamp(timestamp) : "";

      li.appendChild(textDiv);
      li.appendChild(timeSpan);
      ul.appendChild(li);
    });

    content.appendChild(ul);
    section.appendChild(header);
    section.appendChild(content);
    logListEl.appendChild(section);

    header.addEventListener("click", () => {
      const isOpen = section.classList.contains("open");

      if (isOpen) {
        section.classList.remove("open");
        content.style.maxHeight = null;
      } else {
        section.classList.add("open");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
});

// Search Protocol (Includes search by ID, name, or grade)
function activateSearchProtocols() {
  let searchInput = document.getElementById("searchBar");

  if (!searchInput) {
    searchInput = document.createElement("input");
    searchInput.id = "searchBar";
    searchInput.type = "text";
    searchInput.placeholder = "Search by ID, name, or grade...";

    if (containerEl) {
      containerEl.insertAdjacentElement("afterbegin", searchInput);
    }
  }

  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase().trim();
    const sections = document.querySelectorAll(".date-accordion");

    sections.forEach((section) => {
      const items = section.querySelectorAll(".log-item");
      let visibleCount = 0;

      items.forEach((li) => {
        const text = li.querySelector(".entry-text")?.textContent.toLowerCase() || "";
        const isMatch = text.includes(filter);
        li.style.display = isMatch ? "" : "none";
        if (isMatch) visibleCount++;
      });

      const content = section.querySelector(".accordion-content");

      if (filter !== "") {
        if (visibleCount > 0) {
          section.style.display = "";
          section.classList.add("open");
          content.style.maxHeight = content.scrollHeight + "px";
        } else {
          section.style.display = "none";
        }
      } else {
        section.style.display = "";
        section.classList.remove("open");
        content.style.maxHeight = null;
      }
    });
  });
}

const logContainer = document.getElementById("logList") || document.body;

logContainer.addEventListener("selectstart", (e) => {
  e.stopPropagation();
}, true);

logContainer.addEventListener("contextmenu", (e) => {
  e.stopPropagation();
}, true);

document.body.style.userSelect = "auto";
// document.body.style.webkitUserSelect = "auto";

activateSearchProtocols();