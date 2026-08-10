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
  try {
    if (!productId) {
      console.error("[Purchase] productId kosong");
      return;
    }

    const user = firebase.auth().currentUser;

    if (!user) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    console.log("[Purchase] Memulai pembelian:", productId);

    const idToken = await user.getIdToken();

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

    const result = await response.json();

    console.log("[Purchase] createCheckout response:", result);

    if (!result.success) {
      console.error(
        "[Purchase] createCheckout gagal:",
        result
      );

      alert(
        result.message ||
        "Checkout gagal dibuat."
      );

      return;
    }

    const checkoutUrl =
      result.data?.checkoutUrl ||
      result.data?.checkout_url;

    if (!checkoutUrl) {
      console.error(
        "[Purchase] checkoutUrl tidak ditemukan:",
        result
      );

      alert(
        "Checkout berhasil dibuat, tetapi URL pembayaran tidak ditemukan."
      );

      return;
    }

    console.log(
      "[Purchase] Checkout berhasil dibuat."
    );

    console.log(
      "[Purchase] Redirect ke Mayar:",
      checkoutUrl
    );

    window.location.href = checkoutUrl;

  } catch (error) {

    console.error(
      "[Purchase] Error:",
      error
    );

    alert(
      "Terjadi kesalahan saat membuat pembayaran."
    );
  }
}
