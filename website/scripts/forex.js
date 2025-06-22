document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("session_user");
  if (!user) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "login.html";
  }
});