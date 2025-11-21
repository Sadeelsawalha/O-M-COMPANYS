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
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
  import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

  // الصقي هنا firebaseConfig
  const firebaseConfig = {
    apiKey: "AIzaSyCzzFxaHqTLDOb7VLI82evWEl9ck1Js5Es",
    authDomain: "test-12fd5.firebaseapp.com",
    databaseURL: "https://test-12fd5-default-rtdb.firebaseio.com",
    projectId: "test-12fd5",
    storageBucket: "test-12fd5.appspot.com",
    messagingSenderId: "715807742478",
    appId: "1:715807742478:web:e787e4fb9e65347400fa5f"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  // Check In
  window.checkIn = function(username) {
    const time = new Date().toISOString();
    navigator.geolocation.getCurrentPosition((pos) => {
      set(ref(db, 'attendance/' + username), {
        checkIn: time,
        checkOut: null,
        hours: null,
        location: `${pos.coords.latitude},${pos.coords.longitude}`
      }).then(() => alert("✔ تم تسجيل Check In"));
    });
  }

  // Check Out
  window.checkOut = function(username) {
    const dbRef = ref(db);
    get(child(dbRef, 'attendance/' + username)).then((snapshot) => {
      if (!snapshot.exists() || !snapshot.val().checkIn) {
        alert("لا يوجد Check In");
        return;
      }
      const data = snapshot.val();
      const checkInTime = new Date(data.checkIn);
      const checkOutTime = new Date();
      const hours = (checkOutTime - checkInTime) / 1000 / 60 / 60;

      update(ref(db, 'attendance/' + username), {
        checkOut: checkOutTime.toISOString(),
        hours: hours.toFixed(2)
      }).then(() => alert("✔ تم Check Out\nعدد الساعات: " + hours.toFixed(2)));
    });
  }
</script>
