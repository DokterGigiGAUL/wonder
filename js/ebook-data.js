const ebooks = [
    {
        id: 1,
        file: "ebook1",
        title: "Panduan Resep Bagi Dokter Gigi",
        description: "Panduan peresepan dari obat-obatan yang umum diresepkan pada terapi penyakit gigi dan mulut. ",
        /*thumbnail: "assets/images/ebook/ebook1.jpg",*/
        thumbnail: "https://media-myr.b-cdn.net/images/resized/600/6a709c40-0029-4cdc-b274-fe862da5f260.jpeg",
        releaseDate: "2026-06-25",
        pages: 30,
        preview: [
        "https://media-myr.b-cdn.net/images/resized/600/6a709c40-0029-4cdc-b274-fe862da5f260.jpeg",
        "https://media-myr.b-cdn.net/images/resized/600/6a709c40-0029-4cdc-b274-fe862da5f260.jpeg"
        ],
        price: 56789,
        mayarUrl: "https://gigital.myr.id/pl/ebook-gigital-panduan-peresepan-dokter-gigi",
        samplePdf: "https://drive.google.com/file/d/1N_9nT-0h5EHIDarD1X1k4UHzfrilGgsV/preview"

    },
    {
        id: 2,
        file: "ebook2",
        title: "Panduan Resep Pasien Anak Bagi Dokter Gigi",
        description: "Panduan praktis pemilihan obat dan peresepan pada pasien anak.",
        /*thumbnail: "assets/images/ebook/ebook2.jpg",*/
        thumbnail: "https://media-myr.b-cdn.net/images/resized/600/98d4e9e7-cf62-4e0a-b736-f49f9928c2db.webp",
        releaseDate: "2026-06-25",
        pages: 30,
        preview: [
        "https://media-myr.b-cdn.net/images/resized/600/98d4e9e7-cf62-4e0a-b736-f49f9928c2db.webp",
        "https://media-myr.b-cdn.net/images/resized/600/98d4e9e7-cf62-4e0a-b736-f49f9928c2db.webp"
        ],
        price: 43210,
        mayarUrl: "https://gigital.myr.id/pl/ebook-gigital-panduan-peresepan-dokter-gigi-pasien-anak?",
        samplePdf: "https://drive.google.com/file/d/1OWV5co837zyrlYPVvp0KvDWmA98DXoTT/preview"
        
    },
{
        id: 3,
        file: "ebook3",
        title: "Manajemen Dental Kehamilan",
        description: "Panduan manajemen dental, meliputi seleksi tindakan dan obat untuk terapi-- pada kehamilan.",
        /*thumbnail: "assets/images/ebook/ebook2.jpg",*/
        thumbnail: "https://media-myr.b-cdn.net/images/resized/600/3a6baa2d-38c9-43a0-90c3-167cad21b2b1.jpeg",
        releaseDate: "2026-06-25",
        pages: 30,
        preview: [
        "https://media-myr.b-cdn.net/images/resized/600/3a6baa2d-38c9-43a0-90c3-167cad21b2b1.jpeg",
        "https://media-myr.b-cdn.net/images/resized/600/3a6baa2d-38c9-43a0-90c3-167cad21b2b1.jpeg"
        ],
        price: 54321,
        mayarUrl: "https://gigital.myr.id/pl/ebook-gigital-panduan-manajemen-dental-kehamilan?",
        samplePdf: "https://drive.google.com/file/d/1Kf4JUQXhFtemVmweBMECM2_-t5XetSep/preview"
    },
{
        id: 4,
        file: "ebook4",
        title: "Mendiagnosa Lesi Oral Itu Mudah",
        description: "Panduan praktis diagnosis lesi oral berdasarkan warna, jumlah dan atau bentuk.",
        /*thumbnail: "assets/images/ebook/ebook2.jpg",*/
        thumbnail: "https://media-myr.b-cdn.net/images/resized/600/92f1ad8d-e37a-47b7-a74a-0efe416af672.webp",
        releaseDate: "2026-06-25",
        pages: 30,
        preview: [
        "https://media-myr.b-cdn.net/images/resized/600/92f1ad8d-e37a-47b7-a74a-0efe416af672.webp",
        "https://media-myr.b-cdn.net/images/resized/600/92f1ad8d-e37a-47b7-a74a-0efe416af672.webp"
        ],
        price: 54321,
        mayarUrl: "https://gigital.myr.id/pl/ebook-gigital-mudah-mendiagnosa-lesi-oral?",
        samplePdf: "https://drive.google.com/file/d/1MosJXbY77TUxWgnb6D7IRlcxEnmPLA9Y/preview"
    },
{
        id: 5,
        file: "ebook5",
        title: "Tatalaksana Lesi Oral",
        description: "Tatalaksana lesi oral yang sering ditemui dan menjadi kompetensi dokter gigi umum.",
        /*thumbnail: "assets/images/ebook/ebook2.jpg",*/
        thumbnail: "https://media-myr.b-cdn.net/images/resized/600/98236151-2996-436d-91be-5bf8e506b999.jpeg",
        releaseDate: "2026-06-25",
        pages: 30,
        preview: [
        "https://media-myr.b-cdn.net/images/resized/600/98236151-2996-436d-91be-5bf8e506b999.jpeg",
        "https://media-myr.b-cdn.net/images/resized/600/98236151-2996-436d-91be-5bf8e506b999.jpeg"
        ],
        price: 45678,
        mayarUrl: "https://gigital.myr.id/pl/ebook-gigital-tatalaksana-lesi-oral?",
        samplePdf: "https://drive.google.com/file/d/13qbIZHr351_klCBqM-SKwgSDPNuZtjU3/preview"
    },
{
        id: 6,
        file: "ebook6",
        title: "Pemilihan Obat Topikal Lesi Oral",
        description: "Contekan pemilihan obat topikal lesi oral ringkas dari handphone .",
        /*thumbnail: "assets/images/ebook/ebook2.jpg",*/
        thumbnail: "https://media-myr.b-cdn.net/images/resized/600/40439849-a51a-4bbd-85d3-7b11a69bbb4a.jpeg",
        releaseDate: "2026-06-25",
        pages: 30,
        preview: [
        "https://media-myr.b-cdn.net/images/resized/600/40439849-a51a-4bbd-85d3-7b11a69bbb4a.jpeg",
        "https://media-myr.b-cdn.net/images/resized/600/40439849-a51a-4bbd-85d3-7b11a69bbb4a.jpeg"
        ],
        price: 45678,
        mayarUrl: "https://gigital.myr.id/pl/ebook-gigital-panduan-pemilihan-obat-topikal?",
        samplePdf: "https://drive.google.com/file/d/1iIR_is9DAhEHJ26dExhVvY05k6D0bF5o/preview"

    }
];
