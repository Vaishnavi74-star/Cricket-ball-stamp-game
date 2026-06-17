/**
 * CricArcade - Central Controller & Sound Synthesizer
 */

class ArcadeController {
  constructor() {
    this.careerRuns = parseInt(localStorage.getItem('cricarcade_runs')) || 0;
    this.isMuted = localStorage.getItem('cricarcade_muted') === 'true';
    this.highScores = JSON.parse(localStorage.getItem('cricarcade_highscores')) || {
      bbs: 0,
      toss: 0,
      quiz: 0,
      catch: 0,
      memory: 999, // Lower is better (time)
      ttt: 0,
      guess: 0,
      whack: 0
    };
    
    this.audioCtx = null;
    this.activeGame = null;

    // 10-Second Demo/Tour Properties
    this.tourInterval = null;
    this.tourSlideIndex = 0;
    this.tourTimeLeft = 10;
    this.tourSlides = [
      {
        icon: '🎮',
        title: 'Step 1: Choose Your Game',
        text: 'CricArcade features 8 sports mini-games. Re-live Bat-Ball-Stump, test your trivia in the Cricket Quiz, or train reflexes with Catch the Ball!'
      },
      {
        icon: '📈',
        title: 'Step 2: Score Career Runs',
        text: 'Every match won, ball caught, or run scored adds to your global Career Runs. Accumulate runs to level up your Profile Level!'
      },
      {
        icon: '🔊',
        title: 'Step 3: Immersive Audio',
        text: 'Listen to on-the-fly audio feedback synthesized directly in your browser. Toggle sounds anytime with the speaker icon in the navbar. Let\'s play!'
      }
    ];
  }

  init() {
    this.updateHeaderUI();
    this.updateDashboardHighScores();
    this.setupGlobalEvents();

    // Check first load for quick tour
    if (localStorage.getItem('cricarcade_tour_shown') !== 'true') {
      setTimeout(() => this.startTour(), 1000); // 1s buffer for rendering
    }
  }

  // Setup Web Audio Context on first interaction
  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setupGlobalEvents() {
    // Sound toggle buttons
    const muteBtns = document.querySelectorAll('.btn-mute');
    muteBtns.forEach(btn => {
      btn.innerHTML = this.isMuted ? '🔇' : '🔊';
      btn.addEventListener('click', () => {
        this.toggleMute();
        muteBtns.forEach(b => b.innerHTML = this.isMuted ? '🔇' : '🔊');
      });
    });

    // Handle initial browser audio block
    document.addEventListener('click', () => this.initAudio(), { once: true });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('cricarcade_muted', this.isMuted);
    this.playSynthSound('click');
  }

  addCareerRuns(amount) {
    this.careerRuns = Math.max(0, this.careerRuns + amount);
    localStorage.setItem('cricarcade_runs', this.careerRuns);
    
    // Animate run addition
    const runsEl = document.getElementById('global-runs');
    if (runsEl) {
      runsEl.classList.remove('pulse');
      void runsEl.offsetWidth; // trigger reflow
      runsEl.classList.add('pulse');
      runsEl.textContent = this.careerRuns;
    }
    
    // Update level
    const levelEl = document.getElementById('global-level');
    if (levelEl) {
      levelEl.textContent = this.getCareerLevel();
    }
  }

  getCareerLevel() {
    return Math.floor(this.careerRuns / 100) + 1;
  }

  updateHeaderUI() {
    const runsEl = document.getElementById('global-runs');
    const levelEl = document.getElementById('global-level');
    if (runsEl) runsEl.textContent = this.careerRuns;
    if (levelEl) levelEl.textContent = this.getCareerLevel();
  }

  updateDashboardHighScores() {
    const cards = {
      bbs: { id: 'score-bbs', suffix: ' wins' },
      toss: { id: 'score-toss', suffix: ' wins' },
      quiz: { id: 'score-quiz', suffix: '/10' },
      catch: { id: 'score-catch', suffix: ' runs' },
      memory: { id: 'score-memory', suffix: 's', checkMin: true },
      ttt: { id: 'score-ttt', suffix: ' wins' },
      guess: { id: 'score-guess', suffix: ' wins' },
      whack: { id: 'score-whack', suffix: ' catches' }
    };

    for (const [key, config] of Object.entries(cards)) {
      const el = document.getElementById(config.id);
      if (el) {
        const val = this.highScores[key];
        if (config.checkMin) {
          el.textContent = val === 999 ? 'None' : `${val}${config.suffix}`;
        } else {
          el.textContent = `${val}${config.suffix}`;
        }
      }
    }
  }

