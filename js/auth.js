// js/auth.js

// Global State User & Status Akses
window.currentUser = null;
window.userAccess = {
  isPremium: false,
  subscriptionExpiry: null,
  purchasedItems: []
};

// --- PENGELOLA MODAL LOGIN ---
function openLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('show'); // Menggunakan class .show agar display: flex aktif
  }
}

function closeLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.remove('show'); // Menghapus class .show untuk menyembunyikan modal
  }
}

// --- FUNGSI AUTHENTICATION ---

// 1. Login/Daftar dengan Google
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log("Berhasil login via Google:", result.user.email);
      closeLogin();
    })
    .catch((error) => {
      alert("Gagal login dengan Google: " + error.message);
    });
}

// 2. Login dengan Email & Password
function loginEmail() {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  if (!email || !password) {
    alert("Harap isi email dan password.");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((result) => {
      console.log("Berhasil login via Email:", result.user.email);
      closeLogin();
    })
    .catch((error) => {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert("Email atau password salah. Jika belum punya akun, klik tombol 'Daftar'.");
      } else {
        alert("Gagal login: " + error.message);
      }
    });
}

// 3. Registrasi Akun Baru via Email
function registerEmail() {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  if (!email || !password) {
    alert("Harap isi email dan password untuk mendaftar.");
    return;
  }

  if (password.length < 6) {
    alert("Password minimal 6 karakter.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((result) => {
      alert("Pendaftaran berhasil! Anda otomatis terlogin.");
      closeLogin();
    })
    .catch((error) => {
      if (error.code === 'auth/email-already-in-use') {
        alert("Email ini sudah terdaftar. Silakan klik tombol 'Login'.");
      } else {
        alert("Gagal mendaftar: " + error.message);
      }
    });
}

// 4. Logout
function logout() {
  auth.signOut().then(() => {
    console.log("User logged out");
  }).catch((error) => {
    console.error("Error logout:", error);
  });
}

// --- DETEKSI STATE USER & QUERY ACCESS DARI FIRESTORE ---
auth.onAuthStateChanged((user) => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user) {
    window.currentUser = user;

    // Update Tampilan Tombol Header
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';

    // Ambil Data Status Akses dari Firestore
    checkUserAccess(user.uid);
  } else {
    window.currentUser = null;
    window.userAccess = {
      isPremium: false,
      subscriptionExpiry: null,
      purchasedItems: []
    };

    // Update Tampilan Tombol Header
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';

    console.log("Status: Guest User");
  }
});

// Fungsi Pengecekan Akses Firestore berdasarkan Email User
function checkUserAccess(uid) {
  if (!window.currentUser || !window.currentUser.email) return;

  const userEmail = window.currentUser.email.toLowerCase();
  const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, "_");

  // Query dokumen di koleksi premium_memberships
  db.collection('premium_memberships').doc(sanitizedEmail).get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        
        // Cek apakah tanggal kedaluwarsa masih berlaku
        const now = new Date();
        const expiry = data.subscriptionExpiry ? new Date(data.subscriptionExpiry) : null;
        const isValid = expiry ? expiry > now : false;

        window.userAccess = {
          isPremium: data.isPremium && isValid,
          subscriptionExpiry: data.subscriptionExpiry || null,
          product: data.product || ""
        };
        console.log("Status Akses Premium Terverifikasi:", window.userAccess);
      } else {
        window.userAccess = {
          isPremium: false,
          subscriptionExpiry: null,
          product: ""
        };
        console.log("User belum memiliki akses premium.");
      }
    })
    .catch((error) => {
      console.error("Gagal mengambil data akses premium:", error);
    });
}

// Otomatis redirect ke Mayar jika user baru saja login dari tombol Premium
if (typeof firebase !== 'undefined' && firebase.auth) {
  firebase.auth().onAuthStateChanged((user) => {
    if (user && localStorage.getItem("autoRedirectMayar") === "true") {
      // Hapus penanda agar tidak terpicu berulang kali
      localStorage.removeItem("autoRedirectMayar");

      // Buka link Mayar
      const MAYAR_PAYMENT_URL = "https://wonderapp.mayar.shop/m/akses-premium-wonder-app";
      const userEmail = encodeURIComponent(user.email);
      window.open(`${MAYAR_PAYMENT_URL}?email=${userEmail}`, '_blank');
    }
  });
}

