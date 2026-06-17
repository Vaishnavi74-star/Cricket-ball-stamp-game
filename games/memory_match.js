/**
 * Game: Memory Match (Cricket Icons)
 */

class MemoryMatch {
  constructor() {
    this.icons = [
      // 1. Bat
      `<svg viewBox="0 0 24 24"><path d="M19.5 2.5a2.12 2.12 0 0 0-3 0L3.7 15.3a1 1 0 0 0-.3.7l.1 2.3 2.3.1a1 1 0 0 0 .7-.3L19.5 5.5a2.12 2.12 0 0 0 0-3zM5.5 17l-.8-.8.9-.9.8.8zm2.4-2.4l-.8-.8 9.5-9.5.8.8z"/></svg>`,
      // 2. Ball
      `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2" stroke-linecap="round"/><path d="M6 6c3 3 3 9 0 12M18 6c-3 3-3 9 0 12" stroke-dasharray="2 2"/></svg>`,
      // 3. Wickets
      `<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="2" rx="1"/><rect x="5" y="6" width="2" height="16" rx="0.5"/><rect x="11" y="6" width="2" height="16" rx="0.5"/><rect x="17" y="6" width="2" height="16" rx="0.5"/></svg>`,
      // 4. Trophy
      `<svg viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v3c0 2.5 1.85 4.6 4.3 4.9.85 1.54 2.4 2.6 4.2 2.9V20H8v2h8v-2h-3.5v-2.2c1.8-.3 3.35-1.36 4.2-2.9 2.45-.3 4.3-2.4 4.3-4.9V7c0-1.1-.9-2-2-2zM5 10V7h2v3c0 1.2.8 2.2 1.9 2.4C6.3 12.1 5 11.2 5 10zm14 0c0 1.2-1.3 2.1-3.9 2.4 1.1-.2 1.9-1.2 1.9-2.4V7h2v3z"/></svg>`,
      // 5. Helmet
      `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12v3c0 1.1.9 2 2 2h2v-5h12v5h2c1.1 0 2-.9 2-2v-3c0-5.52-4.48-10-10-10zm-4 13h8v3H8z"/></svg>`,
      // 6. Jersey
      `<svg viewBox="0 0 24 24"><path d="M18 2h-3l-1 2-2-2-2 2-1-2H6L2 6v4h3v12h14V10h3V6l-4-4z"/></svg>`,
      // 7. Gloves
      `<svg viewBox="0 0 24 24"><path d="M19 8c-1.1 0-2 .9-2 2v6h-1v-8c0-1.1-.9-2-2-2s-2 .9-2 2v8h-1v-9c0-1.1-.9-2-2-2s-2 .9-2 2v9h-1v-6c0-1.1-.9-2-2-2s-2 .9-2 2v8c0 2.2 1.8 4 4 4h9c2.2 0 4-1.8 4-4V10c0-1.1-.9-2-2-2z"/></svg>`,
      // 8. Cap
      `<svg viewBox="0 0 24 24"><path d="M12 4c-4.4 0-8 3-8 7h16c0-4-3.6-7-8-7zm10 8H2c0 2.2 2.8 4 6.2 4H12v4h6v-4h4c0 0 .2-2-.2-4z"/></svg>`
    ];

    this.cardsData = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.movesCount = 0;
    this.timeElapsed = 0;
    this.timer = null;
    this.gameActive = false;
  }

  init() {
    this.destroy();
    
    this.matchedPairs = 0;
    this.movesCount = 0;
    this.timeElapsed = 0;
    this.flippedCards = [];
    this.gameActive = true;

    document.getElementById('memory-moves-val').textContent = this.movesCount;
    document.getElementById('memory-time-val').textContent = '0s';
    
    // Show grid, hide summary
    document.getElementById('memory-grid').style.display = 'grid';
    document.getElementById('memory-summary-screen').style.display = 'none';
    
    // Create card deck (2 of each icon)
    const deck = [];
    this.icons.forEach((icon, idx) => {
      deck.push({ id: idx, html: icon });
      deck.push({ id: idx, html: icon });
    });

    // Shuffle deck
    this.cardsData = deck.sort(() => Math.random() - 0.5);

    // Render cards
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    this.cardsData.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.index = index;
      cardEl.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-face memory-card-back"></div>
          <div class="memory-card-face memory-card-front">
            ${card.html}
          </div>
        </div>
      `;
      cardEl.addEventListener('click', () => this.flipCard(cardEl, index));
      grid.appendChild(cardEl);
    });

    // Start Timer
    this.timer = setInterval(() => {
      if (this.gameActive) {
        this.timeElapsed++;
        document.getElementById('memory-time-val').textContent = `${this.timeElapsed}s`;
      }
    }, 1000);
  }

  flipCard(cardEl, index) {
    if (!this.gameActive) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
    if (this.flippedCards.length >= 2) return;

    window.arcade.playSynthSound('click');
    cardEl.classList.add('flipped');
    this.flippedCards.push({ el: cardEl, index: index, data: this.cardsData[index] });

    if (this.flippedCards.length === 2) {
      this.movesCount++;
      document.getElementById('memory-moves-val').textContent = this.movesCount;
      this.checkMatch();
    }
  }

  checkMatch() {
    const card1 = this.flippedCards[0];
    const card2 = this.flippedCards[1];

    if (card1.data.id === card2.data.id) {
      // Match found
      card1.el.classList.add('matched');
      card2.el.classList.add('matched');
      
      this.matchedPairs++;
      this.flippedCards = [];

      window.arcade.playSynthSound('success');

      if (this.matchedPairs === this.icons.length) {
        this.endGame();
      }
    } else {
      // No match
      setTimeout(() => {
        if (!this.gameActive) return;
        card1.el.classList.remove('flipped');
        card2.el.classList.remove('flipped');
        this.flippedCards = [];
        window.arcade.playSynthSound('click');
      }, 1000);
    }
  }

  endGame() {
    this.gameActive = false;
    clearInterval(this.timer);
    
    window.arcade.playSynthSound('cheer');

    // Save High Score (lowest time)
    window.arcade.saveHighScore('memory', this.timeElapsed);

    // Calculate runs award (150 - seconds, min 10)
    const runsAward = Math.max(10, 150 - this.timeElapsed);
    window.arcade.addCareerRuns(runsAward);

    // Hide grid, show polished summary screen
    document.getElementById('memory-grid').style.display = 'none';
    
    const summaryScreen = document.getElementById('memory-summary-screen');
    document.getElementById('memory-score-time').textContent = `${this.timeElapsed}s`;
    document.getElementById('memory-score-moves').textContent = this.movesCount;
    document.getElementById('memory-runs-earned').textContent = `+${runsAward}`;
    summaryScreen.style.display = 'flex';
  }

  destroy() {
    this.gameActive = false;
    clearInterval(this.timer);
    // Reset summary screen
    const summaryScreen = document.getElementById('memory-summary-screen');
    if (summaryScreen) summaryScreen.style.display = 'none';
    const grid = document.getElementById('memory-grid');
    if (grid) grid.style.display = 'grid';
  }
}

window.memoryMatchGame = new MemoryMatch();
