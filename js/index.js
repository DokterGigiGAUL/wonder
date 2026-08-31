/*
|--------------------------------------------------------------------------
| index.js (Fixed Logic: Universal Locked Label & Dynamic Unlocked Label)
|--------------------------------------------------------------------------
*/

// =========================================================================
// NAVIGASI PEMBELIAN PREMIUM (Redirection)
// =========================================================================
window.showPremiumDialog = function(productId) {
    window.location.href = `premium.html?product=${encodeURIComponent(productId || '')}`;
};

// =========================================================================
// ELEMEN & VARIABEL UTAMA
// =========================================================================
const quizList = document.getElementById("quiz-list");
const comicsContainer = document.getElementById("comics-container");
const ttsContainer = document.getElementById("tts-container");
const caseContainer = document.getElementById("case-container");
const ebookContainer = document.getElementById("ebook-container");

const featuredHero = document.getElementById("featured-hero");
const cardTemplate = document.getElementById("content-card-template");

let backendProducts = new Map();

/* -------------------------------------------------------------------------- */
/* HELPER UNTUK LABEL TOMBOL AKSI BERDASARKAN TIPE KONTEN                     */
/* -------------------------------------------------------------------------- */
function getActionText(type) {
    switch (type) {
        case "quiz":
            return "Mulai →";
        case "comic":
            return "Baca →";
        case "tts":
            return "Main →";
        case "case":
            return "Lihat →";
        case "ebook":
            return "Detail →";
        default:
            return "Buka →";
    }
}

