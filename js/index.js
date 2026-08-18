/*
|--------------------------------------------------------------------------
| index.js
|--------------------------------------------------------------------------
*/

const quizList = document.getElementById("quiz-list");
const comicsContainer = document.getElementById("comics-container");
const ttsContainer = document.getElementById("tts-container");
const caseContainer = document.getElementById("case-container");
const ebookContainer = document.getElementById("ebook-container");

const featuredHero = document.getElementById("featured-hero");
const cardTemplate = document.getElementById("content-card-template");

let backendProducts = new Map();

/* -------------------------------------------------------------------------- */
/* BACKEND PRODUCTS SYNC                                                     */
/* -------------------------------------------------------------------------- */

async function syncBackendProducts() {
    try {
        const response = await WonderAPI.getProducts();

        backendProducts = new Map(
            response.data.map(product => [
                product.productId,
                product
            ])
        );

        console.log("Backend products synced:", backendProducts);

    } catch (error) {
        console.error("Gagal mengambil products dari backend:", error);
        backendProducts.clear();
    }
}

function getBackendProduct(productId) {
    return backendProducts.get(productId) || null;
}

/* -------------------------------------------------------------------------- */
/* INIT & GLOBAL RE-RENDER                                                    */
/* -------------------------------------------------------------------------- */

async function initializeHome() {
    // Render awal
    renderAllContent();

    // Sync produk backend
    await syncBackendProducts();

    // Render ulang setelah produk backend siap
    renderAllContent();
}

// Fungsi global agar bisa dipanggil ulang oleh auth.js setelah Firestore sync
window.renderAllContent = function() {
    loadQuiz();
    loadComics();
    loadTTS();
    loadCases();
    loadEbooks();
    renderFeaturedHero();
};

initializeHome();

/* -------------------------------------------------------------------------- */
/* CARD CREATOR                                                               */
/* -------------------------------------------------------------------------- */

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
    if (!cardTemplate) return;

    const clone = cardTemplate.content.cloneNode(true);
    const card = clone.querySelector(".content-card");

    if (extraClass) {
        card.classList.add(extraClass);
    }

    let backendProduct = null;
    if (premium && item?.productId) {
        backendProduct = backendProducts.get(item.productId);
    }

    /*
     * STATUS PRODUK & AKSES
     * Menggabungkan pengecekan dari PurchaseManager (Firestore) & Backend Product
     */
    const hasAccess = 
        (item && typeof PurchaseManager !== "undefined" && PurchaseManager.hasAccess(item)) ||
        backendProduct?.status === "active";

    /*
     * BADGE
     */
    const badge = clone.querySelector(".featured-badge");
    if (badge) {
        if (premium) {
            badge.textContent = hasAccess ? "🟢 Terbuka" : "👑 Premium";
        } else {
            badge.remove();
        }
    }

    /*
     * CONTENT
     */
    const thumbEl = clone.querySelector(".content-thumb");
    if (thumbEl) {
        thumbEl.src = thumbnail;
        thumbEl.alt = title;
        thumbEl.loading = "lazy";
    }

    const titleEl = clone.querySelector(".content-title");
    if (titleEl) titleEl.textContent = title;

    const descEl = clone.querySelector(".content-description");
    if (descEl) descEl.textContent = description;

    /*
     * PRICE
     */
    const displayPrice = premium ? backendProduct?.price : price;

    if (displayPrice != null && !hasAccess) {
        const info = clone.querySelector(".content-info");
        const priceEl = document.createElement("p");
        priceEl.className = "content-price";
        priceEl.textContent = `Rp ${Number(displayPrice).toLocaleString("id-ID")}`;

        if (info) {
            info.insertBefore(
                priceEl,
                clone.querySelector(".content-btn")
            );
        }
    }

    /*
     * BUTTON
     */
    const button = clone.querySelector(".content-btn");
    if (button) {
        if (premium) {
            button.textContent = hasAccess ? buttonText : "🔒 Buka";
        } else {
            button.textContent = buttonText;
        }

        button.disabled = disabled;

        if (!disabled && onClick) {
            button.onclick = onClick;
        }
    }

    container.appendChild(clone);
}

/* -------------------------------------------------------------------------- */
/* LOADERS                                                                    */
/* -------------------------------------------------------------------------- */

function loadQuiz() {
    if (!quizList) return;
    quizList.innerHTML = "";

    quizzes.slice(0, 6).forEach(quiz => {
        const finished = typeof Storage !== "undefined" && Storage.isFinished(quiz.productId);

        createContentCard({
            container: quizList,
            item: quiz,
            thumbnail: quiz.thumbnail,
            title: quiz.title,
            description: quiz.description,
            premium: quiz.premium,
            buttonText: finished ? "Sudah Selesai" : "Mulai →",
            disabled: finished,
            onClick() {
                const hasAccess = PurchaseManager.hasAccess(quiz);

                if (quiz.premium && !hasAccess) {
                    showPremiumDialog(quiz.productId);
                    return;
                }

                location.href = `quiz.html?id=${quiz.file}`;
            }
        });
    });
}

