/*
|--------------------------------------------------------------------------
| index.js
|--------------------------------------------------------------------------
*/

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

const searchForm = document.getElementById("siteSearchForm");
const searchInput = document.getElementById("siteSearchInput");

if (searchForm && searchInput) {
    searchForm.onsubmit = (e) => {
        e.preventDefault();
        const value = searchInput.value.trim();
        if (!value) return;
        location.href = `explore.html?q=${encodeURIComponent(value)}`;
    };
}

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
/* HELPER UNTUK CEK APAKAH KONTEN PREMIUM & BELUM DIBELI                      */
/* -------------------------------------------------------------------------- */
function isPremiumLocked(item) {
    if (!item || !item.premium) return false;
    const unlocked = typeof Storage !== "undefined" && typeof Storage.isUnlocked === "function" && Storage.isUnlocked(item.productId);
    return !unlocked;
}

/* -------------------------------------------------------------------------- */
/* INIT                                                                       */
/* -------------------------------------------------------------------------- */
function initializeHome() {
    renderFeaturedHero();
    loadQuiz();
    loadComics();
    loadTTS();
    loadCases();
    loadEbooks();
    
}

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
    buttonText,
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

    const badge = clone.querySelector(".featured-badge");
    if (badge) {
        if (isEbook || (item && item.premium)) {
            badge.textContent = "👑 Premium";
        } else {
            badge.remove();
        }
    }

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

    const button = clone.querySelector(".content-btn");
    if (button) {
        button.textContent = buttonText;
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

    quizzes.forEach(quiz => {
        const finished = typeof Storage !== "undefined" && Storage.isFinished && Storage.isFinished(quiz.productId);
        const locked = isPremiumLocked(quiz);

        createContentCard({
            container: quizList,
            item: quiz,
            thumbnail: quiz.thumbnail,
            title: quiz.title,
            description: quiz.description,
            buttonText: locked ? "Beli" : (finished ? "Sudah Selesai" : getActionText("quiz")),
            disabled: finished,
            onClick() {
                location.href = `quiz.html?id=${quiz.file}`;
            }
        });
    });

    //appendSeeAllCard(quizList, "Lihat semua", "explore.html?tab=quiz");
}

function loadComics() {
    if (!comicsContainer || typeof comics === "undefined") return;
    comicsContainer.innerHTML = "";

    comics.slice(0, 3).forEach(comic => {
        const locked = isPremiumLocked(comic);

        createContentCard({
            container: comicsContainer,
            item: comic,
            thumbnail: comic.thumbnail,
            title: comic.title,
            description: comic.description,
            buttonText: locked ? "Beli" : getActionText("comic"),
            onClick() {
                location.href = `comic.html?id=${comic.id}`;
            }
        });
    });

    //appendSeeAllCard(comicsContainer, "Lihat semua", "explore.html?tab=comic");
}

function loadTTS() {
    if (!ttsContainer || typeof ttsList === "undefined") return;
    ttsContainer.innerHTML = "";

    ttsList.forEach(tts => {
        const locked = isPremiumLocked(tts);

        createContentCard({
            container: ttsContainer,
            item: tts,
            thumbnail: tts.thumbnail,
            title: tts.title,
            description: tts.description,
            buttonText: locked ? "Beli" : getActionText("tts"),
            onClick() {
                location.href = `tts.html?puzzle=tts${tts.id}`;
            }
        });
    });

    //appendSeeAllCard(ttsContainer, "Lihat semua", "explore.html?tab=tts");
}

function loadCases() {
    if (!caseContainer || typeof cases === "undefined") return;
    caseContainer.innerHTML = "";

    cases.slice(0, 3).forEach(caseData => {
        const locked = isPremiumLocked(caseData);

        createContentCard({
            container: caseContainer,
            item: caseData,
            thumbnail: caseData.thumbnail,
            title: caseData.title,
            description: caseData.description,
            buttonText: locked ? "Beli" : getActionText("case"),
            onClick() {
                location.href = `case.html?case=${caseData.file}`;
            }
        });
    });

    //appendSeeAllCard(caseContainer, "Lihat semua", "explore.html?tab=case");
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
                buttonText: "Detail →",
                extraClass: "ebook-card",
                onClick() {
                    location.href = `ebook.html?ebook=${ebook.file}`;
                }
            });
        });

    // Panggil helper dengan parameter isExternal = true
    //appendSeeAllCard(ebookContainer, "Katalog lengkap", "https://gigital.myr.id", true);
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

    const latestItems = [
        ...quizzesArr,
        ...comicsArr,
        ...ttsArr,
        ...casesArr
    ].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

    const heroItem = latestItems[0];
    if (!heroItem) return;

//    const urlBg = "https://doktergigigaul.github.io/wonder/assets/images/premium-bg.jpeg";
//    featuredHero.style.backgroundImage = `url(${urlBg})`;
    
// Menggunakan thumbnail dari konten terbaru yang ditemukan
    const urlBg = heroItem.thumbnail || "assets/images/premium-bg.jpeg";
    featuredHero.style.backgroundImage = `url('${urlBg}')`;
    
    const badge = featuredHero.querySelector(".featured-badge");
    const title = featuredHero.querySelector(".featured-title");
    const description = featuredHero.querySelector(".featured-description");
    const button = featuredHero.querySelector(".featured-btn");
    const catalogButton = featuredHero.querySelector(".featured-catalog-btn");

    //if (badge) badge.remove();
    // LOGIKA BADGE: Jika badge ada di HTML, tampilkan teks berdasarkan status premium/terbaru
    if (badge) {
        badge.textContent = "⭐ Terbaru";
        badge.style.display = "inline-block";
    }

    if (title) title.textContent = heroItem.title;
    if (description) description.textContent = heroItem.description;

    if (button) {
        const locked = isPremiumLocked(heroItem);
        button.textContent = locked ? "Beli" : getActionText(heroItem.type);

        button.onclick = () => {
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
        catalogButton.remove();
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

/* -------------------------------------------------------------------------- */
/* HELPER UNTUK KARTU "LIHAT SEMUA" GLOBAL                                   */
/* -------------------------------------------------------------------------- 
function appendSeeAllCard(container, label, url, isExternal = false) {
    if (!container) return;

    const seeAllCard = document.createElement("article");
    seeAllCard.className = "content-card see-all-card";
    
    const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
    
    seeAllCard.innerHTML = `
        <a href="${url}" class="see-all-link" ${targetAttr}>${label} →</a>
    `;
    
    seeAllCard.addEventListener("click", () => {
        if (isExternal) {
            window.open(url, "_blank", "noopener,noreferrer");
        } else {
            location.href = url;
        }
    });

    container.appendChild(seeAllCard);
}*/