/* -------------------------------------------------------------------------- */
/* BACKEND PRODUCTS SYNC                                                      */
/* -------------------------------------------------------------------------- */
async function syncBackendProducts() {
    if (typeof WonderAPI === "undefined" || !WonderAPI.getProducts) return;
    
    try {
        const response = await WonderAPI.getProducts();

        if (Array.isArray(response?.data)) {
            backendProducts = new Map(
                response.data.map(product => [
                    product.productId,
                    product
                ])
            );
        }

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
/* HELPER CHECK ACCESS (Disesuaikan dengan Firestore & PurchaseManager)        */
/* -------------------------------------------------------------------------- */
function checkAccess(item) {
    if (!item) return false;
    
    // 1. Cek langsung status Premium Firestore dari window.userAccess
    if (window.userAccess && window.userAccess.isPremium) {
        // Cek jika ada batas waktu kadaluarsa (premiumUntil)
        if (window.userAccess.premiumUntil) {
            let expiryDate;
            const rawDate = window.userAccess.premiumUntil;
            
            if (rawDate && typeof rawDate.toDate === "function") {
                expiryDate = rawDate.toDate();
            } else if (rawDate && rawDate.seconds) {
                expiryDate = new Date(rawDate.seconds * 1000);
            } else {
                expiryDate = new Date(rawDate);
            }

            if (!isNaN(expiryDate.getTime()) && expiryDate > new Date()) {
                return true;
            }
        } else {
            // isPremium: true tanpa tanggal expired -> Akses Penuh
            return true;
        }
    }

    // 2. Cek produk eceran terdeteksi di Firestore (ownedProducts)
    if (item.productId && window.userAccess && Array.isArray(window.userAccess.ownedProducts)) {
        if (window.userAccess.ownedProducts.includes(item.productId)) {
            return true;
        }
    }

    // 3. Cek lewat PurchaseManager (Logika lokal existing Anda)
    if (typeof PurchaseManager !== "undefined" && PurchaseManager.hasAccess(item)) {
        return true;
    }

    // 4. Fallback via Backend API Map
    if (item.productId) {
        const backendProd = backendProducts.get(item.productId);
        if (backendProd?.status === "active") {
            return true;
        }
    }

    return false;
}

/* -------------------------------------------------------------------------- */
/* INIT & GLOBAL RE-RENDER                                                    */
/* -------------------------------------------------------------------------- */
async function initializeHome() {
    renderAllContent();
    await syncBackendProducts();
    renderAllContent();
}

window.renderAllContent = function() {
    loadQuiz();
    loadComics();
    loadTTS();
    loadCases();
    loadEbooks();
    renderFeaturedHero();
};

// Inisialisasi setelah DOM Siap
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeHome);
} else {
    initializeHome();
}

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
    if (!cardTemplate || !container) return;

    const clone = cardTemplate.content.cloneNode(true);
    const card = clone.querySelector(".content-card");

    if (extraClass) {
        card.classList.add(extraClass);
    }

    const isEbook = item?.type === "ebook" || extraClass.includes("ebook-card");
    let backendProduct = null;
    if (item?.productId) {
        backendProduct = backendProducts.get(item.productId);
    }

    const hasAccess = checkAccess(item);

    /*
     * BADGE
     * Ebook tidak menggunakan sistem badge "Terbuka/Premium" global
     */
    const badge = clone.querySelector(".featured-badge");
    if (badge) {
        if (isEbook) {
            badge.textContent = "📘 E-Book"; // Atau disembunyikan jika tidak diperlukan
        } else if (premium) {
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
        thumbEl.src = thumbnail || "";
        thumbEl.alt = title || "";
        thumbEl.loading = "lazy";
    }

    const titleEl = clone.querySelector(".content-title");
    if (titleEl) titleEl.textContent = title;

    const descEl = clone.querySelector(".content-description");
    if (descEl) descEl.textContent = description;

    /*
     * PRICE
     * Ebook selalu menampilkan harga produk
     */
    const displayPrice = backendProduct?.price ?? price;

    if (displayPrice != null && (isEbook || !hasAccess)) {
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
        if (isEbook) {
            button.textContent = buttonText; // Selalu menampilkan teks khusus seperti "Beli Ebook →" atau "Detail →"
        } else if (premium) {
            button.textContent = hasAccess ? buttonText : "🔒 Buka →";
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
    if (!quizList || typeof quizzes === "undefined") return;
    quizList.innerHTML = "";

    quizzes.slice(0, 6).forEach(quiz => {
        const finished = typeof Storage !== "undefined" && Storage.isFinished && Storage.isFinished(quiz.productId);

        createContentCard({
            container: quizList,
            item: quiz,
            thumbnail: quiz.thumbnail,
            title: quiz.title,
            description: quiz.description,
            premium: quiz.premium,
            buttonText: finished ? "Sudah Selesai" : getActionText("quiz"),
            disabled: finished,
            onClick() {
                const hasAccess = checkAccess(quiz);

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
    if (!comicsContainer || typeof comics === "undefined") return;
    comicsContainer.innerHTML = "";

    comics.slice(0, 6).forEach(comic => {
        createContentCard({
            container: comicsContainer,
            item: comic,
            thumbnail: comic.thumbnail,
            title: comic.title,
            description: comic.description,
            premium: comic.premium,
            buttonText: getActionText("comic"),
            onClick() {
                const hasAccess = checkAccess(comic);

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
    if (!ttsContainer || typeof ttsList === "undefined") return;
    ttsContainer.innerHTML = "";

    ttsList.slice(0, 6).forEach(tts => {
        createContentCard({
            container: ttsContainer,
            item: tts,
            thumbnail: tts.thumbnail,
            title: tts.title,
            description: tts.description,
            premium: tts.premium,
            buttonText: getActionText("tts"),
            onClick() {
                const hasAccess = checkAccess(tts);

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
    if (!caseContainer || typeof cases === "undefined") return;
    caseContainer.innerHTML = "";

    cases.slice(0, 6).forEach(caseData => {
        createContentCard({
            container: caseContainer,
            item: caseData,
            thumbnail: caseData.thumbnail,
            title: caseData.title,
            description: caseData.description,
            premium: caseData.premium,
            buttonText: getActionText("case"),
            onClick() {
                const hasAccess = checkAccess(caseData);

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
    if (!ebookContainer || typeof ebooks === "undefined") return;
    ebookContainer.innerHTML = "";

    ebooks
        .slice()
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        .slice(0, 6)
        .forEach(ebook => {
            createContentCard({
                container: ebookContainer,
                item: { ...ebook, type: "ebook" },
                thumbnail: ebook.thumbnail,
                title: ebook.title,
                description: ebook.description,
                price: ebook.price,
                premium: false, // Diset false agar tidak memicu proteksi logika modul edukasi
                buttonText: "Beli Ebook 🛒",
                extraClass: "ebook-card",
                onClick() {
                    // Direct Link ke marketplace / halaman checkout khusus Ebook
                    if (ebook.link) {
                        window.open(ebook.link, "_blank");
                    } else if (ebook.productId) {
                        // Jika menggunakan sistem checkout universal internal
                        purchaseProduct(ebook.productId);
                    } else {
                        location.href = `ebook.html?id=${ebook.id || ebook.file}`;
                    }
                }
            });
        });
}

/* -------------------------------------------------------------------------- */
/* FEATURED HERO                                                              */
/* -------------------------------------------------------------------------- */

function renderFeaturedHero() {
    if (!featuredHero) return;

    const quizzesArr = typeof quizzes !== "undefined" ? quizzes : [];
    const comicsArr = typeof comics !== "undefined" ? comics : [];
    const ttsArr = typeof ttsList !== "undefined" ? ttsList : [];
    const casesArr = typeof cases !== "undefined" ? cases : [];

    const latestPremiumItems = [
        ...quizzesArr,
        ...comicsArr,
        ...ttsArr,
        ...casesArr
    ]
    .filter(item => item?.premium)
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

    const isOwned = checkAccess(heroItem);

    if (badge) {
        badge.textContent = isOwned ? "🟢 Terbuka" : "👑 Premium";
    }

    if (title) title.textContent = heroItem.title;
    if (description) description.textContent = heroItem.description;

    if (button) {
        button.textContent = isOwned ? getActionText(heroItem.type) : "🔒 Buka →";

        button.onclick = () => {
            if (!isOwned) {
                showPremiumDialog(heroItem.productId);
                return;
            }

            switch (heroItem.type) {
                case "quiz":
                    location.href = `quiz.html?id=${heroItem.file}`;
                    break;
                case "comic":
                    location.href = `komik.html?id=${heroItem.id}`;
                    break;
                case "tts":
                    location.href = `tts.html?puzzle=tts${heroItem.id}`;
                    break;
                case "case":
                    location.href = `case.html?case=${heroItem.file}`;
                    break;
            }
        };
    }

    if (catalogButton) {
        catalogButton.onclick = () => {
            location.href = "https://doktergigigaul.github.io/wonder/premium-catalog.html";
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

// Listener saat Firebase / Firestore selesai memuat data hak akses user
window.addEventListener("userAccessReady", () => {
    console.log("Status Firestore diterima di index.js, merender ulang konten...");
    if (typeof renderAllContent === "function") {
        renderAllContent();
    }
});

// Listener alternatif jika menggunakan Firebase Auth State Change langsung
if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Memberikan sedikit jeda agar data Firestore tersimpan ke window.userAccess
            setTimeout(() => {
                if (typeof renderAllContent === "function") {
                    renderAllContent();
                }
            }, 500);
        }
    });
}
