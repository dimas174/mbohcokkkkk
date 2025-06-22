// Fungsi konversi Base32 ke Hex
function base32ToHex(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '', hex = '';
  base32 = base32.replace(/=+$/, '');
  for (let i = 0; i < base32.length; i++) {
    const val = alphabet.indexOf(base32.charAt(i).toUpperCase());
    bits += val.toString(2).padStart(5, '0');
  }
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    hex += parseInt(bits.substr(i, 4), 2).toString(16);
  }
  return hex;
}

// Fungsi konversi Hex ke Bytes
function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return new Uint8Array(bytes);
}

let interval;

window.generate = async function () {
  const key = document.getElementById("secret").value.trim();
  if (!key) {
    alert("Masukkan secret dulu!");
    return;
  }
  clearInterval(interval);

  const updateCode = async () => {
    const epoch = Math.floor(Date.now() / 1000);
    const time = Math.floor(epoch / 30).toString(16).padStart(16, '0');
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(hexToBytes(base32ToHex(key))),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const hmac = await crypto.subtle.sign('HMAC', cryptoKey, hexToBytes(time));
    const offset = new DataView(hmac).getUint8(hmac.byteLength - 1) & 0xf;
    const binary = (new DataView(hmac).getUint32(offset) & 0x7fffffff).toString();
    const otp = binary.slice(-6).padStart(6, '0');
    document.getElementById("otp").textContent = otp;
    document.getElementById("copyBtn").style.display = 'inline-block';
    const rocket = document.getElementById("rocket");
    rocket.classList.remove("active");
    void rocket.offsetWidth;
    rocket.classList.add("active");
  };

  const updateCountdown = () => {
    const seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
    document.getElementById("countdown").textContent = `Waktu tersisa: ${seconds}s`;
  };

  await updateCode();
  updateCountdown();
  interval = setInterval(() => {
    updateCountdown();
    if (Math.floor(Date.now() / 1000) % 30 === 0) {
      updateCode();
    }
  }, 1000);
}

window.copyOTP = function () {
  const otp = document.getElementById("otp").textContent;
  if (otp && otp !== '------') {
    navigator.clipboard.writeText(otp).then(() => {
      alert("✅ Kode berhasil disalin ke clipboard!");
    }).catch(() => {
      alert("❌ Gagal menyalin kode.");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("session_user");
  if (!isLoggedIn) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "login.html";
  }
});