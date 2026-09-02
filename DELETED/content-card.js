const cardTemplate =
    document.getElementById("content-card-template");

function createContentCard({
    container,
    thumbnail,
    title,
    description,
    price = null,
    buttonText,
    premium = false,
    disabled = false,
    extraClass = "",
    item,
    onClick
}) {

    const clone =
        cardTemplate.content.cloneNode(true);

    const card =
        clone.querySelector(".content-card");

    if (extraClass) {
        card.classList.add(extraClass);
    }

    const badge =
        clone.querySelector(".featured-badge");

    if (premium) {

        if (PurchaseManager.hasAccess(item)) {
            badge.textContent =
                "🟢 Akses permanen";
        } else {
            badge.textContent =
                "👑 Premium";
        }

    } else {
        badge.remove();
    }

    clone.querySelector(".content-thumb").src =
        thumbnail;

    clone.querySelector(".content-thumb").alt =
        title;

    clone.querySelector(".content-title").textContent =
        title;

    clone.querySelector(".content-description").textContent =
        description;

    /*
     * Harga hanya ditampilkan untuk konten premium
     */
    if (premium && item.price != null) {

        const info =
            clone.querySelector(".content-info");

        const priceEl =
            document.createElement("p");

        priceEl.className =
            "content-price";

        priceEl.textContent =
            `Rp ${item.price.toLocaleString("id-ID")}`;

        info.insertBefore(
            priceEl,
            clone.querySelector(".content-btn")
        );
    }

    const button =
        clone.querySelector(".content-btn");

    /*
     * Semua konten premium menggunakan
     * tombol 🔒 Buka
     */
    button.textContent =
        premium
            ? "🔒 Buka"
            : buttonText;

    button.disabled =
        premium
            ? false
            : disabled;

    if (!disabled) {
        button.onclick = onClick;
    }

    container.appendChild(clone);
}
