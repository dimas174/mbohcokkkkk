// scripts/store.js
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("session_user");
  if (!user) {
    alert("Silakan login terlebih dahulu!");
    window.location.href = "login.html";
    return;
  }

  const productListDiv = document.getElementById('product-list');
  const googleAppsScriptBaseURL = 'https://script.google.com/macros/s/AKfycbzBsUbQVuVYrpuVVi64Vs0XvaOo-gYVq8M__GkOzun4_aFkf0dz-A61JjqPFSKCu-fFkw/exec'; // Base URL tanpa parameter
  const productApiUrl = `${googleAppsScriptBaseURL}?sheet=products`; // Untuk GET products
  const purchaseInitiationApiUrl = `${googleAppsScriptBaseURL}?action=initiatePurchase`; // Untuk POST initiatePurchase

  // Fungsi untuk memuat produk dari Spreadsheet
  async function loadProducts() {
    productListDiv.innerHTML = '<p style="text-align: center; color: #ccc;"><i class="fas fa-spinner fa-spin"></i> Memuat produk...</p>';
    try {
      const response = await fetch(productApiUrl);
      const data = await response.json();

      if (data.status === 'error') {
        productListDiv.innerHTML = `<p style="text-align: center; color: #e11d48;">Error memuat produk: ${data.message}</p>`;
        console.error("Apps Script Error (loadProducts):", data.message);
        return;
      }

      const products = data.data; 
      if (!Array.isArray(products)) { 
          productListDiv.innerHTML = `<p style="text-align: center; color: #e11d48;">Format data produk tidak valid dari Apps Script (bukan array).</p>`;
          console.error("Apps Script Data Format Error: 'data' property is not an array.", data);
          return;
      }

      if (products.length === 0) {
        productListDiv.innerHTML = '<p style="text-align: center; color: #ccc;">Belum ada produk tersedia.</p>';
        return;
      }

      productListDiv.innerHTML = ''; // Kosongkan loading state

      products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        let buttonHtml = '';
        if (product.ProductName?.includes('EMAIL LINKED')) { 
            buttonHtml = `<a href="purchase.html?product=${encodeURIComponent(product.ProductName)}" class="buy-button" style="text-decoration: none; color: inherit;">Beli Sekarang</a>`;
        } else {
            buttonHtml = `<button class="buy-button" data-product-name="${product.ProductName || 'Produk Tidak Dikenal'}">Beli Sekarang</button>`;
        }
        
        productCard.innerHTML = `
          <h2 class="product-title">${product.ProductName || 'Nama Produk'}</h2>
          <p class="product-price">Rp ${new Intl.NumberFormat('id-ID').format(product.Price || 0)}</p>
          <p class="product-desc">${product.Description || 'Deskripsi tidak tersedia'}</p>
          ${buttonHtml}
        `;
        productListDiv.appendChild(productCard);
      });

      document.querySelectorAll('.buy-button').forEach(button => {
        if (button.tagName === 'BUTTON') { 
            button.addEventListener('click', initiatePurchase);
        }
      });

    } catch (error) {
      productListDiv.innerHTML = `<p style="text-align: center; color: #e11d48;">Gagal memuat produk. Cek koneksi internet Anda atau URL Apps Script.</p>`;
      console.error("Error fetching products:", error);
    }
  }

  async function initiatePurchase(event) {
    const productName = event.target.dataset.productName;
    const userId = user ? JSON.parse(user).uid : 'guest_user';
    const userEmail = user ? JSON.parse(user).email : 'guest@example.com';
    let quantity = 1;

    if (productName.includes('EMAIL LINKED')) {
      const productCard = event.target.closest('.product-card');
      const quantityInput = productCard.querySelector('.quantity-input');
      quantity = parseInt(quantityInput.value, 10);
      if (isNaN(quantity) || quantity < 1) {
        alert('Kuantitas tidak valid.');
        return;
      }
    }

    const productsData = (await (await fetch(`${googleAppsScriptBaseURL}?sheet=products`)).json()).data;
    const baseProduct = productsData.find(p => p.ProductName === productName);
    const basePrice = baseProduct ? baseProduct.Price : 0;

    let calculatedAmount = basePrice * quantity;
    const uniqueDigit = Math.floor(Math.random() * 10);
    // --- PERBAIKAN DI SINI ---
    const finalAmount = calculatedAmount + uniqueDigit; // INI YANG DIKOREKSI
    // --- AKHIR PERBAIKAN ---

    event.target.disabled = true;
    event.target.textContent = 'Memproses...';

    try {
      const response = await fetch(purchaseInitiationApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName: productName,
          userId: userId,
          userEmail: userEmail,
          quantity: quantity,
          finalAmount: finalAmount
        })
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert(`Pembelian ${productName} (${quantity} unit) berhasil diinisiasi! Total pembayaran: Rp ${new Intl.NumberFormat('id-ID').format(finalAmount)}. Anda akan diarahkan ke halaman pembayaran Saweria.`);
        window.open(data.paymentLink, '_blank');
      } else {
        alert(`Gagal membeli: ${data.message}`);
        console.error("Purchase initiation error:", data.message);
      }
    } catch (error) {
      alert('Terjadi kesalahan saat memproses pembelian. Silakan coba lagi.');
      console.error("Error initiating purchase:", error);
    } finally {
      event.target.disabled = false;
      event.target.textContent = 'Beli Sekarang';
    }
  }

  loadProducts();
});