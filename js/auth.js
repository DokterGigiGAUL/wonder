window.currentUserData = window.currentUserData || null;
window.authInitialized = window.authInitialized || false;

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

window.canAccessContent = async function (productId) {
  const userData = await window.ensureAuthReady();

  // Jika belum login / anonim, kunci akses
  if (!userData) {
    return false;
  }

  // 1. Jika pengguna berstatus isPremium true (All-Access)
  if (userData.isPremium === true) {
    return true;
  }

  // 2. Jika produk dibeli eceran
  if (Array.isArray(userData.purchasedProducts) && userData.purchasedProducts.includes(productId)) {
    return true;
  }

  // 3. Fallback PurchaseManager
  if (typeof PurchaseManager !== "undefined" && PurchaseManager.getPurchasedProducts) {
    if (PurchaseManager.getPurchasedProducts().includes(productId)) {
      return true;
    }
  }

  return false;
};

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
          console.error("Gagal membaca Firestore:", err);
          window.currentUserData = { isPremium: false, purchasedProducts: [] };
        }
      } else {
        // User logout/anonim -> set data kosong agar tidak dianggap null berlarut-larut
        window.currentUserData = { isPremium: false, purchasedProducts: [] };
      }

      window.authInitialized = true;
      window.dispatchEvent(new Event("authReady"));
    });
  } else {
    window.currentUserData = { isPremium: false, purchasedProducts: [] };
    window.authInitialized = true;
    window.dispatchEvent(new Event("authReady"));
  }
});
