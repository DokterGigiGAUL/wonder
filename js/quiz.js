const params = new URLSearchParams(window.location.search);
const quizId = params.get("id");

let quiz = null;
let session = null;

const title = document.getElementById("quizTitle");
const counter = document.getElementById("questionCounter");
const image = document.getElementById("questionImage");
const question = document.getElementById("questionText");
const choices = document.getElementById("choices");
const progress = document.getElementById("progressBar");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");

const progressWrapper = document.getElementById("progressWrapper");
const questionCard = document.getElementById("questionCard");
const quizNavigation = document.getElementById("quizNavigation");
const premiumLock = document.getElementById("premiumLock");
const premiumLockPrice = document.getElementById("premiumLockPrice");
const premiumLockBtn = document.getElementById("premiumLockBtn");

document.addEventListener("DOMContentLoaded", () => {
  init();
});

async function init() {
  if (typeof quizzes === "undefined") {
    alert("Data kuis tidak dapat dimuat.");
    window.location.href = "index.html";
    return;
  }

  const metadata = quizzes.find((q) => q.file === quizId);

  if (!metadata) {
    alert("Kuis tidak ditemukan.");
    window.location.href = "index.html";
    return;
  }

  const unlockedParam = params.get("unlocked");
  if (unlockedParam && typeof Storage !== "undefined") {
    Storage.unlock(unlockedParam);
  }

  const isUnlocked = typeof Storage !== "undefined" && Storage.isUnlocked(metadata.productId);

  if (metadata.premium && !isUnlocked) {
    showPremiumLock(metadata);
    return;
  }

  try {
    const response = await fetch(`assets/metadata/kuis/${quizId}.json`);
    quiz = await response.json();

    if (typeof Storage !== "undefined" && Storage.isFinished(quiz.id)) {
      alert("Kuis sudah selesai dikerjakan.");
      window.location.href = "index.html";
      return;
    }

    if (typeof Storage !== "undefined") {
      session = Storage.get(quiz.id);
      if (!session) {
        session = Storage.create(quiz.id, quiz.timeLimit);
      }
    }

    if (title) title.textContent = quiz.title;
    if (typeof startTimer === "function" && Storage) {
      startTimer(Storage.remainingTime(quiz.id));
    }

    renderQuestion();
  } catch (err) {
    console.error("Gagal memuat kuis:", err);
  }
}

function showPremiumLock(metadata) {
  if (title) title.textContent = metadata.title;

  if (progressWrapper) progressWrapper.style.display = "none";
  if (questionCard) questionCard.style.display = "none";
  if (quizNavigation) quizNavigation.style.display = "none";

  if (premiumLock) {
    premiumLock.style.display = "block";
    if (premiumLockPrice) {
      premiumLockPrice.textContent = `Rp ${metadata.price.toLocaleString("id-ID")}`;
    }
    if (premiumLockBtn) {
      premiumLockBtn.href = metadata.mayarUrl || "#";
    }
  }
}

function renderQuestion() {
  if (!session || !quiz) return;

  const index = session.currentQuestion;
  const q = quiz.questions[index];

  if (counter) counter.textContent = `Soal ${index + 1} dari ${quiz.questions.length}`;
  if (progress) progress.style.width = ((index + 1) / quiz.questions.length) * 100 + "%";

  if (image) {
    if (q.image) {
      image.src = q.image;
      image.style.display = "block";
    } else {
      image.style.display = "none";
    }
  }

  if (question) question.textContent = q.q;

  if (choices) {
    choices.innerHTML = "";
    q.options.forEach((item, i) => {
      const div = document.createElement("div");
      div.className = "choice";
      div.textContent = item;

      if (session.answers[index] === i) {
        div.classList.add("selected");
      }

      div.onclick = () => {
        session.answers[index] = i;
        if (typeof Storage !== "undefined") Storage.save(quiz.id, session);
        renderQuestion();
      };

      choices.appendChild(div);
    });
  }

  if (prevBtn) prevBtn.disabled = index === 0;

  if (nextBtn) {
    if (index === quiz.questions.length - 1) {
      nextBtn.textContent = "Selesai";
    } else {
      nextBtn.textContent = "Selanjutnya";
    }
  }
}

if (prevBtn) {
  prevBtn.onclick = () => {
    if (session && session.currentQuestion > 0) {
      session.currentQuestion--;
      if (typeof Storage !== "undefined") Storage.save(quiz.id, session);
      renderQuestion();
    }
  };
}

if (nextBtn) {
  nextBtn.onclick = () => {
    if (session && quiz) {
      if (session.currentQuestion < quiz.questions.length - 1) {
        session.currentQuestion++;
        if (typeof Storage !== "undefined") Storage.save(quiz.id, session);
        renderQuestion();
      } else {
        submitQuiz();
      }
    }
  };
}

if (backBtn) {
  backBtn.onclick = () => {
    if (confirm("Keluar dari kuis?")) {
      if (typeof stopTimer === "function") stopTimer();
      window.location.href = "index.html";
    }
  };
}

function submitQuiz() {
  if (typeof stopTimer === "function") stopTimer();

  let score = 0;
  quiz.questions.forEach((q, i) => {
    if (session.answers[i] === q.answer) {
      score++;
    }
  });

  session.score = score;
  if (typeof Storage !== "undefined") Storage.finish(quiz.id, score);

  sessionStorage.setItem(
    "result",
    JSON.stringify({
      quiz: quiz,
      session: session,
    })
  );
  window.location.href = "result.html";
}
