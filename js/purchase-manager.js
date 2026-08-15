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

        // ------------------------------------------------------------------
        // PENYESUAIAN REALTIME FIRESTORE TIMESTAMP
        // ------------------------------------------------------------------
        let isPremiumActive = false;

        // 1. Cek flag isPremium eksplisit jika ada
        if (profile.isPremium === true) {
            isPremiumActive = true;
        }

        // 2. Evaluasi tanggal masa aktif premium (premiumUntil)
        if (profile.premiumUntil) {
            let expirationDate = null;

            // Jika formatnya adalah Firestore Timestamp (memiliki metode .toDate())
            if (typeof profile.premiumUntil.toDate === "function") {
                expirationDate = profile.premiumUntil.toDate();
            } 
            // Jika formatnya berupa string/number/Date standar
            else {
                expirationDate = new Date(profile.premiumUntil);
            }

            // Aktifkan jika tanggal kadaluarsa masih di masa depan
            if (expirationDate && expirationDate > new Date()) {
                isPremiumActive = true;
            }
        }

        // 3. Eksekusi pengaktifan/penonaktifan modul Premium
        if (isPremiumActive) {
            console.log("✅ [PurchaseManager] Premium Aktif");
            Premium.enable(profile.premiumUntil);
        } else {
            console.log("🔒 [PurchaseManager] Mode Free / Non-Premium");
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

        // Catatan: Jika menggunakan realtime listener di auth.js,
        // fungsi refreshPurchases ini opsional / fallback manual saja.
        if (typeof WonderAPI !== "undefined" && WonderAPI.getProfile) {
            const response = await WonderAPI.getProfile({
                uid: user.uid
            });
            sync(response.data);
        }
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

        const user = firebase.auth().currentUser;

        if (!user) {
            throw new Error("User belum login.");
        }

        const displayName =
            user.displayName ||
            user.email ||
            "Wonder App User";

        const email =
            user.email || "";

        /*
         * Mayar membutuhkan mobile.
         * Untuk simulasi sandbox gunakan nomor dummy.
         */
        const mobile =
            user.phoneNumber ||
            "081234567890";

        /*
         * Kembali ke halaman aplikasi setelah checkout.
         */
        const redirectUrl =
            window.parent.location.href;

        console.log("[Purchase] UID:", user.uid);
        console.log("[Purchase] Name:", displayName);
        console.log("[Purchase] Email:", email);
        console.log("[Purchase] Mobile:", mobile);
        console.log("[Purchase] Redirect:", redirectUrl);

        const response =
            await WonderAPI.createCheckout({

                uid: user.uid,

                productId: productId,

                displayName: displayName,

                email: email,

                mobile: mobile,

                redirectUrl: redirectUrl

            });

        console.log(
            "[Purchase] createCheckout:",
            response
        );

        const checkoutUrl =
            response.data?.checkoutUrl;

        if (!checkoutUrl) {
            throw new Error(
                "checkoutUrl tidak ditemukan."
            );
        }

        console.log(
            "[Purchase] CHECKOUT BERHASIL"
        );

        window.top.location.href =
            checkoutUrl;

    } catch (error) {

        console.error(
            "[Purchase] ERROR:",
            error
        );

        alert(
            "Checkout gagal\n\n" +
            error.message
        );

        throw error;
    }
}
