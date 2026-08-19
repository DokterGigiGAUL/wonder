// js/premium.js

// URL Payment Link Mayar Anda
const MAYAR_PAYMENT_URL = "https://wonderapp.mayar.shop/m/akses-premium-wonder-app";

// Fungsi Proteksi Utama saat User mengeklik Konten/Fitur Premium
function handleContentAccess(contentId, contentUrl) {
  // 1. Cek apakah User sudah Login
  if (!window.currentUser) {
    alert("Silakan Login terlebih dahulu untuk mengakses fitur ini.");
    openLogin();
    return;
  }

  // 2. Cek Status Akses Premium dari Firestore
  if (window.userAccess && window.userAccess.isPremium) {
    console.log("Akses diberikan. Membuka konten:", contentId);
    openPremiumModal(contentUrl);
  } else {
    // Jika belum premium, beri pilihan untuk beli
    const confirmPurchase = confirm(
      "Konten ini khusus untuk Member Premium.\n\nApakah Anda ingin membeli Akses Premium sekarang?"
    );
    if (confirmPurchase) {
      // Buka halaman pembayaran Mayar dengan pre-fill Email user agar sinkron
      const userEmail = encodeURIComponent(window.currentUser.email);
      window.open(`${MAYAR_PAYMENT_URL}?email=${userEmail}`, '_blank');
    }
  }
}

// Fungsi Membuka Modal Konten Premium (Iframe)
function openPremiumModal(url) {
  const modal = document.getElementById('premiumModal');
  const iframe = document.getElementById('premiumFrame');
  
  if (modal && iframe) {
    iframe.src = url;
    modal.classList.add('show');
  }
}

// Fungsi Menutup Modal Konten Premium
const closeBtn = document.getElementById('closePremiumModal');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    const modal = document.getElementById('premiumModal');
    const iframe = document.getElementById('premiumFrame');
    if (modal) modal.classList.remove('show');
    if (iframe) iframe.src = '';
  });
}