  saveHighScore(gameKey, score) {
    if (gameKey === 'memory') {
      if (score < this.highScores.memory) {
        this.highScores.memory = score;
      }
    } else {
      if (score > this.highScores[gameKey]) {
        this.highScores[gameKey] = score;
      }
    }
    localStorage.setItem('cricarcade_highscores', JSON.stringify(this.highScores));
    this.updateDashboardHighScores();
  }

  switchScreen(screenId) {
    this.initAudio();
    this.playSynthSound('click');
    
    // If leaving a game, stop it
    if (this.activeGame && typeof this.activeGame.destroy === 'function') {
      this.activeGame.destroy();
      this.activeGame = null;
    }

    // Hide all containers
    document.getElementById('dashboard-container').style.display = 'none';
    const gameViews = document.querySelectorAll('.game-view');
    gameViews.forEach(view => view.style.display = 'none');

    // Show selected container
    if (screenId === 'dashboard') {
      document.getElementById('dashboard-container').style.display = 'block';
    } else {
      const view = document.getElementById(`${screenId}-view`);
      if (view) {
        view.style.display = 'block';
        // Initialize game specific controller
        this.initializeGame(screenId);
      }
    }
  }

  initializeGame(gameId) {
    switch (gameId) {
      case 'bat-ball-stump':
        if (window.batBallStumpGame) {
          this.activeGame = window.batBallStumpGame;
          this.activeGame.init();
        }
        break;
      case 'toss-simulator':
        if (window.tossSimulatorGame) {
          this.activeGame = window.tossSimulatorGame;
          this.activeGame.init();
        }
        break;
      case 'cricket-quiz':
        if (window.cricketQuizGame) {
          this.activeGame = window.cricketQuizGame;
          this.activeGame.init();
        }
        break;
      case 'catch-ball':
        if (window.catchBallGame) {
          this.activeGame = window.catchBallGame;
          this.activeGame.init();
        }
        break;
      case 'memory-match':
        if (window.memoryMatchGame) {
          this.activeGame = window.memoryMatchGame;
          this.activeGame.init();
        }
        break;
      case 'tic-tac-toe':
        if (window.ticTacToeGame) {
          this.activeGame = window.ticTacToeGame;
          this.activeGame.init();
        }
        break;
      case 'guess-score':
        if (window.guessScoreGame) {
          this.activeGame = window.guessScoreGame;
          this.activeGame.init();
        }
        break;
      case 'catch-catches':
        if (window.catchCatchesGame) {
          this.activeGame = window.catchCatchesGame;
          this.activeGame.init();
        }
        break;
    }
  }

