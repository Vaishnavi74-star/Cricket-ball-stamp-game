/**
 * Game: Cricket Quiz
 */

class CricketQuiz {
  constructor() {
    this.questionsPool = [
      {
        q: "Who is known as the 'God of Cricket'?",
        options: ["Ricky Ponting", "Sachin Tendulkar", "Brian Lara", "Donald Bradman"],
        a: 1
      },
      {
        q: "How many balls are bowled in a standard completed over?",
        options: ["4", "5", "6", "8"],
        a: 2
      },
      {
        q: "What does LBW stand for in cricket?",
        options: ["Leg Beyond Wicket", "Leg Before Wicket", "Long Boundary Width", "Line Between Wickets"],
        a: 1
      },
      {
        q: "Which nation won the first-ever Cricket World Cup in 1975?",
        options: ["Australia", "West Indies", "England", "India"],
        a: 1
      },
      {
        q: "Who holds the record for the highest individual score in a Test match inning (400 runs)?",
        options: ["Sachin Tendulkar", "Virat Kohli", "Brian Lara", "Chris Gayle"],
        a: 2
      },
      {
        q: "What is the maximum number of fielders allowed outside the circle during the first 6 overs in a T20?",
        options: ["2", "3", "4", "5"],
        a: 0
      },
      {
        q: "Which country is nicknamed 'The Proteas'?",
        options: ["New Zealand", "Australia", "Sri Lanka", "South Africa"],
        a: 3
      },
      {
        q: "How many stumps are on a cricket pitch in total (both ends combined)?",
        options: ["3", "4", "6", "8"],
        a: 2
      },
      {
        q: "What is the length of a standard cricket pitch (between wickets)?",
        options: ["18 yards", "20 yards", "22 yards", "24 yards"],
        a: 2
      },
      {
        q: "Who was the captain of the Indian team when they won the 2011 ICC World Cup?",
        options: ["Sourav Ganguly", "MS Dhoni", "Virat Kohli", "Rahul Dravid"],
        a: 1
      },
      {
        q: "Which bowler has taken the most wickets in Test match history?",
        options: ["Shane Warne", "Muttiah Muralitharan", "James Anderson", "Anil Kumble"],
        a: 1
      },
      {
        q: "What is the term used when a batsman is dismissed on the very first ball they face?",
        options: ["Golden Duck", "Silver Duck", "Diamond Duck", "Royal Duck"],
        a: 0
      },
      {
        q: "Where is the famous Melbourne Cricket Ground (MCG) located?",
        options: ["England", "New Zealand", "South Africa", "Australia"],
        a: 3
      },
      {
        q: "What color is the ball traditionally used in Day/Night Test matches?",
        options: ["Red", "White", "Pink", "Yellow"],
        a: 2
      },
      {
        q: "Who is the fastest bowler to deliver a ball, clocking at 161.3 km/h?",
        options: ["Brett Lee", "Shoaib Akhtar", "Shaun Tait", "Mitchell Starc"],
        a: 1
      }
    ];

    this.activeQuestions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.timer = null;
    this.nextTimeout = null;
    this.timeLeft = 10;
    this.totalQuestions = 10;
    this.answered = false;
  }

  init() {
    this.destroy(); // cleanup any running state
    this.score = 0;
    this.currentIndex = 0;
    this.answered = false;

    // Randomize and slice 10 questions from the pool
    this.activeQuestions = [...this.questionsPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, this.totalQuestions);

    document.getElementById('quiz-game-box').style.display = 'block';
    document.getElementById('quiz-summary-screen').style.display = 'none';

    this.showQuestion();
  }

