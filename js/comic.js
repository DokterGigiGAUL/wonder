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
        window.location.href = `comic.html?id=${comics[currentIndex - 1].id}`;
      }
    });
  }

  if (nextButton) {
    nextButton.disabled = currentIndex === comics.length - 1;
    nextButton.addEventListener("click", () => {
      if (currentIndex < comics.length - 1) {
        const nextComic = comics[currentIndex + 1];
        window.location.href = `comic.html?id=${nextComic.id}`;
      }
    });
  }
});
