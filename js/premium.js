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

  // Display info produk jika ada UI-nya
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

  // 3. Tombol Beli Per Konten
  if (buyItemBtn) {
    buyItemBtn.addEventListener("click", () => {
      alert("Fitur pembelian per konten sedang disiapkan.");
    });
  }

  // 4. Tombol Langganan / Pembayaran
  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      // Cek User Auth
      const activeUser = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser)
                        || window.currentUser;

      if (!activeUser) {
        alert("Silakan Login atau Daftar akun terlebih dahulu untuk melanjutkan pembayaran.");
        if (typeof openLogin === "function") {
          openLogin();
        } else {
          window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
        }
        return;
      }

      // Tentukan URL Pembayaran Mayar:
      // Utamakan paymentUrl khusus milik produk dari backend, fallback ke default jika tidak ada
      const paymentUrl = currentProduct?.paymentUrl || "https://wonderapp.mayar.shop/m/akses-premium-wonder-app";
      const userEmail = encodeURIComponent(activeUser.email);

      // Gabungkan parameter email
      const finalCheckoutUrl = paymentUrl.includes("?") 
        ? `${paymentUrl}&email=${userEmail}`
        : `${paymentUrl}?email=${userEmail}`;

      window.open(finalCheckoutUrl, '_blank');
    });
  }
});
