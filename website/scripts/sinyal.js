document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("session_user");
    if (!user) {
        alert("Silakan login terlebih dahulu!");
        window.location.href = "login.html";
        return;
    }

    fetch('https://script.google.com/macros/s/AKfycbzxs5Bph7vKlJ1I2uw6mMuTgpNdspMq3XuGqE7-y0uY2N-kvUTUcUXQvi2EyGduedCt/exec')
        .then(res => res.text())
        .then(data => document.getElementById('signalContent').innerText = data)
        .catch(err => document.getElementById('signalContent').innerText = "Gagal memuat sinyal. Terjadi kesalahan jaringan atau server.");
});