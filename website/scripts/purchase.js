// scripts/purchase.js
document.addEventListener("DOMContentLoaded", async () => {
  const user = localStorage.getItem("session_user");
  if (!user) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "login.html";
    return;
  }

  const productNameDisplay = document.getElementById('product-name-display');
  const productDescriptionDisplay = document.getElementById('product-description-display');
  const unitPriceValue = document.getElementById('unit-price-value');
  const quantityInput = document.getElementById('quantity');
  const totalPriceValue = document.getElementById('total-price-value');
  const proceedToPaymentBtn = document.getElementById('proceed-to-payment-btn');
  const purchaseErrorMessage = document.getElementById('purchase-error-message');

  // HAPUS BARIS INI: const minusBtn = document.querySelector('.minus-btn');
  // HAPUS BARIS INI: const plusBtn = document.querySelector('.plus-btn');

  const googleAppsScriptBaseURL = 'https://script.google.com/macros/s/AKfycbzBsUbQVuVYrpuVVi64Vs0XvaOo-gYVq8M__GkOzun4_aFkf0dz-A61JjqPFSKCu-fFkw/exec';
  const productApiUrl = `${googleAppsScriptBaseURL}?sheet=products`;
  const purchaseInitiationApiUrl = `${googleAppsScriptBaseURL}?action=initiatePurchase`;

  let currentProduct = null;

  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  const productNameToLoad = getUrlParameter('product');

  if (productNameToLoad) {
    try {
      const response = await fetch(productApiUrl);
      const data = await response.json();

      if (data.status === 'error') {
        productNameDisplay.textContent = `Error: ${data.message}`;
        purchaseErrorMessage.textContent = `Error memuat detail produk: ${data.message}`;
        purchaseErrorMessage.style.display = 'block';
        return;
      }

      const products = data.data;
      currentProduct = products.find(p => p.ProductName === productNameToLoad);

      if (currentProduct) {
        productNameDisplay.innerHTML = `<i class="fas fa-shopping-cart"></i> ${currentProduct.ProductName}`;
        productDescriptionDisplay.textContent = currentProduct.Description;
        unitPriceValue.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(currentProduct.Price)}`;
        
        updateTotalPrice();
        proceedToPaymentBtn.disabled = false;
      } else {
        productNameDisplay.textContent = "Produk tidak ditemukan.";
        purchaseErrorMessage.textContent = "Produk yang diminta tidak ditemukan.";
        purchaseErrorMessage.style.display = 'block';
      }

    } catch (error) {
      productNameDisplay.textContent = "Gagal memuat produk.";
      purchaseErrorMessage.textContent = "Gagal memuat detail produk. Cek koneksi internet atau URL Apps Script.";
      purchaseErrorMessage.style.display = 'block';
      console.error("Error loading product details:", error);
    }
  } else {
    productNameDisplay.textContent = "Tidak ada produk dipilih.";
    purchaseErrorMessage.textContent = "Tidak ada produk yang dipilih untuk pembelian.";
    purchaseErrorMessage.style.display = 'block';
  }

  // Fungsi untuk memperbarui tampilan total harga
  function updateTotalPrice() {
    if (!currentProduct) return;
    const quantity = parseInt(quantityInput.value, 10);
    if (isNaN(quantity) || quantity < 1) {
      totalPriceValue.textContent = `Rp 0`;
      proceedToPaymentBtn.disabled = true;
      return;
    }

    const basePrice = currentProduct.Price;
    const calculatedAmount = basePrice * quantity;
    const uniqueDigit = Math.floor(Math.random() * 10);

    const finalAmount = calculatedAmount + uniqueDigit;

    totalPriceValue.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(finalAmount)}`;
    proceedToPaymentBtn.disabled = false;
    
    // HAPUS BARIS INI: if (minusBtn) minusBtn.disabled = (quantity <= minQty);
    // HAPUS BARIS INI: if (plusBtn) plusBtn.disabled = (quantity >= maxQty);
  }

  // Event listener untuk input kuantitas
  quantityInput.addEventListener('input', updateTotalPrice);

  // HAPUS SELURUH BLOK INI:
  // if (minusBtn) {
  //   minusBtn.addEventListener('click', () => {
  //     let currentQty = parseInt(quantityInput.value, 10);
  //     if (currentQty > parseInt(quantityInput.min, 10)) {
  //       quantityInput.value = currentQty - 1;
  //       updateTotalPrice();
  //     }
  //   });
  // }
  // HAPUS SELURUH BLOK INI:
  // if (plusBtn) {
  //   plusBtn.addEventListener('click', () => {
  //     let currentQty = parseInt(quantityInput.value, 10);
  //     if (currentQty < parseInt(quantityInput.max, 10)) {
  //       quantityInput.value = currentQty + 1;
  //       updateTotalPrice();
  //     }
  //   });
  // }

  // Event listener untuk tombol "Lanjutkan Pembayaran"
  proceedToPaymentBtn.addEventListener('click', async () => {
    const quantity = parseInt(quantityInput.value, 10);
    if (isNaN(quantity) || quantity < 1) {
      alert('Kuantitas tidak valid.');
      return;
    }

    proceedToPaymentBtn.disabled = true;
    proceedToPaymentBtn.textContent = 'Memproses Pembayaran...';

    const userId = user ? JSON.parse(user).uid : 'guest_user';
    const userEmail = user ? JSON.parse(user).email : 'guest@example.com';

    const basePrice = currentProduct.Price;
    const calculatedAmount = basePrice * quantity;
    const uniqueDigit = Math.floor(Math.random() * 10);
    const finalAmount = calculatedAmount + uniqueDigit;

    try {
      const response = await fetch(purchaseInitiationApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName: currentProduct.ProductName,
          userId: userId,
          userEmail: userEmail,
          quantity: quantity,
          finalAmount: finalAmount
        })
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert(`Pembelian ${currentProduct.ProductName} (${quantity} unit) berhasil diinisiasi! Total pembayaran: Rp ${new Intl.NumberFormat('id-ID').format(finalAmount)}. Anda akan diarahkan ke halaman pembayaran Saweria.`);
        window.open(data.paymentLink, '_blank');
      } else {
        purchaseErrorMessage.textContent = `Gagal melanjutkan pembayaran: ${data.message}`;
        purchaseErrorMessage.style.display = 'block';
        console.error("Purchase initiation error:", data.message);
      }
    } catch (error) {
      purchaseErrorMessage.textContent = 'Terjadi kesalahan jaringan saat memproses pembayaran. Silakan coba lagi.';
      purchaseErrorMessage.style.display = 'block';
      console.error("Error initiating payment:", error);
    } finally {
      proceedToPaymentBtn.disabled = false;
      proceedToPaymentBtn.textContent = 'Lanjutkan Pembayaran';
    }
  });
});