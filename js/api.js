/*
 * --------------------------------------------------------------------------
 * api.js
 * --------------------------------------------------------------------------
 */

const WonderAPI = {

    BASE_URL: "https://script.google.com/macros/s/AKfycbwzkcz2seD-3OCb2uWYhC2Oon_swZV4SYpOh6JUZXgg04Lx6UbCf1DlaHTmUWrwXWhr/exec",

    async post(action, data = {}) {

        const response = await fetch(this.BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action,
                ...data
            })
        });

        const json = await response.json();

        if (!json.success) {
            throw new Error(
                json.message || "Unknown Error"
            );
        }

        return json;
    },

    async getProducts() {

        const response = await fetch(
            this.BASE_URL + "?action=getProducts",
            {
                method: "GET"
            }
        );

        const json = await response.json();

        if (!json.success) {
            throw new Error(
                json.message || "Unknown Error"
            );
        }

        return json;
    },

    async syncUser(data) {
        return await this.post("syncUser", data);
    },
/*
    async createCheckout(data) {
        return await this.post("createCheckout", data);
    },
*/
    async createCheckout(data) {

    console.log("[WonderAPI] createCheckout request:", data);

    const response = await fetch(this.BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: new URLSearchParams({
            action: "createCheckout",
            uid: data.uid || "",
            productId: data.productId || "",
            displayName: data.displayName || "",
            email: data.email || "",
            mobile: data.mobile || "",
            redirectUrl: data.redirectUrl || ""
        }).toString()
    });

    console.log(
        "[WonderAPI] createCheckout HTTP:",
        response.status
    );

    const text = await response.text();

    console.log(
        "[WonderAPI] createCheckout RAW:",
        text
    );

    let json;

    try {
        json = JSON.parse(text);
    } catch (err) {
        throw new Error(
            "Response createCheckout bukan JSON: " + text
        );
    }

    if (!json.success) {
        throw new Error(
            json.message || "createCheckout gagal"
        );
    }

    return json;
}
    async verifyAccess(data) {
        return await this.post("verifyAccess", data);
    },

    async getProfile(data) {
        return await this.post("getProfile", data);
    }
};
