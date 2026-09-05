/*
|--------------------------------------------------------------------------
| search.js
|--------------------------------------------------------------------------
| Logic pencarian lintas jenis konten. File ini hanya mendefinisikan
| fungsi (tidak menjalankan apa pun saat dimuat) — dipanggil oleh
| explore.js saat parameter URL "q" terdeteksi.
*/

function matchesText(query, ...fields) {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return fields.some(
        field => typeof field === "string" && field.toLowerCase().includes(q)
    );
}

function searchQuizzes(query) {
    if (typeof quizzes === "undefined") return [];
    return quizzes.filter(item => matchesText(query, item.title, item.description));
}

function searchTTS(query) {
    if (typeof ttsList === "undefined") return [];
    return ttsList.filter(item => matchesText(query, item.title, item.description));
}

function searchComics(query) {
    if (typeof comics === "undefined") return [];
    return comics.filter(item => matchesText(query, item.title, item.description));
}

// Kasus dicari dua lapis: judul/deskripsi (cepat, dari case-data.js),
// lalu isi klinis di dalam file JSON per kasus (diagnosis, anamnesis, dst).
// Daftar file diambil dari array `cases` secara dinamis, jadi kasus baru
// otomatis ikut tercari tanpa perlu mengubah file ini.
async function searchCases(query) {
    if (typeof cases === "undefined") return [];

    const quickMatches = cases.filter(item => matchesText(query, item.title, item.description));
    const matchedIds = new Set(quickMatches.map(item => item.id));

    const deepMatches = await Promise.all(
        cases.map(async item => {
            if (matchedIds.has(item.id)) return null;

            try {
                const response = await fetch(`assets/metadata/kasus/${item.file}.json`);
                if (!response.ok) return null;

                const data = await response.json();
                const differentialDiagnosis = Array.isArray(data.differentialDiagnosis)
                    ? data.differentialDiagnosis.join(" ")
                    : "";

                const isMatch = matchesText(
                    query,
                    data.diagnosis,
                    data.anamnesis,
                    data.clinicalExaminations,
                    data.lesionDescription,
                    differentialDiagnosis
                );

                return isMatch ? item : null;
            } catch (err) {
                console.error(`Gagal memuat ${item.file}.json untuk pencarian:`, err);
                return null;
            }
        })
    );

    return quickMatches.concat(deepMatches.filter(Boolean));
}

async function performSearch(query) {
    const [quizResults, ttsResults, comicResults, caseResults] = await Promise.all([
        searchQuizzes(query),
        searchTTS(query),
        searchComics(query),
        searchCases(query)
    ]);

    return {
        quizzes: quizResults,
        tts: ttsResults,
        comics: comicResults,
        cases: caseResults
    };
}
