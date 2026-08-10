/*
 * --------------------------------------------------------------------------
 * purchase-manager.js
 * --------------------------------------------------------------------------
 */

const PurchaseManager = (() => {

    const STORAGE_KEY = "wonderapp_purchases";

function getPurchasedProducts() {
        return JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );
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


/*
 * --------------------------------------------------------------------------
 * UNIVERSAL PRODUCT CHECKOUT
 * --------------------------------------------------------------------------
 */

async function purchaseProduct(productId) {

    console.log("=================================");
    console.log("[Purchase] START");
    console.log("[Purchase] productId:", productId);

    try {

        if (!productId) {
            throw new Error("productId kosong");
        }

        /*
         * premium.html berjalan sendiri dan memiliki
         * Firebase Auth sendiri melalui firebase.js
         */
        const user = auth.currentUser;

        console.log("[Purchase] user:", user);

        if (!user) {
            throw new Error("User belum login.");
        }

        /*
         * Ambil Firebase ID Token
         */
        const token = await user.getIdToken();

        console.log("[Purchase] UID:", user.uid);
        console.log("[Purchase] Email:", user.email);
        console.log("[Purchase] Token berhasil diperoleh");

        /*
         * Gunakan API resmi WonderApp.
         * Tidak membuat fetch / BACKEND_URL baru.
         */
        const response = await WonderAPI.createCheckout({

            token: token,

            uid: user.uid,

            email: user.email,

            productId: productId

        });

        console.log(
            "[Purchase] createCheckout response:",
            response
        );

        /*
         * Ambil checkout URL dari response backend.
         */
        const checkoutUrl =
            response.data?.checkoutUrl ||
            response.data?.checkout_url;

        if (!checkoutUrl) {

            throw new Error(
                "checkoutUrl tidak ditemukan dalam response."
            );
        }

        console.log(
            "[Purchase] Checkout berhasil dibuat."
        );

        console.log(
            "[Purchase] Redirect ke Mayar:",
            checkoutUrl
        );

        /*
         * Redirect ke halaman pembayaran Mayar.
         */
        window.top.location.href = checkoutUrl;

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
