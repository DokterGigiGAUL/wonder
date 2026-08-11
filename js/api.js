/*
 * --------------------------------------------------------------------------
 * api.js
 * --------------------------------------------------------------------------
 */

const WonderAPI = {

    BASE_URL:
        "https://script.google.com/macros/s/AKfycbwzkcz2seD-3OCb2uWYhC2Oon_swZV4SYpOh6JUZXgg04Lx6UbCf1DlaHTmUWrwXWhr/exec",


    async post(action, data = {}) {

        const response = await fetch(
            this.BASE_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: new URLSearchParams({
                    action,
                    ...data
                })
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
