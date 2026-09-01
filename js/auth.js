// Inisialisasi Guard / Fallback Langsung di Top-Level Script
window.currentUserData = window.currentUserData || null;
window.authInitialized = window.authInitialized || false;

// Helper Penunggu Auth
if (typeof window.ensureAuthReady !== "function") {
  window.ensureAuthReady = function () {
    return new Promise((resolve) => {
      if (window.authInitialized) {
        return resolve(window.currentUserData);
      }
      window.addEventListener("authReady", () => {
        resolve(window.currentUserData);
      }, { once: true });
    });
  };
}

// Deklarasi Fungsi Utama Akses Global
if (typeof window.canAccessContent !== "function") {
  window.canAccessContent = async function (productId) {
    const userData = await window.ensureAuthReady();

    // 1. Status isPremium Global
    if (userData && userData.isPremium === true) {
      return true;
    }

    // 2. Pembelian Eceran/Spesifik
    if (userData && Array.isArray(userData.purchasedProducts)) {
      if (userData.purchasedProducts.includes(productId)) {
        return true;
      }
    }

    // 3. Fallback PurchaseManager
    if (typeof PurchaseManager !== "undefined" && PurchaseManager.getPurchasedProducts) {
      if (PurchaseManager.getPurchasedProducts().includes(productId)) {
        return true;
      }
    }

    return false;
  };
}

// Inisialisasi Firebase Auth Listener
document.addEventListener("DOMContentLoaded", () => {
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const doc = await firebase.firestore().collection("users").doc(user.uid).get();
          if (doc.exists) {
            window.currentUserData = doc.data();
          } else {
            window.currentUserData = { isPremium: false, purchasedProducts: [] };
          }
        } catch (err) {
          console.error("Gagal mengambil data user dari Firestore:", err);
          window.currentUserData = null;
        }
      } else {
        window.currentUserData = null;
      }

      window.authInitialized = true;
      window.dispatchEvent(new Event("authReady"));
    });
  } else {
    // Jika Firebase tidak terpasang/digunakan
    window.authInitialized = true;
    window.dispatchEvent(new Event("authReady"));
  }
});

// Global State & Auth Management
window.currentUserData = null;
window.authInitialized = false;

// Helper untuk menunggu proses Firebase Auth & Firestore selesai
window.ensureAuthReady = function () {
  return new Promise((resolve) => {
    if (window.authInitialized) {
      return resolve(window.currentUserData);
    }
    window.addEventListener("authReady", () => {
      resolve(window.currentUserData);
    }, { once: true });
  });
};

// Fungsi pemeriksaan akses global
window.canAccessContent = async function (productId) {
  const userData = await window.ensureAuthReady();

  // 1. Jika pengguna memiliki status isPremium global (Akses Semua Konten)
  if (userData && userData.isPremium === true) {
    return true;
  }

  // 2. Jika pengguna membeli produk spesifik/eceran
  if (userData && Array.isArray(userData.purchasedProducts)) {
    if (userData.purchasedProducts.includes(productId)) {
      return true;
    }
  }

  // 3. Fallback ke PurchaseManager lokal
  if (typeof PurchaseManager !== "undefined" && PurchaseManager.getPurchasedProducts) {
    if (PurchaseManager.getPurchasedProducts().includes(productId)) {
      return true;
    }
  }

  return false;
};

// Inisialisasi Firebase Auth Listener
document.addEventListener("DOMContentLoaded", () => {
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const doc = await firebase.firestore().collection("users").doc(user.uid).get();
          if (doc.exists) {
            window.currentUserData = doc.data();
          } else {
            window.currentUserData = { isPremium: false, purchasedProducts: [] };
          }
        } catch (err) {
          console.error("Gagal mengambil data user dari Firestore:", err);
          window.currentUserData = null;
        }
      } else {
        window.currentUserData = null;
      }

      window.authInitialized = true;
      window.dispatchEvent(new Event("authReady"));
    });
  }
});
