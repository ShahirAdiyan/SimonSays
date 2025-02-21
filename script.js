// Available colors
const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'teal'];

// Game variables
let buttons = {};
let sequence = [];
let playerSequence = [];
let score = 0;
let isPlayerTurn = false;
let speed = 800;
let timer;
let timeLeft = 5;
let maxTime = 5;

// Difficulty settings
let difficulty = 'easy';
let mirrorMode = false;
let colorInversion = false;

// Audio context for sounds
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// DOM elements
const startScreen = document.getElementById('start-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameContainer = document.getElementById('game-container');
const timerElement = document.getElementById('timer');
const timeLeftElement = document.getElementById('time-left');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

// Start button event listener
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    difficultyScreen.classList.remove('hidden');
});

// Difficulty button event listeners
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        difficulty = button.getAttribute('data-difficulty');
        setDifficultySettings();
        startGame();
    });
});

// Play again button event listener
playAgainBtn.addEventListener('click', resetGame);

// Set game settings based on difficulty
function setDifficultySettings() {
    switch (difficulty) {
        case 'easy':
            mirrorMode = false;
            colorInversion = false;
            speed = 800;
            maxTime = 5;
            break;
        case 'hard':
            mirrorMode = true;
            colorInversion = false;
            speed = 700;
            maxTime = 4;
            break;
        case 'insane':
            mirrorMode = false;
            colorInversion = true;
            speed = 600;
            maxTime = 3;
            break;
        case 'impossible':
            mirrorMode = true;
            colorInversion = true;
            speed = 500;
            maxTime = 2;
            break;
        default:
            mirrorMode = false;
            colorInversion = false;
            speed = 800;
            maxTime = 5;
    }
}

// Start the game
function startGame() {
    difficultyScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    sequence = [];
    playerSequence = [];
    score = 0;
    timeLeftElement.textContent = maxTime;
    timerElement.style.color = 'white';
    scoreElement.textContent = 'Score: 0';
    createButtons();
    nextLevel();
}

// Reset the game
function resetGame() {
    gameOverScreen.classList.add('hidden');
    difficultyScreen.classList.remove('hidden');
}

// Create buttons dynamically
function createButtons() {
    gameContainer.innerHTML = '';
    buttons = {};
    colors.forEach(color => {
        const button = document.createElement('button');
        button.classList.add('button');
        button.id = color;
        button.style.backgroundColor = getButtonColor(color);
        gameContainer.appendChild(button);
        buttons[color] = button;

        button.addEventListener('click', () => {
            handlePlayerInput(color);
        });
    });
    randomizeButtonPositions();
}

// Get button color
function getButtonColor(color) {
    const colorMap = {
        red: '#e74c3c',
        blue: '#3498db',
        green: '#2ecc71',
        yellow: '#f1c40f',
        purple: '#9b59b6',
        orange: '#e67e22',
        teal: '#1abc9c',
    };
    return colorMap[color];
}

// Randomize button positions
function randomizeButtonPositions() {
    const containerRect = gameContainer.getBoundingClientRect();
    const buttonSize = 100;
    const padding = 10;

    Object.values(buttons).forEach(button => {
        const maxLeft = containerRect.width - buttonSize - padding;
        const maxTop = containerRect.height - buttonSize - padding;
        const left = Math.floor(Math.random() * maxLeft) + padding;
        const top = Math.floor(Math.random() * maxTop) + padding;
        button.style.left = `${left}px`;
        button.style.top = `${top}px`;
    });
}

// Create sound oscillator
function createOscillator(freq) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
}

// Play random noise for distractions
function playRandomNoise() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(Math.random() * 1000 + 200, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);

    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
}

// Activate button with optional color inversion
function activateButton(color, invert = false) {
    const button = buttons[color];
    if (!button) return;

    if (invert) {
        button.classList.add('inverted');
    }

    button.classList.add('active');
    createOscillator(getFrequency(color));
    setTimeout(() => {
        button.classList.remove('active');
        if (invert) {
            button.classList.remove('inverted');
        }
    }, 300);
}

// Get frequency for each color
function getFrequency(color) {
    const frequencies = {
        red: 329.63,
        blue: 261.63,
        green: 440.00,
        yellow: 391.99,
        purple: 554.37,
        orange: 220.00,
        teal: 493.88,
    };
    return frequencies[color];
}

// Proceed to next level
function nextLevel() {
    score++;
    scoreElement.textContent = `Score: ${score}`;
    addToSequence();
    isPlayerTurn = false;
    playSequence();
}

// Add to the sequence with possible distractions
function addToSequence() {
    // Decide between real sequence and distraction
    const addDistraction = Math.random() < 0.2 && score > 5; // 20% chance after level 5
    if (addDistraction) {
        sequence.push('fake');
    } else {
        const numButtons = Object.keys(buttons).length;
        sequence.push(colors[Math.floor(Math.random() * numButtons)]);
    }
}

// Play the sequence to the player
function playSequence() {
    let i = 0;
    const sequenceToPlay = mirrorMode ? [...sequence].reverse() : sequence;
    const interval = setInterval(() => {
        const color = sequenceToPlay[i];
        if (color === 'fake') {
            // Play distraction
            playRandomNoise();
        } else {
            activateButton(color, colorInversion);
        }
        i++;
        if (i >= sequenceToPlay.length) {
            clearInterval(interval);
            isPlayerTurn = true;
            playerSequence = [];
            resetTimer();
            if (colorInversion) {
                removeColorInversion();
            }
        }
    }, speed);

    if (score % 3 === 0 && speed > 300) {
        speed = Math.max(300, speed - 100);
        maxTime = Math.max(2, maxTime - 0.5);
    }
}

// Remove color inversion after sequence playback
function removeColorInversion() {
    Object.values(buttons).forEach(button => {
        button.classList.remove('inverted');
    });
}

// Handle player input
function handlePlayerInput(color) {
    if (!isPlayerTurn) return;

    playerSequence.push(color);
    activateButton(color);
    resetTimer();

    const sequenceToMatch = mirrorMode ? [...sequence].reverse() : sequence;
    const currentStep = playerSequence.length - 1;

    if (playerSequence[currentStep] !== sequenceToMatch[currentStep]) {
        gameOver();
        return;
    }

    if (playerSequence.length === sequence.length) {
        isPlayerTurn = false;
        clearInterval(timer);
        setTimeout(nextLevel, 1000);
    }
}

// Reset the timer
function resetTimer() {
    clearInterval(timer);
    timeLeft = maxTime;
    timeLeftElement.textContent = timeLeft;
    timerElement.style.color = 'white';
    timer = setInterval(() => {
        timeLeft -= 1;
        timeLeftElement.textContent = timeLeft;
        if (timeLeft <= 2) {
            timerElement.style.color = 'red';
        }
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameOver();
        }
    }, 1000);
}

// Handle game over
function gameOver() {
    document.body.classList.add('game-over');
    clearInterval(timer);
    isPlayerTurn = false;
    setTimeout(() => {
        document.body.classList.remove('game-over');
        gameScreen.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
        finalScoreElement.textContent = `You got ${score} on ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty.`;

    }, 500);
}
