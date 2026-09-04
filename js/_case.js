document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("case") || "case1";

  const imageFlip = document.getElementById("imageFlip");
  const infoFlip = document.getElementById("infoFlip");

  try {
    const response = await fetch(`assets/metadata/kasus/${file}.json`);
    if (!response.ok) {
      throw new Error(`Gagal memuat data kasus: ${file}.json`);
    }
    const data = await response.json();

    document.getElementById("case-image").src = data.image;
    document.getElementById("case-image-back").src = data.image;
    document.getElementById("patient").textContent = `${data.gender}, ${data.age}`;
    document.getElementById("anamnesis").textContent = data.anamnesis;
    document.getElementById("clinicalExaminations").textContent = data.clinicalExaminations;
    document.getElementById("diagnosis").textContent = data.diagnosis;

    const ddList = document.getElementById("dd-list");
    if (ddList && data.differentialDiagnosis) {
      ddList.innerHTML = "";
      data.differentialDiagnosis.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ddList.appendChild(li);
      });
    }

    const clinicalList = document.getElementById("clinical-list");
    if (clinicalList && data.clinicalExamination) {
      clinicalList.innerHTML = "";
      data.clinicalExamination.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        clinicalList.appendChild(li);
      });
    }

    document.getElementById("lesion-description").textContent = data.lesionDescription || "";

    const premium = data.premiumContent;

    document.getElementById("pathophysiology").textContent = premium?.pathophysiology || "-";
    document.getElementById("supporting-examination").textContent = premium?.supportingExamination || "-";
    document.getElementById("treatment-plan").textContent = premium?.treatmentPlan || "-";
    document.getElementById("follow-up").textContent = premium?.followUp || "-";

    const ul = document.getElementById("key-points");
    if (ul && premium?.keyPoints) {
      ul.innerHTML = "";
      premium.keyPoints.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
    }

    const currentId = Number(data.id);
    const prevBtns = document.querySelectorAll(".prev-case");
    const nextBtns = document.querySelectorAll(".next-case");

    prevBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (currentId > 1) {
          location.href = `case.html?case=case${currentId - 1}`;
        }
      };
      btn.disabled = currentId === 1;
    });

    nextBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (typeof cases !== "undefined" && currentId < cases.length) {
          location.href = `case.html?case=case${currentId + 1}`;
        }
      };
      btn.disabled = typeof cases !== "undefined" ? currentId === cases.length : false;
    });

    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
      backBtn.onclick = () => {
        window.location.href = "index.html";
      };
    }
  } catch (err) {
    console.error(err);
  }

  function showDiagnosis(e) {
    e.stopPropagation();
    if (imageFlip) imageFlip.classList.toggle("flipped");
    if (infoFlip) infoFlip.classList.toggle("flipped");
  }

  if (imageFlip) imageFlip.onclick = showDiagnosis;
  if (infoFlip) infoFlip.onclick = showDiagnosis;
});
