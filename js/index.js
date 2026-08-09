const quizList = document.getElementById("quiz-list");
const comicsContainer = document.getElementById("comics-container");
const ttsContainer = document.getElementById("tts-container");
const caseContainer = document.getElementById("case-container");
const ebookContainer = document.getElementById("ebook-container");

const featuredHero = document.getElementById("featured-hero");

const cardTemplate =
    document.getElementById("content-card-template");

let backendProducts = new Map();

async function syncBackendProducts() {
    try {
        const response = await WonderAPI.getProducts();

        backendProducts = new Map(
            response.data.map(product => [
                product.productId,
                product
            ])
        );

        console.log(
            "Backend products synced:",
            backendProducts
        );

    } catch (error) {

        console.error(
            "Gagal mengambil products dari backend:",
            error
        );

        backendProducts.clear();
    }
}

function getBackendProduct(productId) {
    return backendProducts.get(productId) || null;
}

async function initializeHome() {

    await syncBackendProducts();

    loadQuiz();
    loadComics();
    loadTTS();
    loadCases();
    loadEbooks();
    renderFeaturedHero();
}

initializeHome();


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

    /*
     * =====================================================
     * BACKEND PRODUCT
     * =====================================================
     *
     * Hanya konten premium yang mencari productId
     * ke backendProducts.
     *
     * Ebook tidak disentuh.
     */

    let backendProduct = null;

    if (premium && item?.productId) {

        backendProduct =
            backendProducts.get(item.productId);
    }


    /*
     * =====================================================
     * STATUS PRODUK
     * =====================================================
     */

    const backendActive =
        backendProduct?.status === "active";


    /*
     * =====================================================
     * BADGE
     * =====================================================
     */

    const badge =
        clone.querySelector(".featured-badge");

    if (premium) {

        if (backendActive) {

            badge.textContent =
                "🟢 Dimiliki";

        } else {

            badge.textContent =
                "👑 Premium";
        }

    } else {

        badge.remove();
    }


    /*
     * =====================================================
     * CONTENT
     * =====================================================
     */

    clone.querySelector(".content-thumb").src =
        thumbnail;

    clone.querySelector(".content-thumb").alt =
        title;

    clone.querySelector(".content-title").textContent =
        title;

    clone.querySelector(".content-description").textContent =
        description;


    /*
     * =====================================================
     * PRICE
     * =====================================================
     *
     * Premium:
     *   gunakan harga backend.
     *
     * Non-premium:
     *   gunakan price lokal.
     *
     * Ebook tetap menggunakan price lokal.
     */

    const displayPrice =
        premium
            ? backendProduct?.price
            : price;


    if (displayPrice != null && !backendActive) {

        const info =
            clone.querySelector(".content-info");

        const priceEl =
            document.createElement("p");

        priceEl.className =
            "content-price";

        priceEl.textContent =
            `Rp ${Number(displayPrice).toLocaleString("id-ID")}`;

        info.insertBefore(
            priceEl,
            clone.querySelector(".content-btn")
        );
    }


    /*
     * =====================================================
     * BUTTON
     * =====================================================
     *
     * Premium + backend active
     *     → 🟢 Dimiliki
     *
     * Premium + backend inactive
     *     → 👑 Premium
     *
     * Gratis
     *     → buttonText
     *
     * Ebook
     *     → buttonText
     */

    const button =
        clone.querySelector(".content-btn");


    if (premium) {
    button.textContent =
        backendActive
            ? buttonText
            : "🔒 Buka";
} else {
    button.textContent = buttonText;
}


    button.disabled =
        disabled;


    if (!disabled) {

        button.onclick =
            onClick;
    }


    container.appendChild(clone);
}

function loadQuiz() {

    if (!quizList) return;

    quizzes
        .slice(0, 6)
        .forEach(quiz => {

            const finished =
                Storage.isFinished(
                    quiz.productId
                );

            createContentCard({

                container: quizList,

                item: quiz,

                thumbnail: quiz.thumbnail,

                title: quiz.title,

                description: quiz.description,

                premium: quiz.premium,

                buttonText:
                    finished
                        ? "Sudah Selesai"
                        : "Mulai →",

                disabled:
                    finished,

                onClick() {

                    if (
                        quiz.premium &&
                        !PurchaseManager.hasAccess(quiz)
                    ) {

                        showPremiumDialog(
                            quiz.productId
                        );

                        return;
                    }

                    location.href =
                        `quiz.html?id=${quiz.file}`;
                }

            });

        });
}


