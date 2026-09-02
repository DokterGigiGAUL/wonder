const params =
    new URLSearchParams(location.search);
const tab =
    params.get("tab") || "quiz";
const quizSection =
    document.getElementById("quiz-list");
const comicSection =
    document.getElementById("comics-container");
const ttsSection =
    document.getElementById("tts-container");
const caseSection =
    document.getElementById("case-container");
/*
const ebookSection =
    document.getElementById("ebook-container");
*/
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
/*
const ebookTab =
    document.getElementById("ebookTab");
*/
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


/*if (tab === "ebook") {
    showEbook();
} else */
    if (tab === "comic") {
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
    price = null,
    buttonText,
    premium = false,
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
    if (premium) {
        if (PurchaseManager.hasAccess(item)) {
            badge.textContent = "🟢 Akses permanen";
        } else {
            badge.textContent = "👑 Premium";
        }
    } else {
    badge.remove();
    }
    
    clone.querySelector(".list-thumb").src = thumbnail;
    clone.querySelector(".list-thumb").alt = title;

    clone.querySelector(".list-title").textContent = title;
/*    
    clone.querySelector(".list-description").textContent = description;
    const priceEl = clone.querySelector(".list-price");

    if (price > 0) {
    priceEl.textContent =
        `Rp ${price.toLocaleString("id-ID")}`;
    } else {
    priceEl.remove();
    }
    
    const button = clone.querySelector(".list-btn");*/
    
    clone.querySelector(".list-description").textContent = description;

    /* Harga hanya ditampilkan untuk konten premium */ 
    
    if (premium && item.price != null) {

        const info =
            clone.querySelector(".list-info");

        const priceEl =
            document.createElement("p");

        priceEl.className =
            "list-price";

        priceEl.textContent =
            `Rp ${item.price.toLocaleString("id-ID")}`;

        info.insertBefore(
            priceEl,
            clone.querySelector(".list-btn")
        );
    }
    
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
    //ebookSection.style.display = "none";

    quizTab.classList.add("active");
    comicTab.classList.remove("active");
    ttsTab.classList.remove("active");
    caseTab.classList.remove("active");
    //ebookTab.classList.remove("active");
    
    quizSection.innerHTML = "";
    quizzes.forEach(quiz => {
        
    createListCard({
        container: quizSection,
        thumbnail: quiz.thumbnail,
        title: quiz.title,
        description: quiz.description,
        item: quiz,
        premium: quiz.premium,
        price: quiz.price,
    
        buttonText: quiz.premium
    ? "🔒 Buka"
    : (
        Storage.isFinished(quiz.productId)
            ? "Sudah Selesai"
            : "Mulai"
      ),
    
        disabled: Storage.isFinished(quiz.productId),
    
        onClick() {
    
            if (!PurchaseManager.hasAccess(quiz)) {
                showPremiumDialog(quiz.productId);
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
    //ebookSection.style.display = "none";

    quizTab.classList.remove("active");
    comicTab.classList.add("active");
    ttsTab.classList.remove("active");
    caseTab.classList.remove("active");
    //ebookTab.classList.remove("active");

    comicSection.innerHTML = "";
    comics.forEach(comic => {

    createListCard({
        container: comicSection,
        thumbnail: comic.thumbnail,
        title: comic.title,
        description: comic.description,
        item: comic,
        premium: comic.premium,
        price: comic.price,
        buttonText: comic.premium
    ? "🔒 Buka"
    : "Baca",
        onClick() {
        if (!PurchaseManager.hasAccess(comic)) {
        showPremiumDialog(comic.productId);
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
    //ebookSection.style.display = "none";

    quizTab.classList.remove("active");
    comicTab.classList.remove("active");
    ttsTab.classList.add("active");
    caseTab.classList.remove("active");
    //ebookTab.classList.remove("active");

    ttsSection.innerHTML = "";
    ttsList.forEach(tts => {
    createListCard({
        container: ttsSection,
        thumbnail: tts.thumbnail,
        title: tts.title,
        description: tts.description,
        item: tts,
        premium: tts.premium,
                    price: tts.price,
    
        buttonText: tts.premium
    ? "🔒 Buka"
    : "Main",
        onClick() {
            if (!PurchaseManager.hasAccess(tts)) {
        showPremiumDialog(tts.productId);
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
    //ebookSection.style.display = "none";

    quizTab.classList.remove("active");
    comicTab.classList.remove("active");
    ttsTab.classList.remove("active");
    caseTab.classList.add("active");
    //ebookTab.classList.remove("active");
    
    caseSection.innerHTML = "";
    cases.forEach(caseData => {

    createListCard({
        container: caseSection,
        thumbnail: caseData.thumbnail,
        title: caseData.title,
        description: caseData.description,
        item: caseData,
        premium: caseData.premium,
                    price: caseData.price,
    
        buttonText: caseData.premium
    ? "🔒 Buka"
    : "Lihat",
    
        onClick() {
            if (!PurchaseManager.hasAccess(caseData)) {
        showPremiumDialog(caseData.productId);
        return;
    }
    location.href =
        `case.html?case=${caseData.file}`;
        }
    });
        });
    }
/*
function showEbook() {
    pageTitle.textContent = "Semua Ebook";

    quizSection.style.display = "none";
    comicSection.style.display = "none";
    ttsSection.style.display = "none";
    caseSection.style.display = "none";
    ebookSection.style.display = "block";

    quizTab.classList.remove("active");
    comicTab.classList.remove("active");
    ttsTab.classList.remove("active");
    caseTab.classList.remove("active");
    ebookTab.classList.add("active");

    ebookSection.innerHTML = "";
    ebooks
        .slice()
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        .forEach(ebook => {

            createListCard({
                container: ebookSection,
                thumbnail: ebook.thumbnail,
                title: ebook.title,
                description: ebook.description,
                item: ebook,
                buttonText: "Detail",
                onClick() {
                    location.href =
                        `ebook.html?ebook=${ebook.file}`;
                }
            });
        });
}
*/
quizTab.onclick = () => {
    history.replaceState(
        {},
        "",
        "explore.html?tab=quiz"
    );
    showQuiz();
};

comicTab.onclick = () => {
    history.replaceState(
        {},
        "",
        "explore.html?tab=comic"
    );
    showComic();
};

ttsTab.onclick = () => {
    history.replaceState(
        {},
        "",
        "explore.html?tab=tts"
    );
    showTTS();
};

caseTab.onclick = () => {
    history.replaceState(
        {},
        "",
        "explore.html?tab=case"
    );
    showCase();
};
/*
ebookTab.onclick = () => {

    history.replaceState(
        {},
        "",
        "explore.html?tab=ebook"
    );

    showEbook();

};
*/
