const raw = sessionStorage.getItem("result");

if (!raw) {
    window.location.href = "index.html";
}

const data = JSON.parse(raw);

const quiz = data.quiz;
const session = data.session;

const nextQuizBtn = document.getElementById("nextQuizBtn");
if (nextQuizBtn) {
  const idx =
    typeof quizzes !== "undefined" && data.file
      ? quizzes.findIndex((q) => q.file === data.file)
      : -1;
  const next = idx !== -1 ? quizzes[idx + 1] : null;

  if (next) {
    nextQuizBtn.disabled = false;
    nextQuizBtn.onclick = () => {
      window.location.href = `quiz.html?id=${next.file}`;
    };
  } else {
    nextQuizBtn.disabled = true;
    nextQuizBtn.textContent = "Kuis Berikutnya Segera Hadir";
    nextQuizBtn.title = "Cek secara berkala untuk kuis berikutnya";
  }
}

const scoreElement = document.getElementById("score");
const summaryElement = document.getElementById("summary");
const reviewList = document.getElementById("reviewList");

const total = quiz.questions.length;
const score = session.score;

scoreElement.textContent = `${score} / ${total}`;
summaryElement.textContent = `Jawaban benar ${score} dari ${total} soal`;

quiz.questions.forEach((q, index) => {

    const card = document.createElement("div");
    card.className = "review-card";

    const userAnswer = session.answers[index];

    const correct = userAnswer === q.answer;

    const answerText =
        userAnswer !== undefined
            ? q.options[userAnswer]
            : "Tidak dijawab";

    card.innerHTML = `

    <h3>Soal ${index + 1}</h3>
    
    ${q.image ? `<img src="${q.image}" class="review-image">` : ""}
    
    <p class="review-question">
        ${q.q}
    </p>
    
    <p>
        <strong>Jawaban Anda :</strong>
        ${answerText}
    </p>
    
    <div class="status ${correct ? "status-correct" : "status-wrong"}">
        ${correct ? "Benar" : "Salah"}
    </div>
    
    ${!correct ? `
<p>
    <strong>Jawaban Benar :</strong>
    ${q.options[q.answer]}
</p>
` : ""}
    
    <div class="explanation">
        <strong>Pembahasan</strong><br><br>
        ${q.explanation}
    </div>
`;

    reviewList.appendChild(card);

});
