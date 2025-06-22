// scripts/global.js
// Inisialisasi Firebase App
// Ganti dengan konfigurasi proyek Firebase Anda!
// Anda bisa mendapatkan ini dari Firebase Console -> Project settings -> General
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBH2LUJG8Vn3WJhnRFRGIA0SPYUvZ2Gso0", // Ganti dengan API Key Anda yang sebenarnya
  authDomain: "mmproject-2b69d.firebaseapp.com", // Ganti dengan Auth Domain Anda yang sebenarnya
  databaseURL: "https://mmproject-2b60d-default-rtdb.firebaseio.com/", // Ganti jika menggunakan Realtime Database Anda yang sebenarnya
  projectId: "mmproject-2b69d", // Ganti dengan Project ID Anda yang sebenarnya
  storageBucket: "mmproject-2b69d.appspot.com", // Ganti dengan Storage Bucket Anda yang sebenarnya
  messagingSenderId: "719631969897", // Ganti dengan Messaging Sender ID Anda yang sebenarnya
  appId: "1:719631969897:web:bc04f45e300eb84b2f8e48", // Ganti dengan App ID Anda yang sebenarnya
  measurementId: "G-YMZW2YTJ1Z" // Ganti jika menggunakan Measurement ID Anda yang sebenarnya
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Dapatkan instance Auth

// Fungsi untuk menyuntikkan navbar dan footer
document.addEventListener("DOMContentLoaded", () => {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            const navbarPlaceholder = document.getElementById('navbar-placeholder');
            if (navbarPlaceholder) {
                navbarPlaceholder.innerHTML = data;
                updateLoginLogoutUI(); // Panggil setelah navbar dimuat
                setupHamburgerMenu(); // Panggil untuk inisialisasi hamburger menu
            }
        })
        .catch(error => console.error('Error loading navbar:', error));

    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
            }
        })
        .catch(error => console.error('Error loading footer:', error));

    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, update UI
            localStorage.setItem("session_user", JSON.stringify({ email: user.email, uid: user.uid }));
        } else {
            // User is signed out
            localStorage.removeItem("session_user");
        }
        updateLoginLogoutUI(); // Update UI based on new auth state
    });

    // Panggil updateLoginLogoutUI secara langsung juga untuk kondisi awal
    updateLoginLogoutUI();
});

// Fungsi untuk memperbarui tampilan tombol Login/Logout di Navbar
function updateLoginLogoutUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userSession = localStorage.getItem('session_user'); // Menggunakan localStorage sebagai indikator sementara

    if (loginBtn && logoutBtn) {
        if (userSession) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    }
}
window.updateLoginLogoutUI = updateLoginLogoutUI; // Buat global

// Fungsi Logout
async function logoutUser() {
    try {
        await signOut(auth); // Gunakan Firebase Auth signOut
        window.location.href = 'login.html'; // Redirect ke halaman login setelah logout
    } catch (error) {
        console.error("Error logging out:", error);
        alert("Gagal logout: " + error.message);
    }
}
window.logoutUser = logoutUser; // Buat global

// Fungsi untuk toggle hamburger menu
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}
// scripts/global.js
// ... (kode yang sudah ada) ...

// --- Fungsi Swipe to Go Back ---
document.addEventListener("DOMContentLoaded", () => { // Pastikan kode ini dieksekusi setelah DOM siap
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 70; // Jarak swipe minimum (dalam piksel) untuk dianggap sebagai gerakan "kembali"

    // Tambahkan event listener untuk touchstart pada seluruh dokumen
    document.addEventListener('touchstart', (e) => {
        // Hanya pedulikan sentuhan pertama (jari pertama)
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            // console.log("Touch started at X:", touchStartX); // Untuk debugging
        }
    }, { passive: true }); // Menggunakan { passive: true } untuk performa scroll yang lebih baik

    // Tambahkan event listener untuk touchmove
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            touchEndX = e.touches[0].clientX;
            // console.log("Touch moving, current X:", touchEndX); // Untuk debugging
        }
    }, { passive: true });

    // Tambahkan event listener untuk touchend
    document.addEventListener('touchend', () => {
        // Cek apakah ini adalah swipe ke kanan dari tepi kiri layar
        const swipeDistance = touchEndX - touchStartX;
        const screenWidth = window.innerWidth;

        // Kondisi: Swipe cukup jauh ke kanan DAN dimulai dekat tepi kiri layar
        // Misalnya, dimulai dalam 50px dari tepi kiri dan swipe ke kanan lebih dari threshold
        if (swipeDistance > swipeThreshold && touchStartX < (screenWidth * 0.15)) { // Mulai dari 15% lebar layar dari kiri
            // console.log("Swipe detected! Distance:", swipeDistance, "StartX:", touchStartX); // Untuk debugging
            history.back(); // Kembali ke halaman sebelumnya
        }

        // Reset nilai touch setelah sentuhan berakhir
        touchStartX = 0;
        touchEndX = 0;
    });

    // Optional: Untuk debugging di desktop dengan mouse (tidak akan sama dengan sentuhan)
    // let mouseStartX = 0;
    // let mouseEndX = 0;
    // document.addEventListener('mousedown', (e) => {
    //     mouseStartX = e.clientX;
    // });
    // document.addEventListener('mouseup', (e) => {
    //     mouseEndX = e.clientX;
    //     if (mouseEndX - mouseStartX > swipeThreshold && mouseStartX < (window.innerWidth * 0.15)) {
    //         console.log("Mouse Swipe detected!");
    //         // history.back(); // Uncomment for testing with mouse
    //     }
    // });

});