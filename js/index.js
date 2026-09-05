/*
|--------------------------------------------------------------------------
| index.js
|--------------------------------------------------------------------------
*/

// =========================================================================
// ELEMEN & VARIABEL UTAMA
// =========================================================================
const params = new URLSearchParams(location.search);
const tab = params.get("tab") || "quiz";
const query = params.get("q") || "";

const searchForm = document.getElementById("siteSearchForm");
const searchInput = document.getElementById("siteSearchInput");
const exploreTabs = document.querySelector(".explore-tabs");

const searchResultsSection = document.getElementById("search-results");
const searchEmpty = document.getElementById("search-empty");
const searchQuizGroup = document.getElementById("search-quiz-group");
const searchTtsGroup = document.getElementById("search-tts-group");
const searchCaseGroup = document.getElementById("search-case-group");
const searchComicGroup = document.getElementById("search-comic-group");

const searchQuizList = document.getElementById("search-quiz-list");
const searchTtsList = document.getElementById("search-tts-list");
const searchCaseList = document.getElementById("search-case-list");
const searchComicList = document.getElementById("search-comic-list");

const quizSection = document.getElementById("quiz-list");
const comicSection = document.getElementById("comics-container");
const ttsSection = document.getElementById("tts-container");
const caseSection = document.getElementById("case-container");

const quizTab = document.getElementById("quizTab");
const comicTab = document.getElementById("comicTab");
const ttsTab = document.getElementById("ttsTab");
const caseTab = document.getElementById("caseTab");

const pageTitle = document.getElementById("pageTitle");
const listTemplate = document.getElementById("list-card-template");

if (!listTemplate) {
    console.error("Template #list-card-template tidak ditemukan.");
    throw new Error("Explore gagal dimuat karena template card tidak tersedia.");
}

// =========================================================================
// HELPER & UTILITY
// =========================================================================
function isPremiumLocked(item) {
    if (!item || !item.premium) return false;
    const unlocked = typeof Storage !== "undefined" && typeof Storage.isUnlocked === "function" && Storage.isUnlocked(item.productId);
    return !unlocked;
}

// Set nilai input pencarian jika query ada di URL
if (searchInput) {
    searchInput.value = query;
}

// Handler Form Pencarian
if (searchForm) {
    searchForm.onsubmit = (e) => {
        e.preventDefault();
        const value = searchInput.value.trim();
        if (!value) return;
        location.href = `explore.html?q=${encodeURIComponent(value)}`;
    };
}

// =========================================================================
// INITIALIZATION / NAVIGASI UTAMA
// =========================================================================
if (query) {
    showSearchResults(query);
} else if (tab === "comic") {
    showComic();
} else if (tab === "tts") {
    showTTS();
} else if (tab === "case") {
    showCase();
} else {
    showQuiz();
}

