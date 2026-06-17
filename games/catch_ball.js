/**
 * Game: Catch the Ball (Reflex Game)
 */

class CatchBallGame {
  constructor() {
    this.score = 0;
    this.wickets = 3;
    this.timeLeft = 30;
    this.gameActive = false;
    
    this.timerInterval = null;
    this.ballTimeout = null;
    this.shrinkInterval = null;
    
    this.currentBallSize = 60;
    this.baseLifetime = 1500; // ms
    this.currentLifetime = 1500;
  }

  init() {
    this.destroy(); // safety cleanup
    
    this.score = 0;
    this.wickets = 3;
    this.timeLeft = 30;
    this.gameActive = false;
    this.currentLifetime = this.baseLifetime;
    
    document.getElementById('catch-score-val').textContent = this.score;
    document.getElementById('catch-wickets-val').textContent = '🏏🏏🏏';
    document.getElementById('catch-time-val').textContent = `${this.timeLeft}s`;
    
    document.getElementById('catch-start-screen').style.display = 'flex';
    document.getElementById('catch-ball-target').style.display = 'none';
  }

  startGame() {
    window.arcade.playSynthSound('click');
    this.gameActive = true;
    document.getElementById('catch-start-screen').style.display = 'none';
    
    // Start countdown timer
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('catch-time-val').textContent = `${this.timeLeft}s`;
      
      if (this.timeLeft <= 3 && this.timeLeft > 0) {
        window.arcade.playSynthSound('countdown');
      }

      if (this.timeLeft <= 0) {
        this.endGame(true); // timed out win/finish
      }
    }, 1000);

    this.spawnBall();
  }

  spawnBall() {
    if (!this.gameActive) return;

    const field = document.getElementById('catch-field');
    const ball = document.getElementById('catch-ball-target');
    
    if (!field || !ball) return;

    // Get field dimensions
    const fieldWidth = field.clientWidth;
    const fieldHeight = field.clientHeight;
    
    // Random position (leaving a margin for the ball size)
    const margin = 70;
    const x = Math.random() * (fieldWidth - margin * 2) + margin;
    const y = Math.random() * (fieldHeight - margin * 2) + margin;
    
    // Size and position
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
    ball.style.display = 'block';
    
    // Reset shrink parameters
    this.currentBallSize = 65;
    ball.style.width = `${this.currentBallSize}px`;
    ball.style.height = `${this.currentBallSize}px`;
    ball.style.opacity = '1';

    // Difficulty scaling: shrink faster as score increases
    this.currentLifetime = Math.max(700, this.baseLifetime - this.score * 40);

    // Shrinking loop
    clearInterval(this.shrinkInterval);
    const shrinkSteps = 20;
    const shrinkStepTime = this.currentLifetime / shrinkSteps;
    let step = 0;

    this.shrinkInterval = setInterval(() => {
      if (!this.gameActive) {
        clearInterval(this.shrinkInterval);
        return;
      }

      step++;
      const ratio = 1 - (step / shrinkSteps);
      const newSize = 20 + (45 * ratio); // shrink down to min 20px
      
      ball.style.width = `${newSize}px`;
      ball.style.height = `${newSize}px`;
      ball.style.opacity = ratio;

      if (step >= shrinkSteps) {
        clearInterval(this.shrinkInterval);
        this.missBall();
      }
    }, shrinkStepTime);
  }

  catchBall(event) {
    if (event) event.stopPropagation(); // prevent clicking field
    if (!this.gameActive) return;

    clearInterval(this.shrinkInterval);
    
    // Play cricket bat strike!
    window.arcade.playSynthSound('hit');

    // Add runs based on quickness (earlier clicks get more runs)
    const sizeReached = parseFloat(document.getElementById('catch-ball-target').style.width);
    const scoreAdd = sizeReached > 45 ? 6 : (sizeReached > 30 ? 4 : 2); // 6, 4, or 2 runs!
    
    this.score += scoreAdd;
    document.getElementById('catch-score-val').textContent = this.score;

    // Show temporary score float effect
    this.showFloatingText(`+${scoreAdd} Runs!`, event.clientX, event.clientY);

    // Spawn another
    this.spawnBall();
  }

  showFloatingText(text, x, y) {
    const floatEl = document.createElement('div');
    floatEl.textContent = text;
    floatEl.style.position = 'fixed';
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y - 20}px`;
    floatEl.style.color = 'var(--primary-green)';
    floatEl.style.fontWeight = 'bold';
    floatEl.style.fontFamily = 'var(--font-mono)';
    floatEl.style.pointerEvents = 'none';
    floatEl.style.zIndex = '1000';
    floatEl.style.transition = 'all 0.6s ease-out';
    
    document.body.appendChild(floatEl);

    requestAnimationFrame(() => {
      floatEl.style.transform = 'translateY(-40px)';
      floatEl.style.opacity = '0';
    });

    setTimeout(() => floatEl.remove(), 600);
  }

  missBall() {
    if (!this.gameActive) return;

    window.arcade.playSynthSound('fail');
    this.wickets--;
    
    // Update wickets graphics
    let wicketsStr = '';
    for (let i = 0; i < this.wickets; i++) wicketsStr += '🏏';
    document.getElementById('catch-wickets-val').textContent = wicketsStr || 'OUT';

    if (this.wickets <= 0) {
      this.endGame(false); // Clean bowled!
    } else {
      this.spawnBall();
    }
  }

  endGame(finishedOk) {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    clearInterval(this.shrinkInterval);
    
    document.getElementById('catch-ball-target').style.display = 'none';
    
    const startScreen = document.getElementById('catch-start-screen');
    startScreen.style.display = 'flex';
    
    let endMsg = '';
    if (finishedOk) {
      endMsg = `Innings Over! You scored <strong>${this.score} runs</strong>!`;
      window.arcade.playSynthSound('cheer');
    } else {
      endMsg = `ALL OUT! Wickets blown away. You scored <strong>${this.score} runs</strong>.`;
      window.arcade.playSynthSound('fail');
    }

    startScreen.innerHTML = `
      <h3 style="font-size: 1.8rem; color: var(--primary-green); margin-bottom: 10px;">Game Over</h3>
      <p style="margin-bottom: 15px;">${endMsg}</p>
      <button class="btn-primary" onclick="window.catchBallGame.startGame()" style="margin-bottom: 10px;">Play Again</button>
      <button class="btn-primary" style="background:var(--glass-bg); color:#fff; border:1px solid var(--glass-border);" onclick="window.arcade.switchScreen('dashboard')">Back to Hub</button>
    `;

    // Save High Score
    window.arcade.saveHighScore('catch', this.score);
    
    // Save Career Runs (1:1 conversion)
    window.arcade.addCareerRuns(this.score);
  }

  destroy() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    clearInterval(this.shrinkInterval);
  }
}

window.catchBallGame = new CatchBallGame();
