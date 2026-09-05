document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("case") || "case1";

  const imageFlip = document.getElementById("imageFlip");
  const infoFlip = document.getElementById("infoFlip");

  const unlockedParam = params.get("unlocked");
  if (unlockedParam && typeof Storage !== "undefined") {
    Storage.unlock(unlockedParam);
  }

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

    const metadata = typeof cases !== "undefined" ? cases.find((c) => c.file === file) : null;
    const isPremium = metadata ? metadata.premium : !!data.premium;
    const isUnlocked = !isPremium || (typeof Storage !== "undefined" && Storage.isUnlocked(metadata ? metadata.productId : `case${data.id}`));

    const premiumSection = document.getElementById("premium-section");
    const premiumBanner = document.getElementById("premium-banner");
    const premium = data.premiumContent;

    const pathoEl = document.getElementById("pathophysiology");
    const supportEl = document.getElementById("supporting-examination");
    const treatmentEl = document.getElementById("treatment-plan");
    const followUpEl = document.getElementById("follow-up");
    const keyPointsEl = document.getElementById("key-points");

    if (!isUnlocked) {
      // Kasus premium, belum dibeli: tampilkan banner beli, sembunyikan isinya
      if (premiumSection) premiumSection.style.display = "block";

      [pathoEl, supportEl, treatmentEl].forEach((el) => {
        if (!el) return;
        el.textContent = "";
        el.classList.add("premium-hidden");
      });
      if (followUpEl) {
        followUpEl.textContent = "";
        followUpEl.classList.add("premium-hidden");
      }
      if (keyPointsEl) {
        keyPointsEl.innerHTML = "";
        keyPointsEl.classList.add("premium-hidden");
      }

      if (premiumBanner) {
        premiumBanner.style.display = "block";
        const price = metadata ? metadata.price : data.price;
        premiumBanner.innerHTML = `
          <h3>Konten Premium</h3>
          <p class="lock">🔒 Konten terkunci</p>
          <p>Analisis patofisiologi, pemeriksaan penunjang, rencana perawatan, follow up, dan key points tersedia setelah kasus ini dibeli${price ? ` — Rp ${price.toLocaleString("id-ID")}` : ""}.</p>
          <button class="btn btn-primary" id="buyCaseBtn">Beli Sekarang</button>
        `;
        const buyBtn = document.getElementById("buyCaseBtn");
        if (buyBtn) {
          buyBtn.onclick = () => {
            window.open((metadata && metadata.mayarUrl) || "#", "_blank");
          };
        }
      }
    } else {
      // Kasus gratis (contoh/preview) atau kasus premium yang sudah dibeli: tampilkan isi seperti biasa
      if (premiumSection) premiumSection.style.display = "block";
      if (premiumBanner) premiumBanner.style.display = "none";

      if (pathoEl) pathoEl.textContent = premium?.pathophysiology || "-";
      if (supportEl) supportEl.textContent = premium?.supportingExamination || "-";
      if (treatmentEl) treatmentEl.textContent = premium?.treatmentPlan || "-";
      if (followUpEl) followUpEl.textContent = premium?.followUp || "-";

      if (keyPointsEl && premium?.keyPoints) {
        keyPointsEl.innerHTML = "";
        premium.keyPoints.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          keyPointsEl.appendChild(li);
        });
      }
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
  } 
  
  catch (err) {
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
