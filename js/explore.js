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
    if (badge) badge.remove();

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

    quizTab.classList.add("active");
    comicTab.classList.remove("active");
    ttsTab.classList.remove("active");
    caseTab.classList.remove("active");

    quizSection.innerHTML = "";
    quizzes.forEach(quiz => {

    createListCard({
        container: quizSection,
        thumbnail: quiz.thumbnail,
        title: quiz.title,
        description: quiz.description,
        item: quiz,

        buttonText:
            Storage.isFinished(quiz.productId)
                ? "Sudah Selesai"
                : "Mulai",

        disabled: Storage.isFinished(quiz.productId),

        onClick() {
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

    quizTab.classList.remove("active");
    comicTab.classList.add("active");
    ttsTab.classList.remove("active");
    caseTab.classList.remove("active");

    comicSection.innerHTML = "";
    comics.forEach(comic => {

    createListCard({
        container: comicSection,
        thumbnail: comic.thumbnail,
        title: comic.title,
        description: comic.description,
        item: comic,
        buttonText: "Baca",
        onClick() {
            location.href =
                `komik.html?id=${comic.id}`;
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

    quizTab.classList.remove("active");
    comicTab.classList.remove("active");
    ttsTab.classList.add("active");
    caseTab.classList.remove("active");

    ttsSection.innerHTML = "";
    ttsList.forEach(tts => {
    createListCard({
        container: ttsSection,
        thumbnail: tts.thumbnail,
        title: tts.title,
        description: tts.description,
        item: tts,
        buttonText: "Main",
        onClick() {
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

    quizTab.classList.remove("active");
    comicTab.classList.remove("active");
    ttsTab.classList.remove("active");
    caseTab.classList.add("active");

    caseSection.innerHTML = "";
    cases.forEach(caseData => {

    createListCard({
        container: caseSection,
        thumbnail: caseData.thumbnail,
        title: caseData.title,
        description: caseData.description,
        item: caseData,
        buttonText: "Lihat",
        onClick() {
            location.href =
                `case.html?case=${caseData.file}`;
        }
    });
    });
}

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
