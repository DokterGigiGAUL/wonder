document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("case") || "case1";

  const imageFlip = document.getElementById("imageFlip");
  const infoFlip = document.getElementById("infoFlip");

  const openPremiumModal = (productId) => {
    if (typeof window.showPremiumDialog === "function") {
      window.showPremiumDialog(productId);
    } else if (typeof showPremiumDialog === "function") {
      showPremiumDialog(productId);
    }
  };

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
    const caseMeta = typeof cases !== "undefined" ? cases.find((c) => c.file === file) : null;
    const productId = caseMeta?.productId || data.productId;

    // Verifikasi Akses Async
    let hasAccess = !data.premium;
    if (data.premium) {
      hasAccess = await window.canAccessContent(productId);
    }

    if (hasAccess) {
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
    } else {
      const banner = document.getElementById("premium-banner");
      if (banner) {
        banner.style.display = "block";
        banner.innerHTML = `
          <h3>🔒 Konten Premium</h3>
          <p>Buka akses Premium untuk mempelajari:</p>
          <ul>
            <li>Patofisiologi</li>
            <li>Pemeriksaan Penunjang</li>
            <li>Rencana Perawatan</li>
            <li>Follow Up</li>
            <li>Key Points</li>
          </ul>
          <button id="premium-btn" class="btn btn-primary">Buka Premium</button>
        `;

        document.getElementById("premium-btn").onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openPremiumModal(productId);
        };
      }

      ["pathophysiology", "supporting-examination", "treatment-plan", "follow-up", "key-points"].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.parentElement) el.parentElement.style.display = "none";
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
