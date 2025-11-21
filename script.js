// بيانات الموظفين
const users = {
    "sadeel": "12345",
    "ahmad": "9999",
    "rose": "1234",
    "noor":"3333",
    "mohammad":"1111",
    "fadda":"2222",
    "hamza":"5555",
    "hazem":"4444",
    "ibrahem":"6666",
    "bashar":"7777",
    "bader":"8888",
    "ahmad":"3245",
    "shade":"7890",
    "mahmood":"4567",
    "abdullah":"1010",
    "bilal":"2020",
    "hanee":"3030",
    "saleh":"4040",

};

// كلمة السر للأدمن
const ADMIN_PASSWORD = "admin_2025";

// السجلات
let attendanceRecords = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

// تسجيل الدخول
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("message");

    // Admin
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem("currentUser", "Admin");
        window.location.href = "admin.html";
        return;
    }

    // موظف
    if (users[username] && users[username] === password) {
        localStorage.setItem("currentUser", username);
        window.location.href = "clock.html";
        return;
    }

    msg.innerText = "❌ Wrong username or password";
}

// صفحة Clock.html
function initClockPage() {
    const username = localStorage.getItem("currentUser");
    if (!username || username === "Admin") {
        window.location.href = "index.html"; // منع الدخول
        return;
    }
    document.getElementById("welcome").innerText = "Welcome, " + username;
}

// Clock In
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

            localStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords));

            document.getElementById("status").innerText =
                `Clocked in at ${startTime.toLocaleTimeString()} (Location: ${lat}, ${lon})`;
        });
    } else {
        alert("Geolocation not supported.");
    }
}

// Clock Out
function clockOut() {
    const username = localStorage.getItem("currentUser");
    const endTime = new Date();

    for (let i = attendanceRecords.length - 1; i >= 0; i--) {
        if (attendanceRecords[i].name === username && attendanceRecords[i].clockOut === null) {
            attendanceRecords[i].clockOut = endTime;
            let hours = (endTime - new Date(attendanceRecords[i].clockIn)) / 1000 / 60 / 60;
            attendanceRecords[i].hours = hours.toFixed(2);

            localStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords));

            document.getElementById("status").innerText =
                `Clocked out at ${endTime.toLocaleTimeString()} (Worked ${hours.toFixed(2)} hours)`;
            break;
        }
    }
}

// صفحة Admin
function loadAdminRecords() {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser !== "Admin") {
        window.location.href = "index.html"; // منع الدخول
        return;
    }

    const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    let table = "<table border='1'><tr><th>Name</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Location</th></tr>";

    records.forEach(rec => {
        table += `<tr>
            <td>${rec.name}</td>
            <td>${new Date(rec.clockIn).toLocaleString()}</td>
            <td>${rec.clockOut ? new Date(rec.clockOut).toLocaleString() : ''}</td>
            <td>${rec.hours || ''}</td>
            <td>${rec.location}</td>
        </tr>`;
    });

    table += "</table>";
    document.getElementById("report").innerHTML = table;
}
// ------------------------
// Logout
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}
// --------------------------
// فتح أو إنشاء قاعدة البيانات
// --------------------------
let db;
let request = indexedDB.open("OM_System_DB", 1);

request.onupgradeneeded = function(e) {
    db = e.target.result;
    let store = db.createObjectStore("attendance", { keyPath: "id" });
};

request.onsuccess = function(e) {
    db = e.target.result;
    console.log("IndexedDB جاهزة");
};

request.onerror = function() {
    console.log("خطأ في فتح IndexedDB");
};


// --------------------------
// 1) تخزين Data
// --------------------------
function saveAttendance(data) {
    let tx = db.transaction("attendance", "readwrite");
    let store = tx.objectStore("attendance");
    store.put({ id: 1, ...data });

    tx.oncomplete = () => console.log("تم التخزين ✔");
    tx.onerror = () => console.log("فشل التخزين ❌");
}


// --------------------------
// 2) قراءة البيانات
// --------------------------
function loadAttendance(callback) {
    let tx = db.transaction("attendance", "readonly");
    let store = tx.objectStore("attendance");
    let request = store.get(1);

    request.onsuccess = () => callback(request.result);
    request.onerror = () => callback(null);
}


// --------------------------
// 3) استخدامه في Check In
// --------------------------
function checkIn() {
    let time = new Date().toISOString();

    saveAttendance({
        username: localStorage.getItem("username"),
        checkIn: time,
        checkOut: null,
        totalHours: null
    });

    alert("✔ تم تسجيل Check In");
}


// --------------------------
// 4) استخدامه في Check Out + حساب الساعات
// --------------------------
function checkOut() {
    loadAttendance((data) => {
        if (!data || !data.checkIn) {
            alert("لا يوجد Check In");
            return;
        }

        let checkOutTime = new Date().toISOString();
        let diff =
            (new Date(checkOutTime) - new Date(data.checkIn)) / 1000 / 60 / 60;

        saveAttendance({
            username: data.username,
            checkIn: data.checkIn,
            checkOut: checkOutTime,
            totalHours: diff.toFixed(2)
        });

        alert("✔ تم Check Out\nعدد الساعات: " + diff.toFixed(2));
    });
}
