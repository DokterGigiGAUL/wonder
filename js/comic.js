document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const comicId = parseInt(params.get("id")) || 1;

  if (typeof comics === "undefined") {
    console.error("Data comics tidak ditemukan.");
    return;
  }

  const currentIndex = comics.findIndex((comic) => comic.id === comicId);
  const currentComic = comics[currentIndex];

  if (currentIndex === -1 || !currentComic) {
    window.location.href = "index.html";
    return;
  }

  const openPremiumModal = (productId) => {
    if (typeof window.showPremiumDialog === "function") {
      window.showPremiumDialog(productId);
    } else if (typeof showPremiumDialog === "function") {
      showPremiumDialog(productId);
    }
  };

  let hasAccess = !currentComic.premium;
  if (currentComic.premium) {
    hasAccess = await window.canAccessContent(currentComic.productId);
  }

  // PENTING: Jika tidak ada akses, tampilkan modal dan JANGAN me-redirect ke Beranda
  if (!hasAccess) {
    openPremiumModal(currentComic.productId);
    return;
  }

  const title = document.getElementById("comic-title");
  const imageContainer = document.getElementById("comic-image");
  const backBtn = document.getElementById("backBtn");

  if (backBtn) {
    backBtn.onclick = () => {
      window.location.href = "index.html";
    };
  }

  if (title) title.textContent = currentComic.title;

  if (imageContainer) {
    imageContainer.innerHTML = "";
    currentComic.images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = currentComic.title;
      img.className = "comic-image";
      img.loading = "lazy";
      imageContainer.appendChild(img);
    });
  }

  const prevButton = document.getElementById("prev-comic");
  const nextButton = document.getElementById("next-comic");

  if (prevButton) {
    prevButton.disabled = currentIndex === 0;
    prevButton.addEventListener("click", () => {
      if (currentIndex > 0) {
        window.location.href = `komik.html?id=${comics[currentIndex - 1].id}`;
      }
    });
  }

  if (nextButton) {
    nextButton.disabled = currentIndex === comics.length - 1;
    nextButton.addEventListener("click", async () => {
      if (currentIndex < comics.length - 1) {
        const nextComic = comics[currentIndex + 1];

        let canNext = !nextComic.premium;
        if (nextComic.premium) {
          canNext = await window.canAccessContent(nextComic.productId);
        }

        if (!canNext) {
          openPremiumModal(nextComic.productId);
          return;
        }

        window.location.href = `komik.html?id=${nextComic.id}`;
      }
    });
  }
});
