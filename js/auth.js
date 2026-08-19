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
  if (modal) modal.style.display = 'block';
}

function closeLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'none';
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
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

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
      alert("Gagal login: " + error.message);
    });
}

// 3. Registrasi Akun Baru via Email
function registerEmail() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    alert("Harap isi email dan password untuk mendaftar.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((result) => {
      alert("Pendaftaran berhasil!");
      closeLogin();
    })
    .catch((error) => {
      alert("Gagal mendaftar: " + error.message);
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

// Fungsi Pengecekan Akses Firestore
function checkUserAccess(uid) {
  db.collection('users').doc(uid).get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        window.userAccess = {
          isPremium: data.isPremium || false,
          subscriptionExpiry: data.subscriptionExpiry || null,
          purchasedItems: data.purchasedItems || []
        };
        console.log("Akses User Dimuat:", window.userAccess);
      } else {
        console.log("Dokumen user belum ada di Firestore (User Baru/Belum pernah transaksi).");
      }
    })
    .catch((error) => {
      console.error("Gagal mengambil data akses user:", error);
    });
}
