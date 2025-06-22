document.addEventListener("DOMContentLoaded", () => {
  // Pengecekan login setelah navbar dimuat dan global.js berjalan
  // Ini akan lebih baik ditangani oleh onAuthStateChanged di global.js
  // untuk redirect yang otomatis dan mulus.
  // Kode ini hanya sebagai fallback jika global.js belum sempat meng-handle.
  const user = localStorage.getItem("session_user");
  if (!user) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "login.html";
  }
});