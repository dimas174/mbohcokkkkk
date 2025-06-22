// scripts/register.js
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

const app = getApp();
const db = getDatabase(app);
const auth = getAuth(app);

window.registerUser = async function () {
  const nama = document.getElementById("nama").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("error-message");

  errorMessage.style.display = 'none'; // Sembunyikan pesan error sebelumnya

  if (!nama || !email || !password) {
    errorMessage.textContent = "Semua field wajib diisi!";
    errorMessage.style.display = 'block';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorMessage.textContent = "Format email tidak valid!";
    errorMessage.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorMessage.textContent = "Password minimal 6 karakter!";
    errorMessage.style.display = 'block';
    return;
  }

  try {
    console.log("Mencoba mendaftar pengguna ke Firebase Authentication...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Pendaftaran Firebase Authentication berhasil! UID:", user.uid);

    console.log("Mencoba menyimpan nama pengguna ke Realtime Database...");
    await set(ref(db, "users/" + user.uid), {
      nama: nama,
      email: email,
      waktu: new Date().toISOString()
    });
    console.log("Penyimpanan nama pengguna ke Realtime Database berhasil!");

    // --- Bagian Animasi & Redirect (di dalam blok try yang aman) ---
    try {
        console.log("Memulai pembaruan DOM untuk tampilan sukses...");
        const cardElement = document.querySelector(".card");

        // Ganti konten card dengan pesan sukses dan tombol login
        cardElement.innerHTML = `
          <h1>🎉 Pendaftaran Berhasil!</h1>
          <p style="margin-bottom: 20px; color: #fff;">Akun Anda telah dibuat dengan sukses.</p>
          <button onclick="window.location.href='login.html'" style="
              background: #00ffcc;
              color: #000;
              padding: 12px 25px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
              font-size: 1rem;
              box-shadow: 0 0 10px #00ffccaa;
              transition: 0.3s ease;
              width: 80%;
              margin-top: 20px;
          ">Masuk Sekarang</button>
          <img src="https://cdn-icons-png.flaticon.com/512/3212/3212608.png" class="rocket" id="registerRocket" alt="Rocket" style="
              width: 60px;
              margin-top: 40px;
              opacity: 0;
              transform: translateY(100px);
              transition: all 0.8s ease;
              display: block;
              margin-left: auto;
              margin-right: auto;
          " />
        `;
        console.log("Konten card berhasil diperbarui.");

        // Setelah innerHTML berubah, elemen roket baru perlu diambil ulang
        const rocketAfterChange = document.getElementById("registerRocket");
        if (rocketAfterChange) {
            rocketAfterChange.classList.add("active");
            console.log("Kelas 'active' untuk roket diaktifkan.");
        } else {
            console.error("Error: Elemen roket (registerRocket) tidak ditemukan setelah innerHTML diperbarui. Pastikan ID 'registerRocket' ada di HTML yang disuntikkan.");
        }

        console.log("Mencoba redirect ke login.html dalam 2 detik...");
        setTimeout(() => {
            window.location.href = "login.html";
            console.log("Redirect berhasil dieksekusi.");
        }, 2000);

    } catch (domError) {
        // Tangani error yang terjadi saat manipulasi DOM atau animasi
        console.error("Error saat memperbarui DOM atau mengaktifkan animasi:", domError);
        errorMessage.textContent = "Pendaftaran berhasil, tetapi ada masalah tampilan. Silakan coba login.";
        errorMessage.style.display = 'block';
        // Meskipun ada error di DOM/animasi, tetap coba redirect
        setTimeout(() => {
            window.location.href = "login.html";
            console.log("Redirect paksa setelah error DOM.");
        }, 2000);
    }

  } catch (firebaseError) {
    // Tangani error yang terjadi saat pendaftaran dengan Firebase (seperti API Key tidak valid, email sudah dipakai, dll.)
    let message = "Gagal mendaftar. Terjadi kesalahan tidak dikenal.";
    if (firebaseError.code === 'auth/email-already-in-use') {
      message = "Email ini sudah terdaftar. Gunakan email lain atau login.";
    } else if (firebaseError.code === 'auth/weak-password') {
      message = "Password terlalu lemah (minimal 6 karakter).";
    } else if (firebaseError.code === 'auth/api-key-not-valid') {
      message = "Konfigurasi Firebase API Key tidak valid. Periksa global.js Anda.";
    } else if (firebaseError.code === 'permission_denied' || firebaseError.code === 'database_permission_denied') {
      message = "Gagal menyimpan data pengguna. Periksa aturan Realtime Database Anda.";
    } else {
        // Pesan error umum untuk kasus yang tidak terduga
        message = `Gagal mendaftar: ${firebaseError.message || "Kesalahan tidak dikenal."}`;
    }
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    console.error("Firebase registration error:", firebaseError); // Log error asli dari Firebase
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // updateLoginLogoutUI() dari global.js akan menangani tampilan tombol.
});