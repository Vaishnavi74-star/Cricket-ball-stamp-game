/**
 * Game: Cricket Tic-Tac-Toe (Bat vs Ball)
 */

class TicTacToeGame {
  constructor() {
    this.board = Array(9).fill(null); // 'X' for Player (Bat), 'O' for Computer (Ball)
    this.gameActive = false;
    this.computerTimeout = null;
    this.winsCount = parseInt(localStorage.getItem('ttt_wins_count')) || 0;
  }

  init() {
    this.board = Array(9).fill(null);
    this.gameActive = true;
    
    // Clear board cells
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.className = 'ttt-cell';
    });

    document.getElementById('ttt-status-text').textContent = 'Your turn! Tap a square to play your Bat.';
    this.updateStats();
  }

  updateStats() {
    document.getElementById('ttt-wins-display').textContent = `Wins: ${this.winsCount}`;
  }

  destroy() {
    this.gameActive = false;
    clearTimeout(this.computerTimeout);
  }

  makeMove(cellEl, index) {
    if (!this.gameActive || this.board[index] !== null) return;

    // Player Move
    this.board[index] = 'X';
    cellEl.innerHTML = `<img src="images/bat.png" alt="Bat">`;
    window.arcade.playSynthSound('click');

    if (this.checkWin('X')) {
      this.endGame('win');
      return;
    }

    if (this.checkDraw()) {
      this.endGame('draw');
      return;
    }

    // Computer Move
    this.gameActive = false;
    document.getElementById('ttt-status-text').textContent = 'Computer is bowling...';
    
    this.computerTimeout = setTimeout(() => {
      this.computerPlay();
    }, 600);
  }

  computerPlay() {
    const bestMove = this.getBestMove();
    this.board[bestMove] = 'O';
    
    const cellEl = document.querySelector(`.ttt-cell[data-index="${bestMove}"]`);
    if (cellEl) {
      cellEl.innerHTML = `<img src="images/ball.png" alt="Ball">`;
      window.arcade.playSynthSound('hit');
    }

    if (this.checkWin('O')) {
      this.endGame('lost');
      return;
    }

    if (this.checkDraw()) {
      this.endGame('draw');
      return;
    }

    this.gameActive = true;
    document.getElementById('ttt-status-text').textContent = 'Your turn! Tap a square.';
  }

  checkWin(player) {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (let condition of winConditions) {
      if (
        this.board[condition[0]] === player &&
        this.board[condition[1]] === player &&
        this.board[condition[2]] === player
      ) {
        // Highlight winning cells
        if (this.gameActive === false) { // check during end game check
          condition.forEach(idx => {
            const cell = document.querySelector(`.ttt-cell[data-index="${idx}"]`);
            if (cell) cell.classList.add('winner');
          });
        }
        return true;
      }
    }
    return false;
  }

  checkDraw() {
    return this.board.every(cell => cell !== null);
  }

  // AI Logic: Smart blocking and winning
  getBestMove() {
    // 1. Can AI win in this move?
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'O';
        if (this.checkWin('O')) {
          this.board[i] = null;
          return i;
        }
        this.board[i] = null;
      }
    }

    // 2. Can player win? Block them!
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'X';
        if (this.checkWin('X')) {
          this.board[i] = null;
          return i;
        }
        this.board[i] = null;
      }
    }

    // 3. Take center if free
    if (this.board[4] === null) return 4;

    // 4. Take corners
    const corners = [0, 2, 6, 8];
    const freeCorners = corners.filter(idx => this.board[idx] === null);
    if (freeCorners.length > 0) {
      return freeCorners[Math.floor(Math.random() * freeCorners.length)];
    }

    // 5. Take whatever is left
    const freeSlots = [];
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) freeSlots.push(i);
    }
    return freeSlots[Math.floor(Math.random() * freeSlots.length)];
  }

  endGame(result) {
    this.gameActive = false;
    
    // Highlight winning row if win/lost
    this.checkWin(result === 'win' ? 'X' : 'O');

    let statusText = '';
    let runsEarned = 0;

    if (result === 'win') {
      statusText = 'You Won! Superb Cover Drive! 🏆';
      runsEarned = 15;
      this.winsCount++;
      localStorage.setItem('ttt_wins_count', this.winsCount);
      window.arcade.saveHighScore('ttt', this.winsCount);
      window.arcade.playSynthSound('success');
      window.arcade.playSynthSound('cheer');
    } else if (result === 'lost') {
      statusText = 'Clean Bowled! Computer wins. 😢';
      runsEarned = -5;
      window.arcade.playSynthSound('fail');
    } else {
      statusText = "It's a Draw! Good match. 🤝";
      runsEarned = 5;
      window.arcade.playSynthSound('click');
    }

    this.updateStats();
    window.arcade.addCareerRuns(runsEarned);
    document.getElementById('ttt-status-text').innerHTML = `${statusText} <span style="color:var(--primary-green); margin-left: 10px;">(${runsEarned >= 0 ? '+' : ''}${runsEarned} runs)</span>`;
  }
}

window.ticTacToeGame = new TicTacToeGame();
