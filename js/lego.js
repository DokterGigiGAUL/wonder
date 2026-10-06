const params = new URLSearchParams(window.location.search);
const file = params.get("lego") || "lego1";

const lego = legoSets.find(item => item.file === file);

if (!lego) {
    document.body.innerHTML = "<h2>Produk tidak ditemukan.</h2>";
    throw new Error("Produk lego tidak ditemukan.");
}

document.title = lego.title;

document.getElementById("lego-title").textContent = lego.title;

document.getElementById("lego-price").textContent =
    `Rp ${lego.price.toLocaleString("id-ID")}`;

document.getElementById("lego-description").textContent = lego.description;

const backBtn = document.getElementById("legoBackBtn");
if (backBtn) {
    backBtn.onclick = () => {
        window.location.href = "index.html";
    };
}

const buyButton = document.getElementById("buyButton");
buyButton.outerHTML = `
<a
    id="buyButton"
    class="btn btn-primary iframe-lightbox-link"
    href="${lego.mayarUrl}?iframe=true"
    data-padding-bottom="30%"
    data-scrolling="true">
    Beli Sekarang
</a>`;

const slider = document.getElementById("preview-slider");
const dots = document.getElementById("preview-dots");

lego.gallery.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "preview-image";
    if (index === 0) img.classList.add("active");
    slider.appendChild(img);

    const dot = document.createElement("span");
    dot.className = "preview-dot";
    if (index === 0) dot.classList.add("active");
    dots.appendChild(dot);
});

let current = 0;
const images = slider.querySelectorAll(".preview-image");
const dotItems = dots.querySelectorAll(".preview-dot");

function showSlide(index) {
    images.forEach(img => img.classList.remove("active"));
    dotItems.forEach(dot => dot.classList.remove("active"));
    images[index].classList.add("active");
    dotItems[index].classList.add("active");
}

setInterval(() => {
    current++;
    if (current >= images.length) current = 0;
    showSlide(current);
}, 3000);
