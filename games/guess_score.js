/**
 * Game: Guess the Score (Number Guessing in 6 balls)
 */

class GuessScoreGame {
  constructor() {
    this.targetScore = 0;
    this.ballsBowled = 0;
    this.maxBalls = 6;
    this.gameActive = false;
    this.winsCount = parseInt(localStorage.getItem('guess_wins_count')) || 0;
    this.previousGuesses = [];
  }

  init() {
    // Remove any lingering end-game action buttons from previous round
    const prevActions = document.getElementById('guess-actions');
    if (prevActions) prevActions.remove();

    this.targetScore = Math.floor(Math.random() * 201) + 100; // 100 to 300
    this.ballsBowled = 0;
    this.gameActive = true;
    this.previousGuesses = [];
    
    // Clear Input
    const inputEl = document.getElementById('guess-input-field');
    inputEl.value = '';
    inputEl.disabled = false;
    
    document.getElementById('guess-submit-btn').disabled = false;
    
    // Reset Scoreboard Elements
    document.getElementById('guess-target-display').textContent = '???';
    document.getElementById('guess-overs-display').textContent = 'Overs: 0.0';
    document.getElementById('guess-feedback-text').innerHTML = 'Chase the target! Guess a score between <strong>100 and 300</strong>.';
    
    // Draw ball status dots (empty)
    const dotsContainer = document.getElementById('guess-balls-container');
    dotsContainer.innerHTML = '';
    for (let i = 1; i <= this.maxBalls; i++) {
      const dot = document.createElement('div');
      dot.className = 'guess-ball-dot';
      dot.textContent = i;
      dotsContainer.appendChild(dot);
    }
    
    // Highlight the first ball
    dotsContainer.children[0].className = 'guess-ball-dot current';
    
    this.updateStats();
  }

  updateStats() {
    document.getElementById('guess-wins-display').textContent = `Matches Won: ${this.winsCount}`;
  }

  destroy() {
    this.gameActive = false;
  }

  submitGuess() {
    if (!this.gameActive) return;

    const inputEl = document.getElementById('guess-input-field');
    const guess = parseInt(inputEl.value);

    if (isNaN(guess) || guess < 100 || guess > 300) {
      window.arcade.playSynthSound('fail');
      document.getElementById('guess-feedback-text').innerHTML = '<span style="color:var(--leather-red);">Invalid delivery! Guess must be between 100 and 300.</span>';
      return;
    }

    this.ballsBowled++;
    this.previousGuesses.push(guess);
    inputEl.value = '';

    // Play ball release tick
    window.arcade.playSynthSound('click');

    // Update scoreboard overs
    document.getElementById('guess-overs-display').textContent = `Overs: 0.${this.ballsBowled}`;

    // Update dot status
    const dotsContainer = document.getElementById('guess-balls-container');
    const dot = dotsContainer.children[this.ballsBowled - 1];
    if (dot) {
      dot.className = 'guess-ball-dot bowled';
      dot.textContent = guess;
      dot.style.fontSize = '0.65rem';
    }

    // Highlight next ball
    if (this.ballsBowled < this.maxBalls) {
      dotsContainer.children[this.ballsBowled].className = 'guess-ball-dot current';
    }

    this.checkGuess(guess);
  }

  checkGuess(guess) {
    const feedbackEl = document.getElementById('guess-feedback-text');
    
    if (guess === this.targetScore) {
      this.endGame(true);
      return;
    }

    if (this.ballsBowled >= this.maxBalls) {
      this.endGame(false);
      return;
    }

    // Give Hint
    const diff = Math.abs(guess - this.targetScore);
    let hint = '';
    
    if (guess > this.targetScore) {
      if (diff <= 10) {
        hint = `<strong>${guess}</strong>: Just a bit too high! Batsman is playing and missing.`;
        window.arcade.playSynthSound('hit');
      } else {
        hint = `<strong>${guess}</strong>: Too high! Fielders are deep on the boundary.`;
      }
    } else {
      if (diff <= 10) {
        hint = `<strong>${guess}</strong>: Extremely close! Edge just fell short of slip!`;
        window.arcade.playSynthSound('hit');
      } else {
        hint = `<strong>${guess}</strong>: Too low! Easy pickings for the batsman on this flat deck.`;
      }
    }

    feedbackEl.innerHTML = hint;
  }

  endGame(won) {
    this.gameActive = false;
    
    const feedbackEl = document.getElementById('guess-feedback-text');
    const inputEl = document.getElementById('guess-input-field');
    
    inputEl.disabled = true;
    document.getElementById('guess-submit-btn').disabled = true;
    document.getElementById('guess-target-display').textContent = this.targetScore;

    if (won) {
      this.winsCount++;
      localStorage.setItem('guess_wins_count', this.winsCount);
      window.arcade.saveHighScore('guess', this.winsCount);
      window.arcade.playSynthSound('success');
      window.arcade.playSynthSound('cheer');

      // Formula: earlier wins = more runs
      const runsEarned = (this.maxBalls - this.ballsBowled + 1) * 20;
      feedbackEl.innerHTML = `<span style="color:var(--primary-green); font-size:1.2rem; font-weight:bold;">OUTSTANDING! Target Chased!</span><br>You guessed the exact score in ${this.ballsBowled} balls. Earned +${runsEarned} runs!`;
      window.arcade.addCareerRuns(runsEarned);
    } else {
      window.arcade.playSynthSound('fail');
      feedbackEl.innerHTML = `<span style="color:var(--leather-red); font-size:1.2rem; font-weight:bold;">ALL OUT! Match Lost!</span><br>Target was <strong>${this.targetScore}</strong>. Bowled out! Penalty -5 runs.`;
      window.arcade.addCareerRuns(-5);
    }

    this.updateStats();

    // Add back button or restart button
    const container = document.querySelector('.guess-layout');
    const actionDiv = document.createElement('div');
    actionDiv.id = 'guess-actions';
    actionDiv.style.display = 'flex';
    actionDiv.style.gap = '15px';
    actionDiv.style.marginTop = '15px';
    actionDiv.innerHTML = `
      <button class="btn-primary" onclick="this.parentElement.remove(); window.guessScoreGame.init();">New Match</button>
      <button class="btn-primary" style="background:var(--glass-bg); color:#fff; border:1px solid var(--glass-border);" onclick="this.parentElement.remove(); window.arcade.switchScreen('dashboard')">Back to Hub</button>
    `;
    container.appendChild(actionDiv);
  }
}

window.guessScoreGame = new GuessScoreGame();
