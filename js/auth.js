/*
|--------------------------------------------------------------------------
| auth.js
|--------------------------------------------------------------------------


const googleProvider = new firebase.auth.GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});
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

        const result = await auth.signInWithEmailAndPassword(
            email,
            password
        );

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

        const result = await auth.createUserWithEmailAndPassword(
            email,
            password
        );

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

        const result = await auth.signInWithPopup(
            googleProvider
        );

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

    PurchaseManager.clear();

    await auth.signOut();

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
    return auth.currentUser;
}

function onUserChanged(callback) {
    auth.onAuthStateChanged(callback);
}

/* -------------------------------------------------------------------------- */
/* APP START */
/* -------------------------------------------------------------------------- 

auth.onAuthStateChanged(async (user) => {

    updateAuthUI(user);

    if (!user) {

        PurchaseManager.clear();
        return;

    }

    try {

        await syncUser(user);

        const response = await loadProfile();

console.log(response.data);

PurchaseManager.sync(response.data);
    } catch (err) {

        console.error(err);

    }

});*/
/* -------------------------------------------------------------------------- */
/* APP START (UPDATED FOR REALTIME PREMIUM SYNC)                              */
/* -------------------------------------------------------------------------- 

let unsubscribeUserDoc = null; // Menyimpan listener agar tidak menumpuk

auth.onAuthStateChanged(async (user) => {

    updateAuthUI(user);

    // Jika user logout, hentikan listener dan bersihkan PurchaseManager
    if (!user) {
        if (unsubscribeUserDoc) {
            unsubscribeUserDoc();
            unsubscribeUserDoc = null;
        }
        PurchaseManager.clear();
        return;
    }

    try {
        // 1. Pastikan profil dasar user tersinkron di Firestore
        await syncUser(user);

        // 2. Pasang Realtime Listener ke Firestore agar status premium ter-update OTOMATIS
        const userDocRef = db.collection("users").doc(user.uid);

        // Hentikan listener lama jika ada
        if (unsubscribeUserDoc) unsubscribeUserDoc();

        unsubscribeUserDoc = userDocRef.onSnapshot((docSnap) => {
            if (docSnap.exists) {
                const userData = docSnap.data();
                console.log("Data Firestore Terbaru Received:", userData);

                // Sinkronkan data Firestore (termasuk premiumUntil & ownedProducts) ke PurchaseManager
                PurchaseManager.sync(userData);
            } else {
                console.warn("Dokumen user tidak ditemukan di Firestore!");
            }
        }, (err) => {
            console.error("Realtime listener error:", err);
        });

    } catch (err) {
        console.error("Gagal inisialisasi user:", err);
    }

});*/

/* -------------------------------------------------------------------------- */
/* REALTIME FIRESTORE LISTENER (APP START)                                    */
/* -------------------------------------------------------------------------- */

let unsubscribeUserDoc = null;

getAuthInstance().onAuthStateChanged((user) => {
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

    // Pasang listener Firestore secara aman menggunakan getDbInstance()
    try {
        if (unsubscribeUserDoc) unsubscribeUserDoc();

        const firestoreDb = getDbInstance(); // <--- Ambil instance Firestore di sini

        unsubscribeUserDoc = firestoreDb
            .collection("users")
            .doc(user.uid)
            .onSnapshot((docSnap) => {
                if (docSnap.exists) {
                    const userData = docSnap.data();
                    console.log("🔥 Firestore Data Received:", userData);

                    if (typeof PurchaseManager !== "undefined") {
                        PurchaseManager.sync(userData);
                    }
                }
            }, (err) => {
                console.error("Firestore Listener Error:", err);
            });
    } catch (err) {
        console.error("Auth Init Error:", err);
    }
});

/* -------------------------------------------------------------------------- */
/* LOGIN MODAL */
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

/* -------------------------------------------------------------------------- */
/* LOGIN EMAIL BUTTON */
/* -------------------------------------------------------------------------- */

async function loginEmail() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const result = await login(email, password);

    if (result.success) {
        closeLogin();
    }

}

/* -------------------------------------------------------------------------- */
/* REGISTER BUTTON */
/* -------------------------------------------------------------------------- */

async function registerEmail() {

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const result = await register(email, password);

    if (result.success) {
        closeLogin();
    }

}

/* -------------------------------------------------------------------------- */
/* GOOGLE BUTTON */
/* -------------------------------------------------------------------------- */

async function loginGoogle() {

    const result = await loginWithGoogle();

    if (result.success) {
        closeLogin();
    }

}
