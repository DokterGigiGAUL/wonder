class CrosswordEngine {
  constructor() {
    this.puzzle = null;
    this.grid = [];
    this.rows = 0;
    this.cols = 0;
    this.cells = [];
    this.activeWord = null;
    this.activeIndex = 0;
    this.direction = "across";
    this.hiddenInput = null;
    this.activeClue = null;
    this.originalProgressHTML = "";
  }

  openPremiumModal(productId) {
    if (typeof window.showPremiumDialog === "function") {
      window.showPremiumDialog(productId);
    } else if (typeof showPremiumDialog === "function") {
      showPremiumDialog(productId);
    }
  }

  async load() {
    try {
      const params = new URLSearchParams(location.search);
      const file = params.get("puzzle") || "tts1";

      if (typeof ttsList === "undefined") {
        throw new Error("Data TTS tidak ditemukan");
      }

      const metadata = ttsList.find((t) => `tts${t.id}` === file);

      if (!metadata) {
        throw new Error("Puzzle tidak ditemukan");
      }

      // Verifikasi Akses Async
      let hasAccess = !metadata.premium;
      if (metadata.premium) {
        hasAccess = await window.canAccessContent(metadata.productId);
      }

      if (!hasAccess) {
        this.openPremiumModal(metadata.productId);
        setTimeout(() => {
          location.href = "index.html";
        }, 1500);
        return;
      }

      const res = await fetch(`assets/metadata/tts/${file}.json`);
      if (!res.ok) {
        throw new Error("Tidak dapat memuat berkas teka-teki silang.");
      }

      this.puzzle = await res.json();

      document.getElementById("puzzle-title").textContent = this.puzzle.title;

      this.buildGrid();
      this.resizeGrid();
      this.numberCells();
      this.renderGrid();
      this.renderClues();
      this.createHiddenInput();
      this.bindEvents();
      if (this.puzzle.words && this.puzzle.words.length > 0) {
        this.selectWord(this.puzzle.words[0]);
      }

      const loader = document.getElementById("loader");
      const app = document.getElementById("crossword-app");
      if (loader) loader.style.display = "none";
      if (app) app.style.display = "block";

      const wrapper = document.querySelector(".progress-wrapper");
      if (wrapper) this.originalProgressHTML = wrapper.innerHTML;
    } catch (err) {
      const loader = document.getElementById("loader");
      if (loader) {
        loader.innerHTML = `
          <div class="loader-error">
              <h2>Puzzle tidak dapat dimuat</h2>
              <p>${err.message}</p>
              <button onclick="location.href='index.html'">
                  Kembali ke Beranda
              </button>
          </div>
        `;
      }
    }
  }

  selectWord(word) {
    if (!word) return;
    this.direction = word.direction;
    this.activeWord = word;
    this.activeIndex = 0;
    this.currentRow = word.row;
    this.currentCol = word.col;
    this.clearHighlight();
    this.highlightWord();
    this.updateActiveClue();
    if (this.hiddenInput) this.hiddenInput.focus();
  }

  buildGrid() {
    let maxRow = 0,
      maxCol = 0;
    this.puzzle.words.forEach((word) => {
      const len = word.answer.length;
      if (word.direction === "across") {
        maxRow = Math.max(maxRow, word.row);
        maxCol = Math.max(maxCol, word.col + len - 1);
      } else {
        maxRow = Math.max(maxRow, word.row + len - 1);
        maxCol = Math.max(maxCol, word.col);
      }
    });
    this.rows = maxRow + 1;
    this.cols = maxCol + 1;
    this.grid = Array.from({ length: this.rows }, () => Array.from({ length: this.cols }, () => null));
    this.puzzle.words.forEach((word) => {
      for (let i = 0; i < word.answer.length; i++) {
        const r = word.direction === "across" ? word.row : word.row + i;
        const c = word.direction === "across" ? word.col + i : word.col;
        if (!this.grid[r][c]) {
          this.grid[r][c] = {
            letter: "",
            answer: word.answer[i],
            number: null,
          };
        }
      }
    });
  }

  resizeGrid() {
    const padding = 40;
    const maxWidth = window.innerWidth - padding;
    const size = Math.floor(Math.min(48, maxWidth / this.cols));
    document.documentElement.style.setProperty("--cell-size", `${size}px`);
  }

  numberCells() {
    let n = 1;
    const used = new Map();
    const entries = [...this.puzzle.words].sort((a, b) => a.row - b.row || a.col - b.col);
    for (const entry of entries) {
      const key = `${entry.row},${entry.col}`;
      if (!used.has(key)) {
        used.set(key, n++);
      }
      const cell = this.grid[entry.row][entry.col];
      if (cell) {
        cell.number = used.get(key);
      }
    }
  }

  renderGrid() {
    const board = document.getElementById("crossword-grid");
    if (!board) return;
    board.style.gridTemplateColumns = `repeat(${this.cols},var(--cell-size))`;
    board.innerHTML = "";
    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const data = this.grid[r][c];
        const cell = document.createElement("div");
        if (!data) {
          cell.className = "cell black";
        } else {
          cell.className = "cell";
          cell.dataset.row = r;
          cell.dataset.col = c;
          const letter = document.createElement("span");
          letter.className = "letter";
          letter.textContent = "";
          cell.appendChild(letter);
          if (data.number) {
            const num = document.createElement("span");
            num.className = "cell-number";
            num.textContent = data.number;
            cell.appendChild(num);
          }
          this.cells[r][c] = cell;
        }
        board.appendChild(cell);
      }
    }
  }

  backspace() {
    if (!this.activeWord) return;
    const r = this.direction === "across" ? this.activeWord.row : this.activeWord.row + this.activeIndex;
    const c = this.direction === "across" ? this.activeWord.col + this.activeIndex : this.activeWord.col;
    if (this.grid[r][c].letter) {
      this.grid[r][c].letter = "";
      this.cells[r][c].querySelector(".letter").textContent = "";
      this.checkAnswer();
      return;
    }
    if (this.activeIndex === 0) return;
    this.activeIndex--;
    if (this.direction === "across") {
      this.currentCol--;
    } else {
      this.currentRow--;
    }
    this.highlightWord();
  }

  renderClues() {}

  updateActiveClue() {
    if (!this.activeWord) return;
    const dirEl = document.getElementById("active-direction");
    const numEl = document.getElementById("active-number");
    const textEl = document.getElementById("active-clue-text");
    const ansEl = document.getElementById("active-answer");

    if (dirEl) dirEl.textContent = this.activeWord.direction === "across" ? "Mendatar" : "Menurun";
    if (numEl) numEl.textContent = this.grid[this.activeWord.row][this.activeWord.col].number;
    if (textEl) textEl.textContent = this.activeWord.clue;
    if (ansEl) ansEl.innerHTML = "";
  }

  createHiddenInput() {
    this.hiddenInput = document.createElement("input");
    this.hiddenInput.type = "text";
    this.hiddenInput.maxLength = 1;
    Object.assign(this.hiddenInput.style, {
      position: "fixed",
      left: "-9999px",
      opacity: 0,
    });
    document.body.appendChild(this.hiddenInput);
  }

  bindEvents() {
    const board = document.getElementById("crossword-grid");
    if (board) {
      board.addEventListener("click", (e) => {
        const cell = e.target.closest(".cell");
        if (!cell || cell.classList.contains("black")) return;
        const r = Number(cell.dataset.row);
        const c = Number(cell.dataset.col);
        this.selectCell(r, c);
      });
    }

    if (this.hiddenInput) {
      this.hiddenInput.addEventListener("input", (e) => {
        const value = e.target.value.toUpperCase();
        if (value) {
          this.typeLetter(value);
        }
        e.target.value = "";
      });
      this.hiddenInput.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          e.preventDefault();
          this.backspace();
        }
      });
    }

    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) resetBtn.onclick = () => this.resetPuzzle();

    const hintBtn = document.getElementById("hint-btn");
    if (hintBtn) {
      hintBtn.onclick = async () => {
        const hasAccess = await window.canAccessContent("tts_access");
        if (!hasAccess) {
          this.openPremiumModal("tts_access");
          return;
        }
        this.useHint();
      };
    }

    const revealBtn = document.getElementById("reveal-btn");
    if (revealBtn) {
      revealBtn.onclick = async () => {
        const hasAccess = await window.canAccessContent("tts_access");
        if (!hasAccess) {
          this.openPremiumModal("tts_access");
          return;
        }
        this.revealAnswer();
      };
    }

    const homeBtn = document.getElementById("home-btn");
    if (homeBtn) {
      homeBtn.onclick = () => {
        location.href = "index.html";
      };
    }

    window.addEventListener("resize", () => this.resizeGrid());
    window.addEventListener("orientationchange", () => this.resizeGrid());
  }

  selectCell(r, c) {
    if (this.currentRow === r && this.currentCol === c) {
      this.direction = this.direction === "across" ? "down" : "across";
    } else {
      this.currentRow = r;
      this.currentCol = c;
    }
    this.activeWord = this.findWord(this.currentRow, this.currentCol, this.direction);
    if (!this.activeWord) {
      this.direction = this.direction === "across" ? "down" : "across";
      this.activeWord = this.findWord(this.currentRow, this.currentCol, this.direction);
    }
    this.clearHighlight();
    this.highlightWord();
    this.updateActiveClue();
    if (this.hiddenInput) this.hiddenInput.focus();
  }

  getCurrentWord() {
    const words = this.puzzle.words.filter((w) => {
      if (w.direction !== this.direction) return false;
      for (let i = 0; i < w.answer.length; i++) {
        const rr = w.direction === "across" ? w.row : w.row + i;
        const cc = w.direction === "across" ? w.col + i : w.col;
        if (rr === this.currentRow && cc === this.currentCol) return true;
      }
      return false;
    });
    return words[0] || null;
  }

  findWord(row, col, direction) {
    return (
      this.puzzle.words.find((word) => {
        if (word.direction !== direction) return false;
        for (let i = 0; i < word.answer.length; i++) {
          const r = direction === "across" ? word.row : word.row + i;
          const c = direction === "across" ? word.col + i : word.col;
          if (r === row && c === col) return true;
        }
        return false;
      }) || null
    );
  }

  highlightWord() {
    const word = this.getCurrentWord();
    if (!word) return;
    this.activeClue = word.clueElement;
    this.highlightClue();
    for (let i = 0; i < word.answer.length; i++) {
      const r = word.direction === "across" ? word.row : word.row + i;
      const c = word.direction === "across" ? word.col + i : word.col;
      if (this.cells[r] && this.cells[r][c]) {
        this.cells[r][c].classList.add("word");
        if (r === this.currentRow && c === this.currentCol) {
          this.cells[r][c].classList.add("active");
          this.activeIndex = i;
        }
      }
    }
  }

  clearHighlight() {
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        if (!cell) return;
        cell.classList.remove("word");
        cell.classList.remove("active");
      });
    });
  }

  typeLetter(letter) {
    if (!this.activeWord) return;
    const r = this.direction === "across" ? this.activeWord.row : this.activeWord.row + this.activeIndex;
    const c = this.direction === "across" ? this.activeWord.col + this.activeIndex : this.activeWord.col;
    this.grid[r][c].letter = letter;
    this.cells[r][c].querySelector(".letter").textContent = letter;
    this.checkAnswer();
    this.nextCell();
  }

  nextCell() {
    if (this.activeIndex >= this.activeWord.answer.length - 1) return;
    this.activeIndex++;
    if (this.direction === "across") {
      this.currentCol++;
    } else {
      this.currentRow++;
    }
    this.highlightWord();
  }

  checkAnswer() {
    let total = this.puzzle.words.length;
    let benar = 0;
    this.puzzle.words.forEach((word) => {
      let selesai = true;
      for (let i = 0; i < word.answer.length; i++) {
        const r = word.direction === "across" ? word.row : word.row + i;
        const c = word.direction === "across" ? word.col + i : word.col;
        const cell = this.grid[r][c];
        const html = this.cells[r][c];
        if (html) html.classList.remove("correct", "wrong");
        if (cell.letter !== cell.answer) {
          selesai = false;
        }
      }
      if (selesai) {
        benar++;
        for (let i = 0; i < word.answer.length; i++) {
          const r = word.direction === "across" ? word.row : word.row + i;
          const c = word.direction === "across" ? word.col + i : word.col;
          if (this.cells[r] && this.cells[r][c]) {
            this.cells[r][c].classList.add("correct");
          }
        }
      }
    });

    const persen = Math.round((benar / total) * 100);
    const wrapper = document.querySelector(".progress-wrapper");
    if (persen === 100) {
      if (this.puzzle.next && wrapper) {
        wrapper.innerHTML = `
          <h3>🎉 Teka-teki silang selesai!</h3>
          <button id="next-btn" class="next-btn">
          TTS Berikutnya →
          </button>
        `;
        const nextBtn = document.getElementById("next-btn");
        if (nextBtn) {
          nextBtn.onclick = async () => {
            if (typeof ttsList !== "undefined") {
              const nextTTS = ttsList.find((t) => `tts${t.id}` === this.puzzle.next);
              if (nextTTS && nextTTS.premium) {
                const hasAccess = await window.canAccessContent(nextTTS.productId);
                if (!hasAccess) {
                  this.openPremiumModal(nextTTS.productId);
                  return;
                }
              }
            }
            location.href = `tts.html?puzzle=${this.puzzle.next}`;
          };
        }
      } else if (wrapper) {
        wrapper.innerHTML = `
          <h3>🎉 Semua TTS gratis sudah diselesaikan!</h3>
        `;
      }
      return;
    }
    const fill = document.getElementById("progress-fill");
    const text = document.getElementById("progress-text");
    if (fill) fill.style.width = persen + "%";
    if (text) text.textContent = persen + "%";
  }

  useHint() {
    if (!this.activeWord) return;
    const r = this.direction === "across" ? this.activeWord.row : this.activeWord.row + this.activeIndex;
    const c = this.direction === "across" ? this.activeWord.col + this.activeIndex : this.activeWord.col;
    const answer = this.grid[r][c].answer;
    this.grid[r][c].letter = answer;
    this.cells[r][c].querySelector(".letter").textContent = answer;
    this.checkAnswer();
    this.nextCell();
  }

  revealAnswer() {
    if (!this.activeWord) return;
    for (let i = 0; i < this.activeWord.answer.length; i++) {
      const r = this.direction === "across" ? this.activeWord.row : this.activeWord.row + i;
      const c = this.direction === "across" ? this.activeWord.col + i : this.activeWord.col;
      const answer = this.grid[r][c].answer;
      this.grid[r][c].letter = answer;
      this.cells[r][c].querySelector(".letter").textContent = answer;
    }
    this.checkAnswer();
  }

  resetPuzzle() {
    const wrapper = document.querySelector(".progress-wrapper");
    if (wrapper && wrapper.innerHTML !== this.originalProgressHTML) {
      wrapper.innerHTML = this.originalProgressHTML;
    }
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        if (!cell) continue;
        cell.letter = "";
        const html = this.cells[r][c];
        if (html) {
          html.querySelector(".letter").textContent = "";
          html.classList.remove("correct", "wrong");
        }
      }
    }
    const fill = document.getElementById("progress-fill");
    const text = document.getElementById("progress-text");
    if (fill) fill.style.width = "0%";
    if (text) text.textContent = "0%";
  }

  highlightClue() {
    document.querySelectorAll("#across-list li,#down-list li").forEach((li) => li.classList.remove("active"));
    if (!this.activeClue) return;
    this.activeClue.classList.add("active");
  }
}

window.engine = new CrosswordEngine();
document.addEventListener("DOMContentLoaded", () => {
  engine.load();
});
