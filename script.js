/* ------------------------------------------
   1️⃣ تحميل بيانات الموظفين من data.json
------------------------------------------- */

let users = {}; // تخزين اسم + كلمة السر من data.json

async function loadUsers() {
    try {
        const res = await fetch("data.json");
        const data = await res.json();

        data.employees.forEach(emp => {
            if (emp.password && emp.password !== "") {
                users[emp.name.toLowerCase()] = emp.password;
            }
        });

        console.log("Users loaded:", users);
    } catch (err) {
        console.error("Error loading data.json", err);
    }
}

// استدعاء تحميل الموظفين فورًا
loadUsers();


/* ------------------------------------------
   2️⃣ كلمة سر الأدمن
------------------------------------------- */
const ADMIN_PASSWORD = "admin_2025";


/* ------------------------------------------
   3️⃣ السجلات المخزنة على الجهاز
------------------------------------------- */
let attendanceRecords =
    JSON.parse(localStorage.getItem("attendanceRecords")) || [];


/* ------------------------------------------
   4️⃣ تسجيل الدخول
------------------------------------------- */

function login() {
    const username = document.getElementById("username").value.toLowerCase();
    const password = document.getElementById("password").value;
    const msg = document.getElementById("message");

    // دخول الأدمن
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem("currentUser", "Admin");
        window.location.href = "admin.html";
        return;
    }

    // دخول الموظف
    if (users[username] && users[username] === password) {
        localStorage.setItem("currentUser", username);
        window.location.href = "clock.html";
        return;
    }

    msg.innerText = "❌ Wrong username or password";
}


/* ------------------------------------------
   5️⃣ صفحة Clock – عرض الاسم
------------------------------------------- */

function initClockPage() {
    const username = localStorage.getItem("currentUser");
    if (!username || username === "Admin") {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("welcome").innerText =
        "Welcome, " + username;
}


/* ------------------------------------------
   6️⃣ Clock In – يسجل الوقت + اللوكيشن
------------------------------------------- */

function clockIn() {
    const username = localStorage.getItem("currentUser");
    const startTime = new Date();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            attendanceRecords.push({
                name: username,
                clockIn: startTime,
                clockOut: null,
                hours: null,
                location: `${lat}, ${lon}`
            });

            localStorage.setItem("attendanceRecords",
                JSON.stringify(attendanceRecords));

            document.getElementById("status").innerText =
                `Clocked in at ${startTime.toLocaleTimeString()} (Location: ${lat}, ${lon})`;
        });
    } else {
        alert("Geolocation not supported.");
    }
}


/* ------------------------------------------
   7️⃣ Clock Out – يحسب الساعات
------------------------------------------- */

function clockOut() {
    const username = localStorage.getItem("currentUser");
    const endTime = new Date();

    for (let i = attendanceRecords.length - 1; i >= 0; i--) {
        if (attendanceRecords[i].name === username &&
            attendanceRecords[i].clockOut === null) {

            attendanceRecords[i].clockOut = endTime;

            let hours =
                (endTime - new Date(attendanceRecords[i].clockIn)) /
                1000 / 60 / 60;

            attendanceRecords[i].hours = hours.toFixed(2);

            localStorage.setItem("attendanceRecords",
                JSON.stringify(attendanceRecords));

            document.getElementById("status").innerText =
                `Clocked out at ${endTime.toLocaleTimeString()} (Worked ${hours.toFixed(2)} hours)`;
            break;
        }
    }
}


/* ------------------------------------------
   8️⃣ صفحة الأدمن – عرض السجلات
------------------------------------------- */

function loadAdminRecords() {
    const currentUser = localStorage.getItem("currentUser");

    if (currentUser !== "Admin") {
        window.location.href = "index.html";
        return;
    }

    const records =
        JSON.parse(localStorage.getItem("attendanceRecords")) || [];

    let table =
        "<table border='1'><tr><th>Name</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Location</th></tr>";

    records.forEach(rec => {
        table += `<tr>
            <td>${rec.name}</td>
            <td>${new Date(rec.clockIn).toLocaleString()}</td>
            <td>${rec.clockOut ? new Date(rec.clockOut).toLocaleString() : ""}</td>
            <td>${rec.hours || ""}</td>
            <td>${rec.location}</td>
        </tr>`;
    });

    table += "</table>";
    document.getElementById("report").innerHTML = table;
}


/* ------------------------------------------
   9️⃣ تسجيل الخروج
------------------------------------------- */

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}





