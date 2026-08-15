/*
|--------------------------------------------------------------------------
| premium.js
|--------------------------------------------------------------------------
*/

const PREMIUM_SUBSCRIPTION_ID = "premium-monthly";

function openPremiumModal(productId = null) {
    const modal = document.getElementById("premiumModal");
    const frame = document.getElementById("premiumFrame");

    sessionStorage.setItem("returnPage", window.location.href);

    frame.src = productId
        ? `premium.html?product=${encodeURIComponent(productId)}`
        : "premium.html";

    modal.classList.add("show");
}

function closePremiumModal() {
    const modal = document.getElementById("premiumModal");
    const frame = document.getElementById("premiumFrame");

    modal.classList.remove("show");
    frame.src = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("closePremiumModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closePremiumModal);
    }
});

function showPremiumDialog(productId = null) {
    openPremiumPage(productId);
}

const Premium = {

    data: null,

    async load() {
        const user = auth.currentUser;
        if (!user) {
            this.disable();
            return;
        }

        const response = await WonderAPI.getProfile({
            uid: user.uid
        });

        this.data = response.data;
        PurchaseManager.sync(response.data);
    },

    isPremium() {
        if (!this.data) return false;

        // Cek jika ada flag isPremium bernilai true secara langsung
        if (this.data.isPremium === true) return true;

        if (!this.data.premiumUntil) return false;

        // PERBAIKAN: Handing Firestore Timestamp vs Date String
        let untilDate = null;
        if (typeof this.data.premiumUntil.toDate === "function") {
            untilDate = this.data.premiumUntil.toDate();
        } else {
            untilDate = new Date(this.data.premiumUntil);
        }

        return untilDate > new Date();
    },

    ownsProduct(productId) {
        return (
            this.data?.ownedProducts || []
        ).includes(productId);
    },

    enable(until) {
        this.data = this.data || {};
        this.data.premiumUntil = until;

        // Update class pada body untuk membuka CSS/UI yang terkunci
        document.body.classList.add("is-premium");

        // Jika ada fungsi render UI di aplikasi Dokter, panggil di sini
        if (typeof renderApp === "function") renderApp();
        if (typeof updateUI === "function") updateUI();
    },

    disable() {
        this.data = this.data || {};
        this.data.premiumUntil = null;

        document.body.classList.remove("is-premium");

        if (typeof renderApp === "function") renderApp();
        if (typeof updateUI === "function") updateUI();
    }

};

function userHasPremium() {
    return Premium.isPremium();
}

async function buyProduct(productId) {
    if (!auth.currentUser) {
        const result = await loginWithGoogle();
        if (!result.success) return;
    }

    const user = auth.currentUser;

    const item =
        (typeof quizzes !== "undefined" ? quizzes.find(q => q.productId === productId) : null) ||
        (typeof comics !== "undefined" ? comics.find(c => c.productId === productId) : null) ||
        (typeof ttsList !== "undefined" ? ttsList.find(t => t.productId === productId) : null) ||
        (typeof cases !== "undefined" ? cases.find(c => c.productId === productId) : null);

    if (!item) {
        alert("Produk tidak ditemukan.");
        return;
    }

    const response = await WonderAPI.createCheckout({
        uid: user.uid,
        productId,
        displayName: user.displayName || "",
        email: user.email || "",
        mobile: "081234567890",
        redirectUrl: sessionStorage.getItem("returnPage")
    });

    window.location.href = response.data.checkoutUrl;
}

async function subscribePremium() {
    if (!auth.currentUser) {
        const result = await loginWithGoogle();
        if (!result.success) return;
    }

    const user = auth.currentUser;

    const response = await WonderAPI.createCheckout({
        uid: user.uid,
        productId: PREMIUM_SUBSCRIPTION_ID,
        displayName: user.displayName || "",
        email: user.email || "",
        mobile: "081234567890",
        redirectUrl: sessionStorage.getItem("returnPage")
    });

    window.location.href = response.data.checkoutUrl;
}

function openPremiumPage(productId = null) {
    openPremiumModal(productId);
}
