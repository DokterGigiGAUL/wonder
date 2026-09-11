/*
|--------------------------------------------------------------------------
| house-ads.js
|--------------------------------------------------------------------------
| Data iklan produk sendiri (house ad) yang disisipkan di antara kartu
| konten pada explore.html. Setiap entri independen — url & thumbnail
| boleh berbeda-beda per produk. Tinggal tambah objek baru ke array ini
| untuk menambah produk lain, tidak perlu ubah logic penyisipan.
*/

const houseAds = [
  {
    label: "Iklan",
    title: "Dentabrix — Dental Chair Berbasis Lego",
    description: "Koleksi unik bertema Kedokteran Gigi",
    thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-8224r-miy0chfmx1j898.webp",
    url: "https://shopee.co.id/-LIMITED-STOCKS-Dentabrix-Mini-—-Miniatur-Kursi-Dokter-Gigi-i.1515012100.40677691196"
  },
  {
    label: "Iklan",
    title: "Poster Edukasi Gigital",
    description: "Poster premium Kedokteran Gigi. Ukuran A3.",
    thumbnail: "https://static.desty.app/desty-omni/20230630/1c4fb8d720c94cdaafe36e3052c78b31.jpg", 
    url: "#" // TODO: isi link pembelian Poster
  },
  {
    label: "Ads",
    title: "Dentabook - Ebook Kedokteran Gigi Gigital",
    description: "Panduan Peresepan Obat untuk Dokter Gigi",
    thumbnail: "https://media-myr.b-cdn.net/images/resized/600/6a709c40-0029-4cdc-b274-fe862da5f260.jpeg",
    url: "https://gigital.myr.id/ebook/ebook-gigital-panduan-peresepan-dokter-gigi"
  },
  {
    label: "Ads",
    title: "Dentabook - Ebook Kedokteran Gigi Gigital",
    description: "Panduan Peresepan Obat untuk Dokter Gigi",
    thumbnail: "https://media-myr.b-cdn.net/images/resized/600/3a6baa2d-38c9-43a0-90c3-167cad21b2b1.jpeg",
    url: "https://gigital.myr.id/ebook/ebook-gigital-panduan-manajemen-dental-kehamilan"
  }
  
];
