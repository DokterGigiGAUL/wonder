/*
|--------------------------------------------------------------------------
| auth.js
|--------------------------------------------------------------------------
*/

// Gunakan instance firebase.auth() & firestore() secara aman
function getAuthInstance() {
    return window.auth || firebase.auth();
}

function getDbInstance() {
    return window.db || firebase.firestore();
}

const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/* -------------------------------------------------------------------------- */
/* LOGIN EMAIL */
/* -------------------------------------------------------------------------- */

async function login(email, password) {
    try {
        const authInst = getAuthInstance(); // <--- Disesuaikan agar aman
        const result = await authInst.signInWithEmailAndPassword(email, password);

        return {
            success: true,
            user: result.user
        };
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

/* -------------------------------------------------------------------------- */
/* REGISTER */
/* -------------------------------------------------------------------------- */

async function register(email, password) {
    try {
        const authInst = getAuthInstance(); // <--- Disesuaikan agar aman
        const result = await authInst.createUserWithEmailAndPassword(email, password);

        return {
            success: true,
            user: result.user
        };
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

/* -------------------------------------------------------------------------- */
/* GOOGLE LOGIN */
/* -------------------------------------------------------------------------- */

async function loginWithGoogle() {
    try {
        const authInst = getAuthInstance(); // <--- Disesuaikan agar aman
        const result = await authInst.signInWithPopup(googleProvider);

        return {
            success: true,
            user: result.user
        };
    } catch (err) {
        return {
            success: false,
            message: err.message
        };
    }
}

/* -------------------------------------------------------------------------- */
/* LOGOUT */
/* -------------------------------------------------------------------------- */

async function logout() {
    if (typeof PurchaseManager !== "undefined") {
        PurchaseManager.clear();
    }
    const authInst = getAuthInstance(); // <--- Disesuaikan agar aman
    await authInst.signOut();
}

/* -------------------------------------------------------------------------- */
/* UI */
/* -------------------------------------------------------------------------- */

function updateAuthUI(user) {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!loginBtn || !logoutBtn) return;

    if (user) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "";
    } else {
        loginBtn.style.display = "";
        logoutBtn.style.display = "none";
    }
}

/* -------------------------------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------------------------------- */

function currentUser() {
    return getAuthInstance().currentUser;
}

function onUserChanged(callback) {
    getAuthInstance().onAuthStateChanged(callback);
}

/* -------------------------------------------------------------------------- */
/* REALTIME FIRESTORE LISTENER (APP START)                                    */
/* -------------------------------------------------------------------------- */

let unsubscribeUserDoc = null;

getAuthInstance().onAuthStateChanged(async (user) => {
    updateAuthUI(user);

    if (!user) {
        if (unsubscribeUserDoc) {
            unsubscribeUserDoc();
            unsubscribeUserDoc = null;
        }
        if (typeof PurchaseManager !== "undefined") {
            PurchaseManager.clear();
        }
        return;
    }

    try {
        if (unsubscribeUserDoc) unsubscribeUserDoc();

        const firestoreDb = getDbInstance();

        // 1. Jalankan syncUser jika fungsi tersebut ada di project Anda
        if (typeof syncUser === "function") {
            await syncUser(user);
        }

        // 2. Pasang Listener Firestore
        unsubscribeUserDoc = firestoreDb
            .collection("users")
            .doc(user.uid)
            .onSnapshot((docSnap) => {
                if (docSnap.exists) {
                    const userData = docSnap.data();
                    console.log("🔥 Firestore Data Received:", userData);

                    // Normalisasi Firestore Timestamp jika ada
                    if (userData.premiumUntil && typeof userData.premiumUntil.toDate === "function") {
                        userData.premiumUntil = userData.premiumUntil.toDate();
                    }

                    if (typeof PurchaseManager !== "undefined") {
    PurchaseManager.sync(userData);
    
    // Panggil re-render UI jika fungsi tersebut tersedia di halaman aktif
    if (typeof window.renderAllContent === "function") {
        window.renderAllContent();
    }
}
                    
                } else {
                    console.warn("Dokumen user tidak ditemukan di Firestore untuk UID:", user.uid);
                }
            }, (err) => {
                console.error("Firestore Listener Error:", err);
            });
    } catch (err) {
        console.error("Auth Init Error:", err);
    }
});

/* -------------------------------------------------------------------------- */
/* LOGIN MODAL & BUTTON HANDLERS                                              */
/* -------------------------------------------------------------------------- */

function getLoginModal() {
    return document.getElementById("loginModal");
}

function openLogin() {
    getLoginModal().classList.add("show");
}

function closeLogin() {
    getLoginModal().classList.remove("show");
}

async function loginEmail() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const result = await login(email, password);

    if (result.success) {
        closeLogin();
    }
}

async function registerEmail() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const result = await register(email, password);

    if (result.success) {
        closeLogin();
    }
}

async function loginGoogle() {
    const result = await loginWithGoogle();

    if (result.success) {
        closeLogin();
    }
}