// =========================================================================
// CARD CREATOR TEMPLATE
// =========================================================================
function createListCard({
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
    if (!container) return;

    const clone = listTemplate.content.cloneNode(true);
    const card = clone.querySelector(".list-card");
    if (extraClass) {
        card.classList.add(extraClass);
    }

    const badge = clone.querySelector(".featured-badge");
    if (badge) {
        if (item && item.premium) {
            badge.textContent = "👑 Premium";
        } else {
            badge.remove();
        }
    }

    const thumbEl = clone.querySelector(".list-thumb");
    if (thumbEl) {
        thumbEl.src = thumbnail || "";
        thumbEl.alt = title || "";
    }

    const titleEl = clone.querySelector(".list-title");
    if (titleEl) titleEl.textContent = title;

    const descEl = clone.querySelector(".list-description");
    if (descEl) descEl.textContent = description;

    const button = clone.querySelector(".list-btn");
    if (button) {
        button.textContent = buttonText;
        button.disabled = disabled;

        if (!disabled && onClick) {
            button.onclick = onClick;
        }
    }

    container.appendChild(clone);
}

// =========================================================================
// DISPLAY HANDLERS (TAB VIEW)
// =========================================================================
function showQuiz() {
    if (pageTitle) pageTitle.textContent = "Semua Kuis";

    if (quizSection) quizSection.style.display = "block";
    if (comicSection) comicSection.style.display = "none";
    if (ttsSection) ttsSection.style.display = "none";
    if (caseSection) caseSection.style.display = "none";
    if (searchResultsSection) searchResultsSection.style.display = "none";
    if (exploreTabs) exploreTabs.style.display = "flex";

    if (quizTab) quizTab.classList.add("active");
    if (comicTab) comicTab.classList.remove("active");
    if (ttsTab) ttsTab.classList.remove("active");
    if (caseTab) caseTab.classList.remove("active");

    if (!quizSection || typeof quizzes === "undefined") return;
    quizSection.innerHTML = "";

    quizzes.forEach(quiz => {
        const finished = typeof Storage !== "undefined" && Storage.isFinished && Storage.isFinished(quiz.productId);

        createListCard({
            container: quizSection,
            thumbnail: quiz.thumbnail,
            title: quiz.title,
            description: quiz.description,
            item: quiz,
            buttonText: finished
                ? "Sudah Selesai"
                : (isPremiumLocked(quiz) ? "Beli" : "Mulai"),
            disabled: finished,
            onClick() {
                location.href = `quiz.html?id=${quiz.file}`;
            }
        });
    });
}

function showComic() {
    if (pageTitle) pageTitle.textContent = "Semua Komik";

    if (quizSection) quizSection.style.display = "none";
    if (comicSection) comicSection.style.display = "block";
    if (ttsSection) ttsSection.style.display = "none";
    if (caseSection) caseSection.style.display = "none";
    if (searchResultsSection) searchResultsSection.style.display = "none";
    if (exploreTabs) exploreTabs.style.display = "flex";

    if (quizTab) quizTab.classList.remove("active");
    if (comicTab) comicTab.classList.add("active");
    if (ttsTab) ttsTab.classList.remove("active");
    if (caseTab) caseTab.classList.remove("active");

    if (!comicSection || typeof comics === "undefined") return;
    comicSection.innerHTML = "";

    comics.slice(0, 4).forEach(comic => {
        createListCard({
            container: comicSection,
            thumbnail: comic.thumbnail,
            title: comic.title,
            description: comic.description,
            item: comic,
            buttonText: isPremiumLocked(comic) ? "Beli" : "Baca",
            onClick() {
                location.href = `comic.html?id=${comic.id}`;
            }
        });
    });
}

function showTTS() {
    if (pageTitle) pageTitle.textContent = "Semua TTS";

    if (quizSection) quizSection.style.display = "none";
    if (comicSection) comicSection.style.display = "none";
    if (ttsSection) ttsSection.style.display = "block";
    if (caseSection) caseSection.style.display = "none";
    if (searchResultsSection) searchResultsSection.style.display = "none";
    if (exploreTabs) exploreTabs.style.display = "flex";

    if (quizTab) quizTab.classList.remove("active");
    if (comicTab) comicTab.classList.remove("active");
    if (ttsTab) ttsTab.classList.add("active");
    if (caseTab) caseTab.classList.remove("active");

    if (!ttsSection || typeof ttsList === "undefined") return;
    ttsSection.innerHTML = "";

    ttsList.forEach(tts => {
        createListCard({
            container: ttsSection,
            thumbnail: tts.thumbnail,
            title: tts.title,
            description: tts.description,
            item: tts,
            buttonText: isPremiumLocked(tts) ? "Beli" : "Main",
            onClick() {
                location.href = `tts.html?puzzle=tts${tts.id}`;
            }
        });
    });
}

function showCase() {
    if (pageTitle) pageTitle.textContent = "Semua Kartu Kasus";

    if (quizSection) quizSection.style.display = "none";
    if (comicSection) comicSection.style.display = "none";
    if (ttsSection) ttsSection.style.display = "none";
    if (caseSection) caseSection.style.display = "block";
    if (searchResultsSection) searchResultsSection.style.display = "none";
    if (exploreTabs) exploreTabs.style.display = "flex";

    if (quizTab) quizTab.classList.remove("active");
    if (comicTab) comicTab.classList.remove("active");
    if (ttsTab) ttsTab.classList.remove("active");
    if (caseTab) caseTab.classList.add("active");

    if (!caseSection || typeof cases === "undefined") return;
    caseSection.innerHTML = "";

    cases.slice(0, 4).forEach(caseData => {
        createListCard({
            container: caseSection,
            thumbnail: caseData.thumbnail,
            title: caseData.title,
            description: caseData.description,
            item: caseData,
            buttonText: isPremiumLocked(caseData) ? "Beli" : "Lihat",
            onClick() {
                location.href = `case.html?case=${caseData.file}`;
            }
        });
    });
}

// =========================================================================
// EVENT LISTENERS UNTUK TAB
// =========================================================================
if (quizTab) {
    quizTab.onclick = () => {
        history.replaceState({}, "", "explore.html?tab=quiz");
        showQuiz();
    };
}

if (comicTab) {
    comicTab.onclick = () => {
        history.replaceState({}, "", "explore.html?tab=comic");
        showComic();
    };
}

if (ttsTab) {
    ttsTab.onclick = () => {
        history.replaceState({}, "", "explore.html?tab=tts");
        showTTS();
    };
}

if (caseTab) {
    caseTab.onclick = () => {
        history.replaceState({}, "", "explore.html?tab=case");
        showCase();
    };
}

// =========================================================================
// LOGIKA FITUR PENCARIAN
// =========================================================================
async function showSearchResults(searchQuery) {
    if (pageTitle) pageTitle.textContent = `Hasil pencarian: "${searchQuery}"`;

    if (exploreTabs) exploreTabs.style.display = "none";
    if (quizSection) quizSection.style.display = "none";
    if (comicSection) comicSection.style.display = "none";
    if (ttsSection) ttsSection.style.display = "none";
    if (caseSection) caseSection.style.display = "none";

    if (searchResultsSection) searchResultsSection.style.display = "block";

    if (searchEmpty) {
        searchEmpty.style.display = "none";
        searchEmpty.innerHTML = "";
    }

    [searchQuizList, searchTtsList, searchCaseList, searchComicList].forEach(list => {
        if (list) list.innerHTML = "";
    });

    if (typeof performSearch === "function") {
        const results = await performSearch(searchQuery);

        renderSearchGroup(searchQuizGroup, searchQuizList, results.quizzes, "quiz");
        renderSearchGroup(searchTtsGroup, searchTtsList, results.tts, "tts");
        renderSearchGroup(searchCaseGroup, searchCaseList, results.cases, "case");
        renderSearchGroup(searchComicGroup, searchComicList, results.comics, "comic");

        const totalResults =
            (results.quizzes ? results.quizzes.length : 0) +
            (results.tts ? results.tts.length : 0) +
            (results.cases ? results.cases.length : 0) +
            (results.comics ? results.comics.length : 0);

        if (totalResults === 0 && searchEmpty) {
            searchEmpty.innerHTML =
                `Tidak ditemukan hasil untuk "${searchQuery}".<br>` +
                `Coba kata kunci lain, atau kembali ke <a href="index.html">Beranda</a> ` +
                `/ <a href="explore.html?tab=quiz">Jelajah</a>.`;
            searchEmpty.style.display = "block";
        }
    }
}

function renderSearchGroup(groupEl, listEl, items, type) {
    if (!groupEl || !listEl) return;

    if (!items || !items.length) {
        groupEl.style.display = "none";
        return;
    }
    groupEl.style.display = "block";

    items.forEach(item => {
        if (type === "quiz") {
            const finished = typeof Storage !== "undefined" && Storage.isFinished && Storage.isFinished(item.productId);
            createListCard({
                container: listEl,
                thumbnail: item.thumbnail,
                title: item.title,
                description: item.description,
                item,
                buttonText: finished
                    ? "Sudah Selesai"
                    : (isPremiumLocked(item) ? "Beli" : "Mulai"),
                disabled: finished,
                onClick() {
                    location.href = `quiz.html?id=${item.file}`;
                }
            });
        } else if (type === "tts") {
            createListCard({
                container: listEl,
                thumbnail: item.thumbnail,
                title: item.title,
                description: item.description,
                item,
                buttonText: isPremiumLocked(item) ? "Beli" : "Main",
                onClick() {
                    location.href = `tts.html?puzzle=tts${item.id}`;
                }
            });
        } else if (type === "case") {
            createListCard({
                container: listEl,
                thumbnail: item.thumbnail,
                title: item.title,
                description: item.description,
                item,
                buttonText: isPremiumLocked(item) ? "Beli" : "Lihat",
                onClick() {
                    location.href = `case.html?case=${item.file}`;
                }
            });
        } else if (type === "comic") {
            createListCard({
                container: listEl,
                thumbnail: item.thumbnail,
                title: item.title,
                description: item.description,
                item,
                buttonText: isPremiumLocked(item) ? "Beli" : "Baca",
                onClick() {
                    location.href = `comic.html?id=${item.id}`;
                }
            });
        }
    });
}
