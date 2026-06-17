/**
 * Game: Catch the Catches (Fielding Mole-Whack)
 */

class CatchCatchesGame {
  constructor() {
    this.score = 0;
    this.timeLeft = 30;
    this.gameActive = false;
    this.timerInterval = null;
    this.spawnInterval = null;
    this.activeSpot = null;
    this.spawnSpeed = 1000; // ms
    this.highscore = parseInt(localStorage.getItem('whack_highscore')) || 0;
  }

  init() {
    this.destroy();
    
    this.score = 0;
    this.timeLeft = 30;
    this.gameActive = false;
    this.spawnSpeed = 1000;
    
    document.getElementById('whack-score-val').textContent = this.score;
    document.getElementById('whack-time-val').textContent = `${this.timeLeft}s`;
    
    // Clear spot classes
    const spots = document.querySelectorAll('.field-spot');
    spots.forEach(spot => spot.classList.remove('active'));

    document.getElementById('whack-start-screen').style.display = 'flex';
    this.updateStats();
  }

  updateStats() {
    document.getElementById('whack-highscore-display').textContent = `Record Catches: ${this.highscore}`;
  }

  startGame() {
    window.arcade.playSynthSound('click');
    this.gameActive = true;
    document.getElementById('whack-start-screen').style.display = 'none';

    // Timer Interval
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('whack-time-val').textContent = `${this.timeLeft}s`;
      
      if (this.timeLeft <= 3 && this.timeLeft > 0) {
        window.arcade.playSynthSound('countdown');
      }

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    // Spawn Loop
    this.tickSpawn();
  }

  tickSpawn() {
    if (!this.gameActive) return;

    this.spawnTarget();
    
    // Speed up slightly as time runs out
    const delay = Math.max(500, this.spawnSpeed - (30 - this.timeLeft) * 15);
    
    this.spawnInterval = setTimeout(() => {
      this.tickSpawn();
    }, delay);
  }

  spawnTarget() {
    const spots = document.querySelectorAll('.field-spot');
    
    // Clear previously active
    spots.forEach(spot => spot.classList.remove('active'));

    // Pick new spot
    let newSpotIndex;
    do {
      newSpotIndex = Math.floor(Math.random() * spots.length);
    } while (newSpotIndex === this.activeSpot);
    
    this.activeSpot = newSpotIndex;
    const targetSpot = spots[newSpotIndex];
    
    // Choose what pops up: 70% Ball, 15% Stump, 15% Spectator/Bomb
    const roll = Math.random();
    const targetEl = targetSpot.querySelector('.fielder-target');
    
    if (!targetEl) return;

    // Remove old target classes and content
    targetEl.className = 'fielder-target';
    targetEl.innerHTML = ''; // clear any previous emoji (e.g. bomb 💣)

    if (roll < 0.70) {
      // Ball (+1 score)
      targetEl.classList.add('ball-target');
      targetEl.dataset.type = 'ball';
    } else if (roll < 0.85) {
      // Stump (+2 score)
      targetEl.classList.add('wicket-target');
      targetEl.dataset.type = 'stump';
    } else {
      // Spectator/Bomb (-2 score)
      targetEl.innerHTML = '💣';
      targetEl.classList.add('bomb-target');
      targetEl.dataset.type = 'bomb';
    }

    // Activate visual popup
    targetSpot.classList.add('active');

    // Auto hide after a short period if not clicked
    const activeTime = Math.max(400, 900 - (30 - this.timeLeft) * 15);
    setTimeout(() => {
      if (targetSpot.classList.contains('active')) {
        targetSpot.classList.remove('active');
      }
    }, activeTime);
  }

  handleWhack(spotEl) {
    if (!this.gameActive || !spotEl.classList.contains('active')) return;
    
    // Hide immediately
    spotEl.classList.remove('active');

    const targetEl = spotEl.querySelector('.fielder-target');
    const type = targetEl.dataset.type;

    let delta = 0;
    if (type === 'ball') {
      delta = 1;
      window.arcade.playSynthSound('hit');
    } else if (type === 'stump') {
      delta = 2;
      window.arcade.playSynthSound('success');
    } else if (type === 'bomb') {
      delta = -2;
      window.arcade.playSynthSound('fail');
    }

    this.score = Math.max(0, this.score + delta);
    document.getElementById('whack-score-val').textContent = this.score;
  }

  endGame() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    clearTimeout(this.spawnInterval);

    // Hide all spots
    const spots = document.querySelectorAll('.field-spot');
    spots.forEach(spot => spot.classList.remove('active'));

    const startScreen = document.getElementById('whack-start-screen');
    startScreen.style.display = 'flex';
    window.arcade.playSynthSound('cheer');

    startScreen.innerHTML = `
      <h3 style="font-size: 1.8rem; color: var(--primary-green); margin-bottom: 10px;">Innings Finished</h3>
      <p style="margin-bottom: 15px;">You took <strong>${this.score} catches / run-outs</strong>!</p>
      <button class="btn-primary" onclick="window.catchCatchesGame.startGame()" style="margin-bottom: 10px;">New Innings</button>
      <button class="btn-primary" style="background:var(--glass-bg); color:#fff; border:1px solid var(--glass-border);" onclick="window.arcade.switchScreen('dashboard')">Back to Hub</button>
    `;

    // Save high score
    if (this.score > this.highscore) {
      this.highscore = this.score;
      localStorage.setItem('whack_highscore', this.highscore);
    }
    window.arcade.saveHighScore('whack', this.score);
    this.updateStats();

    // Add Career Runs
    const runsEarned = this.score * 5;
    window.arcade.addCareerRuns(runsEarned);
  }

  destroy() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    clearTimeout(this.spawnInterval);
  }
}

window.catchCatchesGame = new CatchCatchesGame();
