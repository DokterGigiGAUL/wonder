/*
 * --------------------------------------------------------------------------
 * purchase-manager.js
 * --------------------------------------------------------------------------
 */

const PurchaseManager = (() => {

    const STORAGE_KEY = "wonderapp_purchases";

    function getPurchasedProducts() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
        } catch (e) {
            console.error("[PurchaseManager] Failed to parse localStorage:", e);
            return [];
        }
    }

    function savePurchasedProducts(products) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(products || [])
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
        if (typeof Premium !== "undefined") {
            if (isPremiumActive) {
                console.log("✅ [PurchaseManager] Premium Aktif");
                Premium.enable(profile.premiumUntil);
            } else {
                console.log("🔒 [PurchaseManager] Mode Free / Non-Premium");
                Premium.disable();
            }
        }
    }

    function hasAccess(item) {
        if (!item) return false;

        // 1. Jika konten bukan premium/gratis
        if (!item.premium) {
            return true;
        }

        // 2. Jika user memiliki status langganan Premium (global)
        if (typeof Premium !== "undefined" && Premium.isPremium()) {
            return true;
        }

        // 3. Cek apakah produk dibeli secara individu (di-save ke localStorage)
        const products = getPurchasedProducts();
        if (item.productId && products.includes(item.productId)) {
            return true;
        }

        // 4. Cek status aktif dari backend API (jika fungsi ketersediaan didefinisikan)
        if (item.productId && typeof getBackendProduct === "function") {
            const backendProd = getBackendProduct(item.productId);
            if (backendProd?.status === "active") {
                return true;
            }
        }

        return false;
    }

    function hasTTSPremium() {

        if (typeof Premium !== "undefined" && Premium.isPremium()) {
            return true;
        }

        return getPurchasedProducts().some(id =>
            typeof id === "string" && id.startsWith("tts")
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
        if (typeof Premium !== "undefined") {
            Premium.disable();
        }
    }

    async function refreshPurchases() {

        // FIX: Perbaikan pengambil user Firebase yang aman
        const user = typeof firebase !== "undefined" && firebase.auth ? firebase.auth().currentUser : null;

        if (!user) {
            clear();
            return;
        }

        if (typeof WonderAPI !== "undefined" && WonderAPI.getProfile) {
            try {
                const response = await WonderAPI.getProfile({
                    uid: user.uid
                });
                if (response?.data) {
                    sync(response.data);
                }
            } catch (err) {
                console.error("[PurchaseManager] Gagal refresh profile:", err);
            }
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

        if (typeof firebase === "undefined" || !firebase.auth) {
            throw new Error("SDK Firebase Auth belum dimuat.");
        }

        const user = firebase.auth().currentUser;

        if (!user) {
            throw new Error("User belum login.");
        }

        const displayName =
            user.displayName ||
            user.email ||
            "Wonder App User";

        const email = user.email || "";

        const mobile =
            user.phoneNumber ||
            "081234567890";

        // FIX: Keamanan CORS untuk iframe window redirect
        let redirectUrl = window.location.href;
        try {
            redirectUrl = window.parent.location.href;
        } catch (e) {
            console.warn("[Purchase] Unable to access parent frame URL, fallback to self:", e);
        }

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

        window.top.location.href = checkoutUrl;

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
