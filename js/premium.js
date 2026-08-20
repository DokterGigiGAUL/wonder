// js/premium.js

const MAYAR_PAYMENT_URL = "https://wonderapp.mayar.shop/m/akses-premium-wonder-app";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("product");

  const buyItemBtn = document.getElementById("buyItemBtn");
  const subscribeBtn = document.getElementById("subscribeBtn");

  // 1. Tombol Beli Per Konten
  if (buyItemBtn) {
    buyItemBtn.addEventListener("click", () => {
      alert("Fitur pembelian per konten sedang disiapkan.");
    });
  }

  // 2. Tombol Beli Akses Premium Bulanan
  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      // PERBAIKAN: Ambil akun dari Firebase Iframe, Window Utama (Parent), atau Window Current
      const activeUser = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser)
                          || (window.parent && window.parent.currentUser)
                          || window.currentUser;

      // Jika BELUM login:
      if (!activeUser) {
        localStorage.setItem("autoRedirectMayar", "true");
        
        alert("Silakan Login atau Daftar akun terlebih dahulu untuk melanjutkan pembayaran.");
        
        if (window.parent && typeof window.parent.openLogin === "function") {
          window.parent.openLogin();
        } else if (typeof openLogin === "function") {
          openLogin();
        }
        return;
      }

      // Jika SUDAH login: Langsung buka Mayar dengan email user
      const userEmail = encodeURIComponent(activeUser.email);
      window.open(`${MAYAR_PAYMENT_URL}?email=${userEmail}`, '_blank');
    });
  }

});

// Fungsi Buka & Tutup Modal Premium (Iframe)
function openPremiumModal(url) {
  const modal = document.getElementById('premiumModal');
  const iframe = document.getElementById('premiumFrame');
  
  if (modal && iframe) {
    iframe.src = url;
    modal.classList.add('show');
  }
}

const closeBtn = document.getElementById('closePremiumModal');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    const modal = document.getElementById('premiumModal');
    const iframe = document.getElementById('premiumFrame');
    if (modal) modal.classList.remove('show');
    if (iframe) iframe.src = '';
  });
}
