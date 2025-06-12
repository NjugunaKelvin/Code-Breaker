const gameState = {
  secretCode: '',
  attemptsLeft: 0,
  codeLength: 4,
  difficulty: 'easy',
  previousGuesses: [],
  gameActive: false
};

const elements = {
  guessInput: document.getElementById('guess-input'),
  submitBtn: document.getElementById('submit-guess'),
  feedbackDiv: document.getElementById('feedback'),
  attemptsDisplay: document.getElementById('attempts'),
  difficultyBtns: document.querySelectorAll('.difficulty-btn'),
  currentDifficultyDisplay: document.getElementById('current-difficulty'),
  gameContainer: document.querySelector('.game-container'),
  confettiCanvas: document.getElementById('confetti-canvas')
};

function initGame() {
  setDifficultyParams();
  
  gameState.secretCode = generateCode(gameState.codeLength);
  gameState.attemptsLeft = calculateMaxAttempts();
  gameState.previousGuesses = [];
  gameState.gameActive = true;
  
  updateUI();
  elements.feedbackDiv.innerHTML = '<div class="attempt-header"><span>Guess</span><span>Feedback</span></div>';
  clearInput();
  
  // Reset animations
  elements.gameContainer.classList.remove('celebrate');
}

function setDifficultyParams() {
  switch(gameState.difficulty) {
    case 'easy': gameState.codeLength = 4; break;
    case 'medium': gameState.codeLength = 5; break;
    case 'hard': gameState.codeLength = 6; break;
  }
  
  elements.guessInput.min = '1' + '0'.repeat(gameState.codeLength - 1);
  elements.guessInput.max = '9'.repeat(gameState.codeLength);
  elements.guessInput.placeholder = `Enter ${gameState.codeLength}-digit guess...`;
}

function calculateMaxAttempts() {
  return gameState.codeLength * 2;
}

function processGuess() {
  if (!gameState.gameActive) return;
  
  const guess = elements.guessInput.value.trim();
  
  if (!isValidGuess(guess)) {
    showError(`Please enter a valid ${gameState.codeLength}-digit code with unique digits!`);
    shakeInput();
    return;
  }
  
  elements.submitBtn.classList.add('pulse');
  setTimeout(() => elements.submitBtn.classList.remove('pulse'), 300);
  
  gameState.previousGuesses.push(guess);
  gameState.attemptsLeft--;
  
  const correctPositions = checkCorrectPositions(guess);
  if (correctPositions === gameState.codeLength) {
    endGame(true);
    return;
  }
  
  if (gameState.attemptsLeft <= 0) {
    endGame(false);
    return;
  }
  
  displayFeedback(guess, correctPositions);
  updateUI();
  clearInput();
}

function isValidGuess(guess) {
  if (!guess || guess.length !== gameState.codeLength) return false;
  
  const digits = new Set(guess.split(''));
  if (digits.size !== gameState.codeLength) return false;
  
  if (gameState.previousGuesses.includes(guess)) return false;
  
  return true;
}

function generateCode(length) {
  const digits = [];
  while (digits.length < length) {
    const digit = Math.floor(Math.random() * 10);
    if (!digits.includes(digit)) {
      digits.push(digit);
    }
  }
  return digits.join('');
}

function checkCorrectPositions(guess) {
  let correctCount = 0;
  for (let i = 0; i < gameState.codeLength; i++) {
    if (guess[i] === gameState.secretCode[i]) {
      correctCount++;
    }
  }
  return correctCount;
}

function displayFeedback(guess, correctPositions) {
  const feedbackItem = document.createElement('div');
  feedbackItem.className = 'attempt';
  
  const feedbackSymbols = [];
  for (let i = 0; i < gameState.codeLength; i++) {
    if (guess[i] === gameState.secretCode[i]) {
      feedbackSymbols.push('✔');
    } else {
      feedbackSymbols.push('✖');
    }
  }
  
  feedbackItem.innerHTML = `
    <span class="guess">${guess}</span>
    <span class="feedback-symbols">
      ${feedbackSymbols.map(sym => `<span class="${sym === '✔' ? 'correct' : 'incorrect'}">${sym}</span>`).join('')}
    </span>
  `;
  
  feedbackItem.style.opacity = '0';
  feedbackItem.style.transform = 'translateY(20px)';
  elements.feedbackDiv.appendChild(feedbackItem);
  
  setTimeout(() => {
    feedbackItem.style.opacity = '1';
    feedbackItem.style.transform = 'translateY(0)';
    feedbackItem.style.transition = 'all 0.3s ease-out';
  }, 10);
}

function endGame(isWin) {
  gameState.gameActive = false;
  
  elements.submitBtn.disabled = true;
  elements.guessInput.disabled = true;
  
  setTimeout(() => {
    if (isWin) {
      celebrateWin();
      showWinMessage();
    } else {
      showLoseMessage();
    }
  }, 500);
}

function celebrateWin() {
  elements.gameContainer.classList.add('celebrate');
  
  if (elements.confettiCanvas) {
    const confettiSettings = { 
      target: elements.confettiCanvas,
      max: 150,
      size: 1.5,
      animate: true
    };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
    
    setTimeout(() => confetti.clear(), 5000);
  }
}

function showWinMessage() {
  const modal = document.createElement('div');
  modal.className = 'result-modal win';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>🎉 You Cracked It! 🎉</h2>
      <p class="win-message">Perfect match in ${gameState.previousGuesses.length} attempts!</p>
      <p class="code-reveal">The secret code was: <strong>${gameState.secretCode}</strong></p>
      <button id="play-again-btn" class="pulse">Play Again</button>
    </div>
  `;
  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.classList.add('visible');
  }, 10);
  
  document.getElementById('play-again-btn').addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => {
      modal.remove();
      resetGame();
    }, 300);
  });
}

function showLoseMessage() {
  const modal = document.createElement('div');
  modal.className = 'result-modal lose';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>🔐 Mission Failed</h2>
      <p>You didn't crack the code in time!</p>
      <p class="code-reveal">The secret code was: <strong>${gameState.secretCode}</strong></p>
      <button id="play-again-btn">Try Again</button>
    </div>
  `;
  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.classList.add('visible');
  }, 10);
  
  document.getElementById('play-again-btn').addEventListener('click', () => {
    modal.classList.remove('visible');
    setTimeout(() => {
      modal.remove();
      resetGame();
    }, 300);
  });
}

function resetGame() {
  elements.submitBtn.disabled = false;
  elements.guessInput.disabled = false;
  initGame();
}

function clearInput() {
  elements.guessInput.value = '';
  elements.guessInput.focus();
}

function updateUI() {
  elements.attemptsDisplay.textContent = gameState.attemptsLeft;
  elements.currentDifficultyDisplay.textContent = 
    gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1);
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.classList.add('fade-out');
    setTimeout(() => errorDiv.remove(), 300);
  }, 2500);
}

function shakeInput() {
  elements.guessInput.classList.add('shake');
  setTimeout(() => elements.guessInput.classList.remove('shake'), 500);
}

elements.submitBtn.addEventListener('click', processGuess);
elements.guessInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') processGuess();
});

elements.difficultyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    elements.difficultyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameState.difficulty = btn.dataset.difficulty;
    resetGame();
  });
});

initGame();