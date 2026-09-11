const params =
    new URLSearchParams(location.search);
const tab =
    params.get("tab") || "quiz";
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
const quizSection =
    document.getElementById("quiz-container");
const comicSection =
    document.getElementById("comics-container");
const ttsSection =
    document.getElementById("tts-container");
const caseSection =
    document.getElementById("case-container");
const quizTab =
    document.getElementById("quizTab");
const comicTab =
    document.getElementById("comicTab");
const ttsTab =
    document.getElementById("ttsTab");
const pageTitle =
    document.getElementById("pageTitle");
const caseTab =
    document.getElementById("caseTab");
const listTemplate =
    document.getElementById("list-card-template");

if (!listTemplate) {
    console.error(
        "Template #list-card-template tidak ditemukan."
    );
    throw new Error(
        "Explore gagal dimuat karena template card tidak tersedia."
    );
}

function isPremiumLocked(item) {
    if (!item || !item.premium) return false;
    const unlocked = typeof Storage !== "undefined" && typeof Storage.isUnlocked === "function" && Storage.isUnlocked(item.productId);
    return !unlocked;
}

function withHouseAds(items) {
    if (typeof houseAds === "undefined" || !houseAds.length) return items;
    const result = [];
    let adIndex = 0;
    items.forEach((item, i) => {
        result.push(item);
        if ((i + 1) % 4 === 0) {
            result.push({ ...houseAds[adIndex % houseAds.length], isAd: true });
            adIndex++;
        }
    });
    return result;
}

/* -------------------------------------------------------------------------- */
/* MODAL KONFIRMASI BELI                                                      */
/* -------------------------------------------------------------------------- */
function showBuyModal(item) {
    const overlay = document.getElementById("buyModal");
    if (!overlay || !item) return;

    const priceEl = document.getElementById("buyModalPrice");
    if (priceEl) priceEl.textContent = item.price ? `Rp ${item.price.toLocaleString("id-ID")}` : "";

    const buyBtn = document.getElementById("buyModalBuy");
    if (buyBtn) buyBtn.href = item.mayarUrl || "#";

    overlay.classList.add("show");
}

const buyModalOverlay = document.getElementById("buyModal");
const buyModalCancel = document.getElementById("buyModalCancel");
if (buyModalCancel && buyModalOverlay) {
    buyModalCancel.onclick = () => buyModalOverlay.classList.remove("show");
}
if (buyModalOverlay) {
    buyModalOverlay.onclick = (e) => {
        if (e.target === buyModalOverlay) buyModalOverlay.classList.remove("show");
    };
}

if (searchInput) {
    searchInput.value = query;
}

if (searchForm) {
    searchForm.onsubmit = (e) => {
        e.preventDefault();
        const value = searchInput.value.trim();
        if (!value) return;
        location.href = `explore.html?q=${encodeURIComponent(value)}`;
    };
}

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

    const clone = listTemplate.content.cloneNode(true);
    const card = clone.querySelector(".list-card");
    if (extraClass) {
        card.classList.add(extraClass);
    }

    const badge = clone.querySelector(".featured-badge");
    if (badge) {
        if (item && item.isAd) {
            badge.textContent = "📢 Iklan";
            badge.classList.add("ad-badge");
        } else if (item && item.premium) {
            badge.textContent = "👑 Premium";
        } else {
            badge.remove();
        }
    }

    clone.querySelector(".list-thumb").src = thumbnail;
    clone.querySelector(".list-thumb").alt = title;

    clone.querySelector(".list-title").textContent = title;
    clone.querySelector(".list-description").textContent = description;

    const button =
        clone.querySelector(".list-btn");
    button.textContent = buttonText;
    button.disabled = disabled;

    if (!disabled && onClick) {
        button.onclick = onClick;
    }
    container.appendChild(clone);
}

function showQuiz() {

    pageTitle.textContent = "Semua Kuis";

    quizSection.style.display = "block";
    comicSection.style.display = "none";
    ttsSection.style.display = "none";
    caseSection.style.display = "none";

// showQuiz()
quizTab?.classList.add("active");
comicTab?.classList.remove("active");
ttsTab?.classList.remove("active");
caseTab?.classList.remove("active");


    quizSection.innerHTML = "";
    withHouseAds(quizzes).forEach(quiz => {
    if (quiz.isAd) {
        createListCard({
            container: quizSection,
            thumbnail: quiz.thumbnail,
            title: quiz.title,
            description: quiz.description,
            item: quiz,
            buttonText: "Lihat",
            extraClass: "ad-card",
            onClick() {
                window.open(quiz.url, "_blank", "noopener");
            }
        });
        return;
    }
    createListCard({
        container: quizSection,
        thumbnail: quiz.thumbnail,
        title: quiz.title,
        description: quiz.description,
        item: quiz,

        buttonText:
            Storage.isFinished(quiz.productId)
                ? "Selesai"
                : (isPremiumLocked(quiz) ? "Beli" : "Mulai"),

        disabled: Storage.isFinished(quiz.productId),

        onClick() {
            if (isPremiumLocked(quiz)) {
                showBuyModal(quiz);
                return;
            }
            location.href =
                `quiz.html?id=${quiz.file}`;
        }

    });
    });
}