  showQuestion() {
    if (this.currentIndex >= this.totalQuestions) {
      this.showSummary();
      return;
    }

    this.answered = false;
    const currentQ = this.activeQuestions[this.currentIndex];

    // Progress Bar
    const progressPercent = (this.currentIndex / this.totalQuestions) * 100;
    document.getElementById('quiz-progress').style.width = `${progressPercent}%`;

    // Question Details
    document.getElementById('quiz-question-number').textContent = `Question ${this.currentIndex + 1} of ${this.totalQuestions}`;
    document.getElementById('quiz-question-text').textContent = currentQ.q;

    // Render Options
    const optionsContainer = document.getElementById('quiz-options-list');
    optionsContainer.innerHTML = '';
    
    currentQ.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = opt;
      btn.onclick = () => this.checkAnswer(idx, btn);
      optionsContainer.appendChild(btn);
    });

    // Start Timer
    this.startTimer();
  }

  startTimer() {
    clearInterval(this.timer);
    this.timeLeft = 10;
    this.updateTimerUI();

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerUI();
      
      if (this.timeLeft > 0 && this.timeLeft <= 3) {
        window.arcade.playSynthSound('countdown');
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.timeOut();
      }
    }, 1000);
  }

  updateTimerUI() {
    const bar = document.getElementById('quiz-timer-bar');
    const label = document.getElementById('quiz-timer-numeric');
    if (bar && label) {
      const percent = (this.timeLeft / 10) * 100;
      bar.style.width = `${percent}%`;
      label.textContent = `${this.timeLeft}s`;

      // Change bar color based on time remaining
      if (this.timeLeft > 5) {
        bar.style.backgroundColor = 'var(--primary-green)';
        label.style.color = 'var(--primary-green)';
      } else if (this.timeLeft > 2) {
        bar.style.backgroundColor = 'var(--gold-trophy)';
        label.style.color = 'var(--gold-trophy)';
      } else {
        bar.style.backgroundColor = 'var(--leather-red)';
        label.style.color = 'var(--leather-red)';
      }
    }
  }

  checkAnswer(selectedIndex, clickedBtn) {
    if (this.answered) return;
    this.answered = true;
    clearInterval(this.timer);

    const currentQ = this.activeQuestions[this.currentIndex];
    const optionButtons = document.querySelectorAll('.quiz-option-btn');

    // Disable all options
    optionButtons.forEach(btn => btn.disabled = true);

    if (selectedIndex === currentQ.a) {
      // Correct
      this.score++;
      clickedBtn.classList.add('correct');
      window.arcade.playSynthSound('success');
    } else {
      // Incorrect
      clickedBtn.classList.add('incorrect');
      optionButtons[currentQ.a].classList.add('correct');
      window.arcade.playSynthSound('fail');
    }

    // Auto load next question after 2 seconds
    this.nextTimeout = setTimeout(() => {
      this.currentIndex++;
      this.showQuestion();
    }, 2000);
  }

  timeOut() {
    if (this.answered) return;
    this.answered = true;

    const currentQ = this.activeQuestions[this.currentIndex];
    const optionButtons = document.querySelectorAll('.quiz-option-btn');

    // Highlight correct answer
    optionButtons.forEach(btn => btn.disabled = true);
    optionButtons[currentQ.a].classList.add('correct');
    
    window.arcade.playSynthSound('fail');

    // Highlight scoreboard feedback
    const textEl = document.getElementById('quiz-question-text');
    textEl.innerHTML = `<span style="color: var(--leather-red); font-weight: bold;">TIME'S UP!</span><br>${currentQ.q}`;

    this.nextTimeout = setTimeout(() => {
      this.currentIndex++;
      this.showQuestion();
    }, 2000);
  }

  showSummary() {
    document.getElementById('quiz-game-box').style.display = 'none';
    const summaryScreen = document.getElementById('quiz-summary-screen');
    summaryScreen.style.display = 'flex';

    // Calculate rating and badge
    let badge = "";
    let ratingStars = "";
    if (this.score < 4) {
      badge = "Casual Fan 🏏";
      ratingStars = "★☆☆☆";
    } else if (this.score < 8) {
      badge = "Cricket Analyst 📊";
      ratingStars = "★★☆☆";
    } else if (this.score < 10) {
      badge = "T20 Captain 👑";
      ratingStars = "★★★☆";
    } else {
      badge = "Legendary Commentator 🏆";
      ratingStars = "★★★★";
    }

    document.getElementById('quiz-score-fraction').textContent = `${this.score} / ${this.totalQuestions}`;
    document.getElementById('quiz-badge').textContent = badge;
    document.getElementById('quiz-stars').textContent = ratingStars;

    // Award career runs
    const runsEarned = this.score * 10;
    document.getElementById('quiz-runs-earned').textContent = `+${runsEarned}`;
    window.arcade.addCareerRuns(runsEarned);
    
    // Save high score
    window.arcade.saveHighScore('quiz', this.score);
    
    if (this.score >= 8) {
      window.arcade.playSynthSound('cheer');
    }
  }

  destroy() {
    clearInterval(this.timer);
    clearTimeout(this.nextTimeout);
    this.answered = true; // prevent pending setTimeout callbacks from firing
  }
}

window.cricketQuizGame = new CricketQuiz();
