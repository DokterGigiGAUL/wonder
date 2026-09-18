const params = new URLSearchParams(window.location.search);
const file = params.get("ebook") || "ebook1";

const ebook = ebooks.find(item => item.file === file);

if (!ebook) {

    document.body.innerHTML = "<h2>Ebook tidak ditemukan.</h2>";

    throw new Error("Ebook tidak ditemukan.");

}

document.title = ebook.title;

document.getElementById("ebook-title").textContent =
    ebook.title;

document.getElementById("ebook-price").textContent =
    `Rp ${ebook.price.toLocaleString("id-ID")}`;

document.getElementById("ebook-description").textContent =
    ebook.description;

document.getElementById("ebook-pages").textContent =
    `📄 ${ebook.pages} Halaman`;

document.getElementById("ebook-release").textContent =
    `🗓️ ${new Date(ebook.releaseDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })}`;

    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
      backBtn.onclick = () => {
        window.location.href = "index.html";
      };
    }

//const buyButton =
//    document.getElementById("buyButton");

//buyButton.href =
//    ebook.mayarUrl + "?iframe=true";

const buyButton = document.getElementById("buyButton");

buyButton.outerHTML = `
<a
    id="buyButton"
    class="btn btn-primary iframe-lightbox-link"
    href="${ebook.mayarUrl}?iframe=true"
    data-padding-bottom="30%"
    data-scrolling="true">
    Beli Sekarang
</a>`;

const sampleButton =
    document.getElementById("sampleButton");

sampleButton.onclick = () => {

    const overlay = document.createElement("div");

    overlay.className = "pdf-overlay";

    overlay.innerHTML = `
<div class="pdf-modal">

<button class="pdf-close">&times;</button>

<iframe
src="${ebook.samplePdf}"
allowfullscreen>
</iframe>

</div>`;

    document.body.appendChild(overlay);
    overlay.querySelector(".pdf-close").onclick = () =>
        overlay.remove();

    overlay.onclick = e => {

        if (e.target === overlay)
            overlay.remove();
    };
};

const slider =
    document.getElementById("preview-slider");

const dots =
    document.getElementById("preview-dots");

ebook.preview.forEach((src, index) => {

    const img = document.createElement("img");

    img.src = src;

    img.className = "preview-image";

    if (index === 0)
        img.classList.add("active");

    slider.appendChild(img);

    const dot = document.createElement("span");

    dot.className = "preview-dot";

    if (index === 0)
        dot.classList.add("active");

    dots.appendChild(dot);

});

let current = 0;

const images =
    slider.querySelectorAll(".preview-image");

const dotItems =
    dots.querySelectorAll(".preview-dot");

function showSlide(index) {

    images.forEach(img =>
        img.classList.remove("active"));

    dotItems.forEach(dot =>
        dot.classList.remove("active"));

    images[index].classList.add("active");

    dotItems[index].classList.add("active");

}

setInterval(() => {

    current++;

    if (current >= images.length)
        current = 0;

    showSlide(current);

}, 3000);