function showComic() {

    pageTitle.textContent = "Semua Komik";

    quizSection.style.display = "none";
    comicSection.style.display = "block";
    ttsSection.style.display = "none";
    caseSection.style.display = "none";

// showComic()
quizTab?.classList.remove("active");
comicTab?.classList.add("active");
ttsTab?.classList.remove("active");
caseTab?.classList.remove("active");

   comicSection.innerHTML = "";
    withHouseAds(comics).forEach(comic => {
    if (comic.isAd) {
        createListCard({
            container: comicSection,
            thumbnail: comic.thumbnail,
            title: comic.title,
            description: comic.description,
            item: comic,
            buttonText: "Lihat",
            extraClass: "ad-card",
            onClick() {
                window.open(comic.url, "_blank", "noopener");
            }
        });
        return;
    }
    
    createListCard({
        container: comicSection,
        thumbnail: comic.thumbnail,
        title: comic.title,
        description: comic.description,
        item: comic,
        buttonText: isPremiumLocked(comic) ? "Beli" : "Baca",
        onClick() {
            if (isPremiumLocked(comic)) {
                showBuyModal(comic);
                return;
            }
            location.href =
                `comic.html?id=${comic.id}`;
        }
    });
    });
}
function showTTS() {

    pageTitle.textContent = "Semua TTS";

    quizSection.style.display = "none";
    comicSection.style.display = "none";
    ttsSection.style.display = "block";
    caseSection.style.display = "none";

// showTTS()
quizTab?.classList.remove("active");
comicTab?.classList.remove("active");
ttsTab?.classList.add("active");
caseTab?.classList.remove("active");

    ttsSection.innerHTML = "";
    withHouseAds(ttsList).forEach(tts => {
    if (tts.isAd) {
        createListCard({
            container: ttsSection,
            thumbnail: tts.thumbnail,
            title: tts.title,
            description: tts.description,
            item: tts,
            buttonText: "Lihat",
            extraClass: "ad-card",
            onClick() {
                window.open(tts.url, "_blank", "noopener");
            }
        });
        return;
    }
        
    createListCard({
        container: ttsSection,
        thumbnail: tts.thumbnail,
        title: tts.title,
        description: tts.description,
        item: tts,
        buttonText: isPremiumLocked(tts) ? "Beli" : "Main",
        onClick() {
            if (isPremiumLocked(tts)) {
                showBuyModal(tts);
                return;
            }
            location.href =
                `tts.html?puzzle=tts${tts.id}`;
        }
    });
    });

}

function showCase() {

    pageTitle.textContent = "Semua Kartu Kasus";

    quizSection.style.display = "none";
    comicSection.style.display = "none";
    ttsSection.style.display = "none";
    caseSection.style.display = "block";

// showCase()
quizTab?.classList.remove("active");
comicTab?.classList.remove("active");
ttsTab?.classList.remove("active");
caseTab?.classList.add("active");

    caseSection.innerHTML = "";
    withHouseAds(cases).forEach(caseData => {
 
    if (caseData.isAd) {
        createListCard({
            container: caseSection,
            thumbnail: caseData.thumbnail,
            title: caseData.title,
            description: caseData.description,
            item: caseData,
            buttonText: "Lihat",
            extraClass: "ad-card",
            onClick() {
                window.open(caseData.url, "_blank", "noopener");
            }
        });
        return;
    }
        
    createListCard({
        container: caseSection,
        thumbnail: caseData.thumbnail,
        title: caseData.title,
        description: caseData.description,
        item: caseData,
        buttonText: "Lihat →",
        onClick() {
    location.href = `case.html?case=${caseData.file}`;
}

    });
    });
}

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


async function showSearchResults(searchQuery) {
    pageTitle.textContent = `Hasil pencarian: "${searchQuery}"`;

    if (exploreTabs) exploreTabs.style.display = "none";
    quizSection.style.display = "none";
    comicSection.style.display = "none";
    ttsSection.style.display = "none";
    caseSection.style.display = "none";
    searchResultsSection.style.display = "block";

    searchEmpty.style.display = "none";
    searchEmpty.innerHTML = "";
    [searchQuizList, searchTtsList, searchCaseList, searchComicList].forEach(
        list => { list.innerHTML = ""; }
    );

    const results = await performSearch(searchQuery);

    renderSearchGroup(searchQuizGroup, searchQuizList, results.quizzes, "quiz");
    renderSearchGroup(searchTtsGroup, searchTtsList, results.tts, "tts");
    renderSearchGroup(searchCaseGroup, searchCaseList, results.cases, "case");
    renderSearchGroup(searchComicGroup, searchComicList, results.comics, "comic");

    const totalResults =
        results.quizzes.length + results.tts.length +
        results.cases.length + results.comics.length;

    if (totalResults === 0) {
        searchEmpty.innerHTML =
            `Tidak ditemukan hasil untuk "${searchQuery}".<br>` +
            `Coba kata kunci lain, atau kembali ke <a href="index.html">Beranda</a> ` +
            `/ <a href="explore.html?tab=quiz">Jelajah</a>.`;
        searchEmpty.style.display = "block";
    }
}

function renderSearchGroup(groupEl, listEl, items, type) {
    if (!items || !items.length) {
        groupEl.style.display = "none";
        return;
    }
    groupEl.style.display = "block";
    listEl.style.display = "block";

    items.forEach(item => {
        if (type === "quiz") {
            createListCard({
                container: listEl,
                thumbnail: item.thumbnail,
                title: item.title,
                description: item.description,
                item,
                buttonText: Storage.isFinished(item.productId)
                    ? "Sudah Selesai"
                    : (isPremiumLocked(item) ? "Beli" : "Mulai"),
                disabled: Storage.isFinished(item.productId),
                onClick() {
                    if (isPremiumLocked(item)) {
                        showBuyModal(item);
                        return;
                    }
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
                    if (isPremiumLocked(item)) {
                        showBuyModal(item);
                        return;
                    }
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
                    if (isPremiumLocked(item)) {
                        showBuyModal(item);
                        return;
                    }
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
                    if (isPremiumLocked(item)) {
                        showBuyModal(item);
                        return;
                    }
                    location.href = `comic.html?id=${item.id}`;
                }
            });
        }
    });
}
