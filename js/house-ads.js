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
    title: "Lego Dental Chair",
    description: "Dentabrix Gigital Mini",
    thumbnail: "https://down-id.img.susercontent.com/file/id-11134207-8224r-miy0chfmx1j898.webp",
    url: "https://shopee.co.id/-LIMITED-STOCKS-Dentabrix-Mini-—-Miniatur-Kursi-Dokter-Gigi-i.1515012100.40677691196"
  },
  {
    label: "Iklan",
    title: "Poster Kedokteran Gigi",
    description: "Line Art Dokter Gigi Hijab.",
    thumbnail: "https://static.desty.app/desty-omni/20230630/1c4fb8d720c94cdaafe36e3052c78b31.jpg", 
    url: "#" // TODO: isi link pembelian Poster
  },
  {
    label: "Ads",
    title: "Ebook Kedokteran Gigi",
    description: "Panduan Peresepan Obat untuk Dokter Gigi",
    thumbnail: "https://media-myr.b-cdn.net/images/resized/600/6a709c40-0029-4cdc-b274-fe862da5f260.jpeg",
    url: "https://gigital.myr.id/ebook/ebook-gigital-panduan-peresepan-dokter-gigi"
  },
  {
    label: "Ads",
    title: "Poster Kedokteran Gigi",
    description: "Line Art Dokter Gigi.",
    thumbnail: "https://static.desty.app/desty-omni/20230630/94ef5667095d4095af7029ace2d7b807.jpg", 
    url: "#" // TODO: isi link pembelian Poster
  },
  {
    label: "Ads",
    title: "Ebook Kedokteran Gigi Gigital",
    description: " Panduan Prinsip Tatalaksana Lesi Oral",
    thumbnail: "https://media-myr.b-cdn.net/images/resized/600/98236151-2996-436d-91be-5bf8e506b999.jpeg",
    url: "https://gigital.myr.id/ebook/ebook-gigital-tatalaksana-lesi-oral"
  },
  {
    label: "Iklan",
    title: "Ebook Kedokteran Gigi Gigital",
    description: "Manajemen Dental pada Kehamilan",
    thumbnail: "https://media-myr.b-cdn.net/images/resized/600/3a6baa2d-38c9-43a0-90c3-167cad21b2b1.jpeg",
    url: "https://gigital.myr.id/ebook/ebook-gigital-panduan-manajemen-dental-kehamilan"
  }
  
];
