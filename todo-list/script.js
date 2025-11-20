const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const prioritySelect = document.getElementById("priority");
const taskDate = document.getElementById("task-date");
const logoutBtn = document.getElementById("logoutBtn");
const calendarGrid = document.getElementById("calendar-grid");
const calendarNav = document.getElementById("calendar-nav");
const currentUserName = document.getElementById("currentUserName");

// Check login
const currentUser = localStorage.getItem("currentUser");
if (!currentUser) window.location.href = "index.html";
currentUserName.textContent = currentUser;


// Logout
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
});


// Add Task
function addTask() {
    if (inputBox.value === '') {
        alert("You must write something");
        return;
    }

    const dateVal = taskDate.value || new Date().toISOString().split("T")[0];

    const li = document.createElement("li");
    li.textContent = inputBox.value;
    li.classList.add(prioritySelect.value.toLowerCase());
    li.dataset.date = dateVal;

    const span = document.createElement("span");
    span.innerHTML = "&times;";
    li.appendChild(span);

    listContainer.appendChild(li);
    inputBox.value = '';
    taskDate.value = '';

    saveTaskJSON();
    renderCalendarGrid();
}


// Click Events
listContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
    } else if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
    }
    saveTaskJSON();
    renderCalendarGrid();
});


// ---------------------------
//  SAVE TASKS + TIMESTAMP
// ---------------------------
function saveTaskJSON() {
    const tasks = [];
    listContainer.querySelectorAll("li").forEach(li => {
        tasks.push({
            text: li.childNodes[0].textContent.trim(),
            priority: li.classList.contains("high") ? "High" : li.classList.contains("medium") ? "Medium" : "Low",
            checked: li.classList.contains("checked"),
            date: li.dataset.date
        });
    });

    localStorage.setItem("tasks_" + currentUser, JSON.stringify(tasks));
    localStorage.setItem("taskSavedTime_" + currentUser, Date.now()); // Save timestamp
}


// ---------------------------
//  LOAD + AUTO-CLEAR AFTER 24 HOURS
// ---------------------------
function showTaskJSON() {
    const savedTime = localStorage.getItem("taskSavedTime_" + currentUser);
    const tasks = JSON.parse(localStorage.getItem("tasks_" + currentUser) || "[]");

    if (savedTime) {
        const now = Date.now();
        const diffHours = (now - savedTime) / (1000 * 60 * 60);

        if (diffHours >= 24) {
            // Clear tasks if 24 hours passed
            localStorage.removeItem("tasks_" + currentUser);
            localStorage.removeItem("taskSavedTime_" + currentUser);

            listContainer.innerHTML = "";
            renderCalendarGrid();
            return;
        }
    }

    // Load tasks normally
    listContainer.innerHTML = "";
    tasks.forEach(t => {
        const li = document.createElement("li");
        li.textContent = t.text;
        li.classList.add(t.priority.toLowerCase());
        if (t.checked) li.classList.add("checked");
        li.dataset.date = t.date;

        const span = document.createElement("span");
        span.innerHTML = "&times;";
        li.appendChild(span);
        listContainer.appendChild(li);
    });
}

showTaskJSON();


// ---------------------------
//  DATE & TIME DISPLAY
// ---------------------------
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };
    document.getElementById("dateTime").innerHTML = now.toLocaleString("en-US", options);
}
setInterval(updateDateTime, 1000);
updateDateTime();


// ---------------------------
//  DARK MODE
// ---------------------------
const themeBtn = document.getElementById("themeBtn");
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});


// ---------------------------
//  CALENDAR FUNCTIONS
// ---------------------------
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderCalendarGrid() {
    const tasks = JSON.parse(localStorage.getItem("tasks_" + currentUser) || "[]");

    calendarGrid.innerHTML = "";
    calendarNav.innerHTML = `<button onclick="prevMonth()">❮</button> ${monthNames[currentMonth]} ${currentYear} <button onclick="nextMonth()">❯</button>`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const daysHeader = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysHeader.forEach(d => {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("calendar-day");
        dayDiv.textContent = d;
        calendarGrid.appendChild(dayDiv);
    });

    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        blank.classList.add("calendar-cell");
        calendarGrid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement("div");
        cell.classList.add("calendar-cell");

        const span = document.createElement("span");
        span.classList.add("date-num");
        span.textContent = d;
        cell.appendChild(span);

        const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        tasks.filter(t => t.date === fullDate).forEach(t => {
            const taskItem = document.createElement("div");
            taskItem.classList.add("task-item", t.priority.toLowerCase());
            taskItem.textContent = t.text;
            cell.appendChild(taskItem);
        });

        calendarGrid.appendChild(cell);
    }
}

renderCalendarGrid();

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendarGrid();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendarGrid();
}
