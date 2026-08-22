// js/premium.js 

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Tangkap productId dari URL
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("product");

  let currentProduct = null;

  // 2. Ambil detail produk dari API jika productId ada
  if (productId && typeof WonderAPI !== "undefined") {
    try {
      const response = await WonderAPI.getProducts();
      const products = response.data || [];
      currentProduct = products.find(p => p.productId === productId);
    } catch (error) {
      console.error("Gagal memuat detail produk dari backend:", error);
    }
  }

  // Display info produk jika elemen UI tersedia
  if (currentProduct) {
    const titleEl = document.getElementById("selectedProductTitle");
    const priceEl = document.getElementById("selectedProductPrice");
    if (titleEl) titleEl.textContent = currentProduct.name || currentProduct.title;
    if (priceEl && currentProduct.price) {
      priceEl.textContent = `Rp ${Number(currentProduct.price).toLocaleString("id-ID")}`;
    }
  }

  const buyItemBtn = document.getElementById("buyItemBtn");
  const subscribeBtn = document.getElementById("subscribeBtn");

  // Helper eksekusi checkout
  function handleCheckout() {
    // Ambil user aktif dari Firebase atau global window
    const activeUser = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser)
                      || window.currentUser;

    // A. JIKA BELUM LOGIN: Langsung panggil modal login terpasang
    if (!activeUser) {
      if (typeof openLogin === "function") {
        openLogin();
      } else if (typeof Auth !== "undefined" && typeof Auth.openModal === "function") {
        Auth.openModal();
      } else {
        console.error("Fungsi modal login tidak ditemukan di halaman ini.");
      }
      return;
    }

    // B. JIKA SUDAH LOGIN: Lanjut ke link pembayaran
    const paymentUrl = currentProduct?.paymentUrl || "https://wonderapp.mayar.shop/m/akses-premium-wonder-app";
    const userEmail = encodeURIComponent(activeUser.email);

    const finalCheckoutUrl = paymentUrl.includes("?") 
      ? `${paymentUrl}&email=${userEmail}`
      : `${paymentUrl}?email=${userEmail}`;

    window.open(finalCheckoutUrl, '_blank');
  }

  // 3. Listener Tombol
  if (buyItemBtn) {
    buyItemBtn.addEventListener("click", () => {
      alert("Fitur pembelian per konten sedang disiapkan.");
    });
  }

  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", handleCheckout);
  }
});
