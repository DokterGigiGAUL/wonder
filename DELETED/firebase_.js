// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJ7AdX6rrE0OylKkPYx-UWYjtYj-y4QWg",
    authDomain: "wonder-app-2426.firebaseapp.com",
    projectId: "wonder-app-2426",
    storageBucket: "wonder-app-2426.firebasestorage.app",
    messagingSenderId: "274978911943",
    appId: "1:274978911943:web:b5c763f8a8b29dc86ff0e2"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Firebase Auth
const auth = firebase.auth();


// Expose Auth globally
window.auth = auth;


console.log("Firebase initialized.");
console.log("Firebase Auth available:", !!window.auth);


/**
 * Sync user ke Backend GAS
 */
async function syncUser(user) {

    return await WonderAPI.syncUser({
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || ""
    });

}


/**
 * Ambil profile dari Backend GAS
 */
async function loadProfile() {

    const user = auth.currentUser;

    if (!user) {
        throw new Error("User belum login.");
    }

    return await WonderAPI.getProfile({
        uid: user.uid
    });

}