function loadComics() {

    if (!comicsContainer) return;

    comics
        .slice(0, 6)
        .forEach(comic => {

            createContentCard({

                container: comicsContainer,

                item: comic,

                thumbnail: comic.thumbnail,

                title: comic.title,

                description: comic.description,

                premium: comic.premium,

                buttonText: "Baca →",

               onClick() {

    const backendProduct =
        backendProducts.get(comic.productId);

    const owned =
        backendProduct?.status === "active";

    if (comic.premium && !owned) {

        showPremiumDialog(
            comic.productId
        );

        return;
    }

    location.href =
        `komik.html?id=${comic.id}`;
}

            });

        });
}


function loadTTS() {

    if (!ttsContainer) return;

    ttsList
        .slice(0, 6)
        .forEach(tts => {

            createContentCard({

                container: ttsContainer,

                item: tts,

                thumbnail: tts.thumbnail,

                title: tts.title,

                description: tts.description,

                premium: tts.premium,

                buttonText: "Main →",

                onClick() {

    const backendProduct =
        backendProducts.get(tts.productId);

    const owned =
        backendProduct?.status === "active";

    if (tts.premium && !owned) {

        showPremiumDialog(
            tts.productId
        );

        return;
    }

    location.href =
        `tts.html?puzzle=tts${tts.id}`;
}

            });

        });
}

function loadCases() {
    if (!caseContainer) return;
    cases
        .slice(0, 6)
        .forEach(caseData => {
            createContentCard({
                container: caseContainer,
                item: caseData,
                thumbnail: caseData.thumbnail,
                title: caseData.title,
                description: caseData.description,
                premium: caseData.premium,
                buttonText: "Lihat →",
                onClick() {

    location.href =
        `case.html?case=${caseData.file}`;
}
            });
        });
}

function loadEbooks() {
    if (!ebookContainer) return;
    ebooks
        .slice()
        .sort(
            (a, b) =>
                new Date(b.releaseDate) -
                new Date(a.releaseDate)
        )
        .slice(0, 6)
        .forEach(ebook => {
            createContentCard({
                container: ebookContainer,
                item: ebook,
                thumbnail: ebook.thumbnail,
                title: ebook.title,
                description: ebook.description,
                price: ebook.price,
                premium: ebook.premium,
                buttonText: "Detail →",
                extraClass: "ebook-card",
                onClick() {
                    location.href =
                        `ebook.html?ebook=${ebook.file}`;
                }
            });
        });
}

function renderFeaturedHero() {
    if (!featuredHero) return;

    const latestPremiumItems = [
        ...quizzes,
        ...comics,
        ...ttsList,
        ...cases
    ]
    .filter(item => item.premium)
    .sort(
        (a, b) =>
            new Date(b.releaseDate) -
            new Date(a.releaseDate)
    );

    const heroItem =
        latestPremiumItems[0];

    if (!heroItem) return;

    const urlBg =
        "https://doktergigigaul.github.io/wonder-app/assets/images/premium-bg.jpeg";

    featuredHero.style.backgroundImage =
        `url(${urlBg})`;

    const badge =
        featuredHero.querySelector(
            ".featured-badge"
        );
    const title =
        featuredHero.querySelector(
            ".featured-title"
        );
    const description =
        featuredHero.querySelector(
            ".featured-description"
        );
    const button =
        featuredHero.querySelector(
            ".featured-btn"
        );
    const catalogButton =
        featuredHero.querySelector(
            ".featured-catalog-btn"
        );

    badge.textContent =
        PurchaseManager.hasAccess(heroItem)
            ? "🟢 Akses permanen"
            : "👑 Premium";

    title.textContent =
        heroItem.title;

    description.textContent =
        heroItem.description;

    button.textContent =
        "🔒 Buka";


    button.onclick = () => {
        if (
            !PurchaseManager.hasAccess(heroItem)
        ) {
            showPremiumDialog(
                heroItem.productId
            );
            return;
        }

        switch (heroItem.type) {
            case "quiz":
                location.href =
                    `quiz.html?id=${heroItem.id}`; //heroItem.file
                break;

            case "comic":
                location.href =
                    `komik.html?id=${heroItem.id}`;
                break;

            case "tts":
                location.href =
                    `tts.html?puzzle=tts${heroItem.id}`;
                break;
                
            case "case":
                location.href =
                    `case.html?case=${heroItem.id}`; //heroItem.file
                break;
        }
    };

    if (catalogButton) {
        catalogButton.onclick = () => {
            location.href =
                "premium-catalog.html";
        };
    }
}

function goToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

document.querySelectorAll(".category-card").forEach(card => {

    card.addEventListener("click", () => {

        switch (card.dataset.category) {

            case "quiz":
                goToSection("quiz-section");
                break;

            case "case":
                goToSection("case-section");
                break;

            case "tts":
                goToSection("tts-section");
                break;

            case "comic":
                goToSection("comic-section");
                break;

            case "ebook":
                goToSection("ebook-section");
                break;

        }

    });

});
