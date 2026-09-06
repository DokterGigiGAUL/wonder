/*
|--------------------------------------------------------------------------
| storage.js
|--------------------------------------------------------------------------
| Menyimpan seluruh data yang berkaitan dengan kuis menggunakan
| localStorage.
|--------------------------------------------------------------------------
*/

const Storage = {

    prefix: "quiz_",

    unlockedPrefix: "unlocked_",

    key(id) {
        return this.prefix + id;
    },

    get(id) {

        const data = localStorage.getItem(this.key(id));

        if (!data) return null;

        return JSON.parse(data);

    },

    create(id, timeLimit) {

        const data = {
            id: id,
            status: "playing",
            startTime: Date.now(),
            duration: timeLimit,
            currentQuestion: 0,
            answers: [],
            score: 0
        };

        localStorage.setItem(
            this.key(id),
            JSON.stringify(data)
        );

        return data;

    },

    save(id, data) {

        localStorage.setItem(
            this.key(id),
            JSON.stringify(data)
        );

    },

    finish(id, score) {

        const data = this.get(id);

        if (!data) return;

        data.status = "finished";
        data.score = score;
        data.finishTime = Date.now();

        this.save(id, data);

    },

    isFinished(id) {

        const data = this.get(id);

        if (!data) return false;

        return data.status === "finished";

    },

    remainingTime(id) {

        const data = this.get(id);

        if (!data) return 0;

        const elapsed = Math.floor(
            (Date.now() - data.startTime) / 1000
        );

        return Math.max(
            data.duration - elapsed,
            0
        );

    },

    clear(id) {

        localStorage.removeItem(
            this.key(id)
        );

    },

    isUnlocked(productId) {

        return localStorage.getItem(
            this.unlockedPrefix + productId
        ) === "true";

    },

    unlock(productId) {

        localStorage.setItem(
            this.unlockedPrefix + productId,
            "true"
        );

    },

    ttsPrefix: "tts_progress_",

    saveTTS(id, letters) {

        localStorage.setItem(
            this.ttsPrefix + id,
            JSON.stringify(letters)
        );

    },

    getTTS(id) {

        const data = localStorage.getItem(this.ttsPrefix + id);

        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch (err) {
            console.error(`Data progres TTS untuk "${id}" rusak, diabaikan.`, err);
            return null;
        }

    },

    clearTTS(id) {

        localStorage.removeItem(
            this.ttsPrefix + id
        );

    }

};
