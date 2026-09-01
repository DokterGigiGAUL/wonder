// ==========================================
// AUTHENTICATION & ACCESS GUARD (js/auth.js)
// ==========================================

// Global state inisialisasi
window.currentUserData = window.currentUserData || null;
window.authInitialized = window.authInitialized || false;

// Helper penunggu kesiapan data autentikasi
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

// Fungsi Guard Akses Konten
window.canAccessContent = async function (productId) {
  const userData = await window.ensureAuthReady();

  // 1. Jika pengguna berstatus isPremium true (All-Access)
  if (userData && userData.isPremium === true) {
    return true;
  }

  // 2. Jika produk dibeli eceran dari Firestore
  if (userData && Array.isArray(userData.purchasedProducts) && userData.purchasedProducts.includes(productId)) {
    return true;
  }

  // 3. Fallback PurchaseManager (Lokal/Mayar)
  if (typeof PurchaseManager !== "undefined" && PurchaseManager.getPurchasedProducts) {
    if (PurchaseManager.getPurchasedProducts().includes(productId)) {
      return true;
    }
  }

  return false;
};

// Pengelolaan Modal UI Login
function openLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Fungsi Auth Firebase
function loginEmail() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Harap masukkan email dan password!");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      closeLogin();
    })
    .catch((error) => {
      console.error("Error login:", error.message);
      alert("Gagal login: " + error.message);
    });
}

function registerEmail() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Harap masukkan email dan password untuk mendaftar!");
    return;
  }

  if (password.length < 6) {
    alert("Password minimal 6 karakter!");
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      closeLogin();
    })
    .catch((error) => {
      console.error("Error registrasi:", error.message);
      alert("Gagal mendaftar: " + error.message);
    });
}

function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => {
      closeLogin();
    })
    .catch((error) => {
      console.error("Error Google Auth:", error.message);
      alert("Gagal login dengan Google: " + error.message);
    });
}

function logout() {
  firebase.auth().signOut()
    .then(() => {
      alert("Anda telah keluar.");
    })
    .catch((error) => {
      console.error("Error logout:", error.message);
      alert("Gagal keluar: " + error.message);
    });
}

// Event Listener Utama Listener Auth State
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // Toggle tombol header
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";

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
        // Toggle tombol header
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";

        // User anonim
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
