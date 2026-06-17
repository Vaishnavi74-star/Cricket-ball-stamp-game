/**
 * Game: Bat-Ball-Stump (Flagship Game)
 */

class BatBallStumpGame {
  constructor() {
    this.score = {
      win: 0,
      lost: 0,
      tie: 0
    };
    this.isRolling = false;
  }

  init() {
    // Load local stats if any
    const saved = localStorage.getItem('bbs_local_score');
    if (saved) {
      this.score = JSON.parse(saved);
    } else {
      this.resetScoreBoard();
    }
    
    this.updateUI();
    
    // Clear previous round visual states
    document.getElementById('bbs-user-move-icon').textContent = '❓';
    document.getElementById('bbs-comp-move-icon').textContent = '❓';
    document.getElementById('bbs-result-msg').textContent = 'Make your choice!';
    document.getElementById('bbs-result-msg').className = 'result-msg';
  }

  resetScoreBoard() {
    this.score = { win: 0, lost: 0, tie: 0 };
    localStorage.setItem('bbs_local_score', JSON.stringify(this.score));
    this.updateUI();
  }

  updateUI() {
    document.getElementById('bbs-win-val').textContent = this.score.win;
    document.getElementById('bbs-lost-val').textContent = this.score.lost;
    document.getElementById('bbs-tie-val').textContent = this.score.tie;
  }

  destroy() {
    this.isRolling = false;
  }

  playMove(userMove) {
    if (this.isRolling) return;
    this.isRolling = true;

    // Reset styles
    const resultEl = document.getElementById('bbs-result-msg');
    resultEl.textContent = 'Bowling...';
    resultEl.className = 'result-msg';
    
    // Play button tap
    window.arcade.playSynthSound('click');

    // Show user choice immediately
    const userIcon = this.getMoveIcon(userMove);
    document.getElementById('bbs-user-move-icon').textContent = userIcon;

    // Rolling animation for computer choice
    const compIconEl = document.getElementById('bbs-comp-move-icon');
    const options = ['Bat', 'Ball', 'Stump'];
    let rollIndex = 0;
    let ticks = 0;
    
    const interval = setInterval(() => {
      if (!this.isRolling) {
        clearInterval(interval);
        return;
      }

      compIconEl.textContent = this.getMoveIcon(options[rollIndex]);
      rollIndex = (rollIndex + 1) % options.length;
      ticks++;
      
      // Sound tick for rolling
      window.arcade.playSynthSound('click');

      if (ticks >= 8) { // stop rolling after ~800ms
        clearInterval(interval);
        
        const computerMove = this.generateComputerChoice();
        compIconEl.textContent = this.getMoveIcon(computerMove);
        
        this.evaluateResult(userMove, computerMove);
        this.isRolling = false;
      }
    }, 100);
  }

  getMoveIcon(move) {
    if (move === 'Bat') return '🏏';
    if (move === 'Ball') return '🔴';
    if (move === 'Stump') return '🪧';
    return '❓';
  }

  generateComputerChoice() {
    const randomNumber = Math.random() * 3;
    if (randomNumber <= 1) return 'Bat';
    if (randomNumber <= 2) return 'Ball';
    return 'Stump';
  }

  evaluateResult(userMove, computerMove) {
    let result = '';
    let statusClass = '';
    let careerRunsDelta = 0;

    if (userMove === computerMove) {
      result = "It's a Tie! 🤝";
      statusClass = 'tie';
      this.score.tie++;
      careerRunsDelta = 2;
      window.arcade.playSynthSound('click');
    } else if (
      (userMove === 'Bat' && computerMove === 'Ball') ||
      (userMove === 'Ball' && computerMove === 'Stump') ||
      (userMove === 'Stump' && computerMove === 'Bat')
    ) {
      result = "You Won! 🏆";
      statusClass = 'win';
      this.score.win++;
      careerRunsDelta = 10;
      window.arcade.playSynthSound('success');
      window.arcade.playSynthSound('cheer');
    } else {
      result = "Computer Won! 😢";
      statusClass = 'lost';
      this.score.lost++;
      careerRunsDelta = -5;
      window.arcade.playSynthSound('fail');
    }

    // Save and update UI
    localStorage.setItem('bbs_local_score', JSON.stringify(this.score));
    this.updateUI();
    
    // Save high score (wins)
    window.arcade.saveHighScore('bbs', this.score.win);

    // Update career runs
    window.arcade.addCareerRuns(careerRunsDelta);

    // Show result text
    const resultEl = document.getElementById('bbs-result-msg');
    resultEl.textContent = result;
    resultEl.className = `result-msg ${statusClass}`;
  }
}

window.batBallStumpGame = new BatBallStumpGame();
