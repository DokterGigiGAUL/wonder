/*
|--------------------------------------------------------------------------
| purchase-manager.js
|--------------------------------------------------------------------------
*/

const PurchaseManager = (() => {

    const STORAGE_KEY = "wonderapp_purchases";

    function getPurchasedProducts() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    }

    function savePurchasedProducts(products) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(products)
        );
    }

    function sync(profile = {}) {

        const products = profile.ownedProducts || [];

        savePurchasedProducts(products);

        if (profile.premiumUntil) {
            Premium.enable(profile.premiumUntil);
        } else {
            Premium.disable();
        }

    }

    function hasAccess(item) {

        if (!item.premium) {
            return true;
        }

        if (Premium.isPremium()) {
            return true;
        }

        const products = getPurchasedProducts();

        return (
            item.productId &&
            products.includes(item.productId)
        );

    }

    function hasTTSPremium() {

        if (Premium.isPremium()) {
            return true;
        }

        return getPurchasedProducts().some(id =>
            id.startsWith("tts")
        );

    }

    function purchase() {
        // Backend only
    }

    function revoke() {
        // Backend only
    }

    function clear() {

        localStorage.removeItem(STORAGE_KEY);

        Premium.disable();

    }

    async function refreshPurchases() {

        const user = auth.currentUser;

        if (!user) {

            clear();
            return;

        }

        const response = await WonderAPI.getProfile({
            uid: user.uid
        });

        sync(response.data);

    }

    return {

        sync,
        refreshPurchases,
        hasAccess,
        hasTTSPremium,
        clear,
        getPurchasedProducts,
        purchase,
        revoke

    };

})();

async function purchaseProduct(productId) {
    console.log("=================================");
    console.log("[Purchase] START");
    console.log("[Purchase] productId:", productId);

    try {

        if (!productId) {
            throw new Error("productId kosong");
        }

        /*
         * Ambil user dari PurchaseManager / auth
         * yang sudah digunakan WonderApp.
         */
        const user = firebase?.auth?.().currentUser;

        console.log("[Purchase] user:", user);

        if (!user) {
            throw new Error("User belum login");
        }

        const idToken = await user.getIdToken();

        console.log("[Purchase] UID:", user.uid);
        console.log("[Purchase] Email:", user.email);
        console.log("[Purchase] Token berhasil diperoleh");

        /*
         * BACKEND_URL harus merupakan URL GAS
         * yang sudah digunakan WonderApp.
         */
        console.log("[Purchase] BACKEND_URL:", BACKEND_URL);

        const response = await fetch(
            `${BACKEND_URL}?action=createCheckout`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    token: idToken,
                    uid: user.uid,
                    email: user.email,
                    productId: productId
                })
            }
        );

        console.log(
            "[Purchase] HTTP:",
            response.status
        );

        const text = await response.text();

        console.log(
            "[Purchase] RAW RESPONSE:",
            text
        );

        let result;

        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error(
                "Response backend bukan JSON: " + text
            );
        }

        console.log(
            "[Purchase] JSON:",
            result
        );

        if (!result.success) {
            throw new Error(
                result.message ||
                result.code ||
                "createCheckout gagal"
            );
        }

        const checkoutUrl =
            result.data?.checkoutUrl ||
            result.data?.checkout_url;

        console.log(
            "[Purchase] checkoutUrl:",
            checkoutUrl
        );

        if (!checkoutUrl) {
            throw new Error(
                "checkoutUrl tidak ditemukan dalam response backend"
            );
        }

        console.log(
            "[Purchase] REDIRECT MAYAR"
        );

        window.location.href = checkoutUrl;

    } catch (error) {

        console.error(
            "[Purchase] ERROR:",
            error
        );

        console.error(
            "[Purchase] ERROR MESSAGE:",
            error.message
        );

        alert(
            "Checkout gagal:\n\n" +
            error.message
        );

        throw error;
    }
}
      "Terjadi kesalahan saat membuat pembayaran."
    );
  }
}
