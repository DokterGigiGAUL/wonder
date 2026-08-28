// js/auth.js

// Global State User & Status Akses
window.currentUser = null;
window.userAccess = {
  isPremium: false,
  subscriptionExpiry: null,
  purchasedItems: []
};

// --- FUNGSI SINKRONISASI KE FIRESTORE DATABASE ---
function syncUserToFirestore(user) {
  if (!user || typeof firebase === 'undefined') return;

  // Inisialisasi Firestore secara mandiri di dalam JS
  const db = firebase.firestore();

  // Simpan/Perbarui dokumen users/{uid} di Firestore
  db.collection("users").doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }) // merge: true agar transaksi Mayar tidak hilang/tertimpa
  .then(() => {
    console.log("Firestore Sync Success: Dokumen users/" + user.uid + " siap!");
  })
  .catch((error) => {
    console.error("Firestore Sync Error:", error);
  });
}

// --- PENGELOLA MODAL LOGIN ---
function openLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('show');
}

function closeLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('show');
}

// --- FUNGSI AUTHENTICATION ---

// 1. Login/Daftar dengan Google
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      console.log("Berhasil login via Google:", result.user.email);
      syncUserToFirestore(result.user);
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

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((result) => {
      console.log("Berhasil login via Email:", result.user.email);
      syncUserToFirestore(result.user);
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

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((result) => {
      alert("Pendaftaran berhasil! Anda otomatis terlogin.");
      
      const db = firebase.firestore();
      db.collection("users").doc(result.user.uid).set({
        uid: result.user.uid,
        email: result.user.email,
        isPremium: false,
        ownedProducts: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

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
  firebase.auth().signOut().then(() => {
    console.log("User logged out");
  }).catch((error) => {
    console.error("Error logout:", error);
  });
}

// --- DETEKSI STATE USER & SINKRONISASI AUTOMATIS ---
firebase.auth().onAuthStateChanged((user) => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user) {
    window.currentUser = user;

    // OTOMATIS MEMBUAT/UPDATE DOKUMEN DI FIRESTORE
    syncUserToFirestore(user);

    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';

    checkUserAccess(user.uid);
  } else {
    window.currentUser = null;
    window.userAccess = {
      isPremium: false,
      subscriptionExpiry: null,
      purchasedItems: []
    };

    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';

    console.log("Status: Guest User");
  }
});

// Fungsi Pengecekan Akses via Google Apps Script (GAS)
function checkUserAccess(uid) {
  if (!window.currentUser || !window.currentUser.email) return;

  const userEmail = encodeURIComponent(window.currentUser.email.toLowerCase());
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxizPnrzJKftQuEpt0OOKrp_KSpFyw7JDsiHOxY1k1nvKLXPH9ZSlrkYqufc7iQGifr/exec";

  fetch(`${GAS_URL}?email=${userEmail}`)
    .then((res) => res.json())
    .then((data) => {
      window.userAccess = {
        isPremium: data.hasAccess || false,
        subscriptionExpiry: null,
        product: ""
      };
      console.log("Status Akses Premium Terverifikasi via GAS:", window.userAccess);
    })
    .catch((error) => {
      console.error("Gagal mengambil data akses dari GAS:", error);
    });
}

// Redirect otomatis ke Mayar jika diperlukan
firebase.auth().onAuthStateChanged((user) => {
  if (user && localStorage.getItem("autoRedirectMayar") === "true") {
    localStorage.removeItem("autoRedirectMayar");
    
    const modal = document.getElementById('premiumModal');
    if (modal) modal.classList.remove('show');

    const MAYAR_URL = "https://wonderapp.mayar.shop/m/akses-premium-wonder-app";
    window.open(`${MAYAR_URL}?email=${encodeURIComponent(user.email)}&uid=${user.uid}`, '_blank');
  }
});
