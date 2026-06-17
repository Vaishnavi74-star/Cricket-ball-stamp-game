/**
 * Game: Toss Simulator
 */

class TossSimulator {
  constructor() {
    this.userChoice = 'heads'; // default
    this.isSpinning = false;
    this.tossWins = parseInt(localStorage.getItem('toss_wins_count')) || 0;
  }

  init() {
    this.isSpinning = false;
    
    // Reset visual elements
    const coinEl = document.getElementById('toss-coin');
    if (coinEl) {
      coinEl.className = 'coin';
      coinEl.style.transform = 'rotateY(0deg)';
    }

    document.getElementById('toss-result-text').textContent = 'Heads or Tails? Call your choice!';
    document.getElementById('toss-decision-section').style.display = 'none';
    document.getElementById('toss-choice-section').style.display = 'flex';
    document.getElementById('btn-flip').disabled = false;
    
    this.selectChoice('heads');
    this.updateStats();
  }

  selectChoice(choice) {
    if (this.isSpinning) return;
    this.userChoice = choice;
    window.arcade.playSynthSound('click');
    
    document.getElementById('btn-call-heads').className = `toss-choice-btn ${choice === 'heads' ? 'selected' : ''}`;
    document.getElementById('btn-call-tails').className = `toss-choice-btn ${choice === 'tails' ? 'selected' : ''}`;
  }

  updateStats() {
    document.getElementById('toss-wins-display').textContent = `Tosses Won: ${this.tossWins}`;
  }

  destroy() {
    this.isSpinning = false;
  }

  flipCoin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    
    document.getElementById('btn-flip').disabled = true;
    document.getElementById('toss-result-text').textContent = 'Coin is in the air...';
    
    // Play toss spinning sound
    window.arcade.playSynthSound('toss');
    
    const coinEl = document.getElementById('toss-coin');
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    
    // Apply 3D CSS animation classes
    coinEl.className = 'coin';
    void coinEl.offsetWidth; // trigger reflow
    
    if (result === 'heads') {
      coinEl.classList.add('spin-to-heads');
    } else {
      coinEl.classList.add('spin-to-tails');
    }

    setTimeout(() => {
      if (!this.isSpinning) return;
      this.evaluateToss(result);
      this.isSpinning = false;
    }, 2000);
  }

  evaluateToss(outcome) {
    const resultTextEl = document.getElementById('toss-result-text');
    const decisionSection = document.getElementById('toss-decision-section');
    const choiceSection = document.getElementById('toss-choice-section');
    
    choiceSection.style.display = 'none';
    decisionSection.style.display = 'flex';

    const won = (this.userChoice === outcome);
    
    if (won) {
      this.tossWins++;
      localStorage.setItem('toss_wins_count', this.tossWins);
      this.updateStats();
      window.arcade.saveHighScore('toss', this.tossWins);
      window.arcade.playSynthSound('success');

      resultTextEl.innerHTML = `It's <span style="color: var(--gold-trophy); font-weight: bold; text-transform: uppercase;">${outcome}</span>! <strong>You won the toss!</strong>`;
      
      document.getElementById('toss-decision-title').textContent = 'What would you like to do?';
      document.getElementById('toss-decision-options').innerHTML = `
        <button class="btn-primary" onclick="window.tossSimulatorGame.makeDecision('bat')">Bat First</button>
        <button class="btn-primary" onclick="window.tossSimulatorGame.makeDecision('bowl')">Bowl First</button>
      `;
    } else {
      window.arcade.playSynthSound('fail');
      resultTextEl.innerHTML = `It's <span style="color: var(--leather-red); font-weight: bold; text-transform: uppercase;">${outcome}</span>. <strong>You lost the toss.</strong>`;
      
      const compChoice = Math.random() < 0.5 ? 'bat' : 'bowl';
      document.getElementById('toss-decision-title').textContent = `The opposition has elected to ${compChoice} first.`;
      document.getElementById('toss-decision-options').innerHTML = `
        <button class="btn-primary" onclick="window.tossSimulatorGame.makeDecision('${compChoice === 'bat' ? 'bowl' : 'bat'}')">Let's Play!</button>
      `;
    }
  }

  makeDecision(userRole) {
    window.arcade.playSynthSound('click');
    const roleText = userRole === 'bat' ? 'Batting' : 'Bowling';
    
    document.getElementById('toss-decision-title').textContent = `Match is set! You will be ${roleText} first!`;
    document.getElementById('toss-decision-options').innerHTML = `
      <button class="btn-primary" onclick="window.arcade.switchScreen('dashboard')">Back to Hub</button>
    `;
    
    // Award career runs
    window.arcade.addCareerRuns(10);
    window.arcade.playSynthSound('cheer');
  }
}

window.tossSimulatorGame = new TossSimulator();
