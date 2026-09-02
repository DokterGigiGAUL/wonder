const WonderAPI = {

    BASE_URL: "https://script.google.com/macros/s/AKfycbwzkcz2seD-3OCb2uWYhC2Oon_swZV4SYpOh6JUZXgg04Lx6UbCf1DlaHTmUWrwXWhr/exec",

    async post(action, data = {}) {

        const response = await fetch(this.BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action: action,
                ...data
            })
        });

        const text = await response.text();

        console.log(
            "[WonderAPI]",
            action,
            "HTTP:",
            response.status
        );

        console.log(
            "[WonderAPI]",
            action,
            "RAW:",
            text
        );

        let json;

        try {
            json = JSON.parse(text);
        } catch (err) {
            throw new Error(
                "Response backend bukan JSON: " + text
            );
        }

        if (!json.success) {
            throw new Error(
                json.message || "Unknown Error"
            );
        }

        return json;
    },

    async getProducts() {

        const response = await fetch(
            this.BASE_URL + "?action=getProducts"
        );

        const text = await response.text();

        const json = JSON.parse(text);

        if (!json.success) {
            throw new Error(
                json.message || "Unknown Error"
            );
        }

        return json;
    },

    async syncUser(data) {
        return await this.post(
            "syncUser",
            data
        );
    },

    async createCheckout(data) {
        console.log(
            "[WonderAPI] createCheckout:",
            data
        );

        return await this.post(
            "createCheckout",
            data
        );
    },

    async verifyAccess(data) {
        return await this.post(
            "verifyAccess",
            data
        );
    },

    async getProfile(data) {
        return await this.post(
            "getProfile",
            data
        );
    }
};
