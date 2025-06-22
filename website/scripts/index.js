document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      // Cek status login menggunakan indikator dari global.js
      const user = localStorage.getItem("session_user"); // Akan digantikan sepenuhnya oleh Firebase Auth di masa depan
      window.location.href = user ? "dashboard.html" : "login.html";
    });
  }
});