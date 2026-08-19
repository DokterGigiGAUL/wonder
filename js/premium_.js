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

        if (!this.data.premiumUntil) return false;

        return new Date(this.data.premiumUntil) > new Date();

    },

    ownsProduct(productId) {

        return (
            this.data?.ownedProducts || []
        ).includes(productId);

    },

    enable(until) {

        this.data = this.data || {};

        this.data.premiumUntil = until;

    },

    disable() {

        this.data = this.data || {};

        this.data.premiumUntil = null;

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
        quizzes.find(q => q.productId === productId) ||
        comics.find(c => c.productId === productId) ||
        ttsList.find(t => t.productId === productId) ||
        cases.find(c => c.productId === productId);

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
