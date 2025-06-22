import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

const app = getApp();
const auth = getAuth(app);

window.loginUser = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("error-message");

  errorMessage.style.display = 'none';

  if (!email || !password) {
    errorMessage.textContent = "Lengkapi semua field!";
    errorMessage.style.display = 'block';
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    localStorage.setItem("session_user", JSON.stringify({ email: user.email, uid: user.uid }));

    const anim = document.createElement("div");
    anim.className = "success-animation";
    anim.innerHTML = `
      <lottie-player
        src="https://lottie.host/6f64e6f6-8403-437d-933f-87be7d322489/66bsDMSkFr.json"
        background="transparent"
        speed="1"
        style="width: 200px; height: 200px;"
        autoplay>
      </lottie-player>
    `;
    document.body.appendChild(anim);

    setTimeout(() => anim.classList.add('show'), 100);

    setTimeout(() => window.location.href = "dashboard.html", 2000);

  } catch (error) {
    let message = "Email atau password salah!";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      message = "Email atau password salah!";
    } else if (error.code === 'auth/invalid-email') {
      message = "Format email tidak valid.";
    } else if (error.code === 'auth/too-many-requests') {
      message = "Terlalu banyak percobaan login. Coba lagi nanti.";
    } else if (error.code === 'auth/api-key-not-valid') { // Tambahan untuk error API Key
      message = "Konfigurasi Firebase API Key tidak valid. Periksa global.js Anda.";
    }
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    console.error("Firebase login error:", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // updateLoginLogoutUI() dari global.js akan menangani tampilan tombol.
});