function loadComics() {
    if (!comicsContainer) return;
    comicsContainer.innerHTML = "";

    comics.slice(0, 6).forEach(comic => {
        createContentCard({
            container: comicsContainer,
            item: comic,
            thumbnail: comic.thumbnail,
            title: comic.title,
            description: comic.description,
            premium: comic.premium,
            buttonText: "Baca →",
            onClick() {
                const hasAccess = PurchaseManager.hasAccess(comic);

                if (comic.premium && !hasAccess) {
                    showPremiumDialog(comic.productId);
                    return;
                }

                location.href = `komik.html?id=${comic.id}`;
            }
        });
    });
}

function loadTTS() {
    if (!ttsContainer) return;
    ttsContainer.innerHTML = "";

    ttsList.slice(0, 6).forEach(tts => {
        createContentCard({
            container: ttsContainer,
            item: tts,
            thumbnail: tts.thumbnail,
            title: tts.title,
            description: tts.description,
            premium: tts.premium,
            buttonText: "Main →",
            onClick() {
                const hasAccess = PurchaseManager.hasAccess(tts);

                if (tts.premium && !hasAccess) {
                    showPremiumDialog(tts.productId);
                    return;
                }

                location.href = `tts.html?puzzle=tts${tts.id}`;
            }
        });
    });
}

function loadCases() {
    if (!caseContainer) return;
    caseContainer.innerHTML = "";

    cases.slice(0, 6).forEach(caseData => {
        createContentCard({
            container: caseContainer,
            item: caseData,
            thumbnail: caseData.thumbnail,
            title: caseData.title,
            description: caseData.description,
            premium: caseData.premium,
            buttonText: "Lihat →",
            onClick() {
                const hasAccess = PurchaseManager.hasAccess(caseData);

                if (caseData.premium && !hasAccess) {
                    showPremiumDialog(caseData.productId);
                    return;
                }

                location.href = `case.html?case=${caseData.file}`;
            }
        });
    });
}

function loadEbooks() {
    if (!ebookContainer) return;
    ebookContainer.innerHTML = "";

    ebooks
        .slice()
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
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
                    location.href = `ebook.html?ebook=${ebook.file}`;
                }
            });
        });
}

/* -------------------------------------------------------------------------- */
/* FEATURED HERO                                                              */
/* -------------------------------------------------------------------------- */

function renderFeaturedHero() {
    if (!featuredHero) return;

    const latestPremiumItems = [
        ...quizzes,
        ...comics,
        ...ttsList,
        ...cases
    ]
    .filter(item => item.premium)
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

    const heroItem = latestPremiumItems[0];
    if (!heroItem) return;

    const urlBg = "https://doktergigigaul.github.io/wonder/assets/images/premium-bg.jpeg";
    featuredHero.style.backgroundImage = `url(${urlBg})`;

    const badge = featuredHero.querySelector(".featured-badge");
    const title = featuredHero.querySelector(".featured-title");
    const description = featuredHero.querySelector(".featured-description");
    const button = featuredHero.querySelector(".featured-btn");
    const catalogButton = featuredHero.querySelector(".featured-catalog-btn");

    const isOwned = typeof PurchaseManager !== "undefined" && PurchaseManager.hasAccess(heroItem);

    if (badge) {
        badge.textContent = isOwned ? "🟢 Terbuka" : "👑 Premium";
    }

    if (title) title.textContent = heroItem.title;
    if (description) description.textContent = heroItem.description;

    if (button) {
        button.textContent = isOwned ? "Buka →" : "🔒 Buka";

        button.onclick = () => {
            if (!isOwned) {
                showPremiumDialog(heroItem.productId);
                return;
            }

            switch (heroItem.type) {
                case "quiz":
                    location.href = `quiz.html?id=${heroItem.id}`;
                    break;
                case "comic":
                    location.href = `komik.html?id=${heroItem.id}`;
                    break;
                case "tts":
                    location.href = `tts.html?puzzle=tts${heroItem.id}`;
                    break;
                case "case":
                    location.href = `case.html?case=${heroItem.id}`;
                    break;
            }
        };
    }

    if (catalogButton) {
        catalogButton.onclick = () => {
            location.href = "premium-catalog.html";
        };
    }
}

/* -------------------------------------------------------------------------- */
/* CATEGORY NAVIGATION                                                        */
/* -------------------------------------------------------------------------- */

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