  // Synthesize Retro Sports Sound Effects via Web Audio API
  playSynthSound(type) {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    try {
      switch (type) {
        case 'click': {
          // Soft wooden button tick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'hit': {
          // Wack! Bat hitting ball (wood block pitch + white noise snap)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

          osc.start(now);
          osc.stop(now + 0.16);

          // Add a short high-frequency transient click
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          clickOsc.connect(clickGain);
          clickGain.connect(ctx.destination);
          clickOsc.type = 'triangle';
          clickOsc.frequency.setValueAtTime(1200, now);
          clickGain.gain.setValueAtTime(0.2, now);
          clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
          clickOsc.start(now);
          clickOsc.stop(now + 0.03);
          break;
        }

        case 'toss': {
          // Ringing spinning coin
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(880, now);
          osc1.frequency.linearRampToValueAtTime(1200, now + 0.3);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1100, now);
          osc2.frequency.linearRampToValueAtTime(1500, now + 0.3);

          gain.gain.setValueAtTime(0.15, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.4);
          osc2.stop(now + 0.4);
          break;
        }

        case 'success': {
          // Positive melody
          const notes = [440, 554, 659, 880];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.12, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.16);
          });
          break;
        }

        case 'fail': {
          // Sad descending buzzer
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(110, now + 0.3);

          gain.gain.setValueAtTime(0.15, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }

        case 'countdown': {
          // short beep
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'cheer': {
          // Simulating a mini crowd cheer with noise
          const bufferSize = ctx.sampleRate * 1.2; // 1.2s duration
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          // Bandpass filter to make it sound like stadium crowd roaring
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1000;
          filter.Q.value = 0.8;

          const gain = ctx.createGain();
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.18, now + 0.2); // swell
          gain.gain.exponentialRampToValueAtTime(0.005, now + 1.2); // fade

          noise.start(now);
          noise.stop(now + 1.25);
          break;
        }
      }
    } catch (e) {
      console.warn("Sound play error: ", e);
    }
  }

  // 10-Second Interactive Tour Engine
  startTour() {
    this.initAudio();
    const overlay = document.getElementById('tour-overlay');
    if (!overlay) return;
    
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 50);
    
    this.tourSlideIndex = 0;
    this.tourTimeLeft = 10;
    this.updateTourSlide();
    
    // Setup and run progress interval
    clearInterval(this.tourInterval);
    const progressEl = document.getElementById('tour-progress');
    const timerLabel = document.getElementById('tour-timer-label');
    
    const startTime = Date.now();
    const duration = 10000; // 10 seconds total
    
    this.tourInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      if (progressEl) progressEl.style.width = `${progress}%`;
      
      const secondsLeft = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      if (timerLabel) timerLabel.textContent = `${secondsLeft}s`;
      
      // Auto advance slides based on time
      if (secondsLeft > 6 && this.tourSlideIndex !== 0) {
        this.tourSlideIndex = 0;
        this.updateTourSlide();
      } else if (secondsLeft <= 6 && secondsLeft > 3 && this.tourSlideIndex !== 1) {
        this.tourSlideIndex = 1;
        this.updateTourSlide();
      } else if (secondsLeft <= 3 && secondsLeft > 0 && this.tourSlideIndex !== 2) {
        this.tourSlideIndex = 2;
        this.updateTourSlide();
      }
      
      if (elapsed >= duration) {
        clearInterval(this.tourInterval);
        this.closeTour();
      }
    }, 100);
  }

  updateTourSlide() {
    const slide = this.tourSlides[this.tourSlideIndex];
    const container = document.getElementById('tour-body-content');
    if (!container) return;
    
    container.innerHTML = `
      <div class="tour-slide-icon">${slide.icon}</div>
      <h4 style="font-size: 1.15rem; font-weight: 700; color:#fff;">${slide.title}</h4>
      <p class="tour-slide-text">${slide.text}</p>
    `;
    
    // Update button states
    const btnPrev = document.getElementById('btn-tour-prev');
    const btnNext = document.getElementById('btn-tour-next');
    if (btnPrev) btnPrev.style.opacity = this.tourSlideIndex === 0 ? '0.3' : '1';
    if (btnNext) btnNext.textContent = this.tourSlideIndex === this.tourSlides.length - 1 ? 'Finish' : 'Next';
  }

  nextTourSlide() {
    window.arcade.playSynthSound('click');
    if (this.tourSlideIndex < this.tourSlides.length - 1) {
      this.tourSlideIndex++;
      this.updateTourSlide();
    } else {
      this.closeTour();
    }
  }

  prevTourSlide() {
    window.arcade.playSynthSound('click');
    if (this.tourSlideIndex > 0) {
      this.tourSlideIndex--;
      this.updateTourSlide();
    }
  }

  closeTour() {
    clearInterval(this.tourInterval);
    const overlay = document.getElementById('tour-overlay');
    if (!overlay) return;
    
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 400);
    
    localStorage.setItem('cricarcade_tour_shown', 'true');
    this.playSynthSound('success');
  }

} // end ArcadeController

// Global instance
window.arcade = new ArcadeController();
document.addEventListener('DOMContentLoaded', () => {
  window.arcade.init();
});
