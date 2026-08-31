// js/auth.js

// Global State Akses User
window.currentUser = null;
window.userAccess = {
  isPremium: false,
  premiumUntil: null,
  ownedProducts: []
};

// --- 1. SINKRONISASI DETIL AKUN DARI/KE FIRESTORE ---
function syncUserToFirestore(user) {
  if (!user || typeof firebase === 'undefined') return;

  const db = firebase.firestore();
  const userRef = db.collection("users").doc(user.uid);

  // Dapatkan data dokumen user
  userRef.get().then((docSnap) => {
    if (docSnap.exists) {
      const data = docSnap.data();
      
      // Simpan status ke memori global browser
      window.userAccess.isPremium = data.isPremium || false;
      window.userAccess.premiumUntil = data.premiumUntil || null;
      window.userAccess.ownedProducts = data.ownedProducts || [];

      console.log("Akses User Berhasil Dimuat dari Firestore:", window.userAccess);

      // PANGCIL EVENT UNTUK MEMBERI TAHU INDEX.JS BAHWA DATA AKSES SUDAH SIAP
      window.dispatchEvent(new CustomEvent('userAccessReady', { detail: window.userAccess }));
    }

    // Update login terakhir tanpa menimpa data transaksi
    userRef.set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

  }).catch((error) => {
    console.error("Gagal membaca Firestore:", error);
  });
}

// --- 2. FUNGSI PENGECEKAN HAK AKSES KONTEN (UTAMA) ---
/**
 * Memeriksa apakah user berhak membuka konten tertentu
 * @param {string} contentId - ID dari modul/konten (misal: 'tts-5', 'quiz-1', 'komik-3')
 * @returns {boolean} true jika punya akses, false jika terkunci
 */
window.canAccessContent = function(contentId) {
  // 1. Jika User adalah Member Premium aktif -> Bebas Akses Semua Konten
  if (window.userAccess.isPremium) {
    if (window.userAccess.premiumUntil) {
      let expiryDate;
      const rawDate = window.userAccess.premiumUntil;

      // Handling aman untuk format Timestamp Firestore, ISO String, atau JS Date
      if (rawDate && typeof rawDate.toDate === 'function') {
        expiryDate = rawDate.toDate();
      } else if (rawDate && rawDate.seconds) {
        expiryDate = new Date(rawDate.seconds * 1000);
      } else {
        expiryDate = new Date(rawDate);
      }

      if (!isNaN(expiryDate.getTime()) && expiryDate > new Date()) {
        return true;
      }
    } else {
      return true; // Premium permanen/tanpa tanggal expired
    }
  }

  // 2. Jika User membeli konten eceran ini secara spesifik (Cek via contentId atau productId)
  if (contentId && window.userAccess.ownedProducts && Array.isArray(window.userAccess.ownedProducts)) {
    if (window.userAccess.ownedProducts.includes(contentId)) {
      return true;
    }
  }

  // 3. Konten Terkunci
  return false;
};

// --- 3. HELPER MODAL LOGIN ---
function openLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('show');
}

function closeLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('show');
}

// --- 4. AUTHENTICATION ACTIONS ---
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      syncUserToFirestore(result.user);
      closeLogin();
    })
    .catch((err) => alert("Gagal Login Google: " + err.message));
}

function loginEmail() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value.trim();

  if (!email || !password) return alert("Harap isi email dan password.");

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((result) => {
      syncUserToFirestore(result.user);
      closeLogin();
    })
    .catch((err) => alert("Gagal Login: " + err.message));
}

function registerEmail() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value.trim();

  if (!email || !password) return alert("Harap isi email dan password.");
  if (password.length < 6) return alert("Password minimal 6 karakter.");

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((result) => {
      alert("Pendaftaran berhasil!");
      
      // Inisialisasi dokumen baru di Firestore
      firebase.firestore().collection("users").doc(result.user.uid).set({
        uid: result.user.uid,
        email: result.user.email,
        isPremium: false,
        ownedProducts: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      closeLogin();
    })
    .catch((err) => alert("Gagal Mendaftar: " + err.message));
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.reload();
  });
}

// --- 5. AUTOMATIC AUTH STATE LISTENER ---
firebase.auth().onAuthStateChanged((user) => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user) {
    window.currentUser = user;
    syncUserToFirestore(user);

    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    window.currentUser = null;
    window.userAccess = { isPremium: false, premiumUntil: null, ownedProducts: [] };

    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';

    // Panggil re-render jika logout
    window.dispatchEvent(new CustomEvent('userAccessReady', { detail: window.userAccess }));
  }
});
