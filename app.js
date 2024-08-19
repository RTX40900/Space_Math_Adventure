let currentQuestion = {};
let isRapidFireMode = false;
let rapidFireScore = 0;
let highScores = [];
let currentLevel = 1;
let enemies = [];
let lives = 3;
let gameTimer;

function changeLevel() {
    currentLevel = parseInt(document.getElementById('level-select').value);
    generateQuestion();
}

function generateQuestion() {
    const num1 = Math.floor(Math.random() * 10 * currentLevel);
    const num2 = Math.floor(Math.random() * 10 * currentLevel);
    currentQuestion = {
        num1,
        num2,
        answer: num1 + num2
    };
    document.getElementById('question').innerText = `${num1} + ${num2} = ?`;
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    const feedback = document.getElementById('feedback');
    if (userAnswer === currentQuestion.answer) {
        feedback.innerText = 'Correct!';
        feedback.className = 'correct';
    } else {
        feedback.innerText = 'Incorrect. Try again.';
        feedback.className = 'incorrect';
    }
    document.getElementById('answer').value = '';
    generateQuestion();
}

function showTimerSelection() {
    document.getElementById('normal-mode').style.display = 'none';
    document.getElementById('rapid-fire-mode').style.display = 'none';
    document.getElementById('timer-selection').style.display = 'block';
}

function startRapidFireMode() {
    isRapidFireMode = true;
    document.getElementById('timer-selection').style.display = 'none';
    document.getElementById('rapid-fire-area').style.display = 'block';
    rapidFireScore = 0;
    lives = 3;
    updateScore();
    updateLives();
    startTimer();
    generateRapidFireQuestion();
    spawnEnemies();
}

function startTimer() {
    const selectedTime = parseInt(document.getElementById('timer-select').value);
    let timeLeft = selectedTime;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timeLeft;
    gameTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            endRapidFireMode();
        }
    }, 1000);
}

function generateRapidFireQuestion() {
    const num1 = Math.floor(Math.random() * 10 * currentLevel);
    const num2 = Math.floor(Math.random() * 10 * currentLevel);
    currentQuestion = {
        num1,
        num2,
        answer: num1 + num2
    };
    document.getElementById('rapid-fire-question').innerText = `${num1} + ${num2} = ?`;
}

function checkRapidFireAnswer() {
    const userAnswer = parseInt(document.getElementById('rapid-fire-answer').value);
    if (userAnswer === currentQuestion.answer) {
        rapidFireScore++;
        updateScore();
        shootLaser();
    }
    document.getElementById('rapid-fire-answer').value = '';
    generateRapidFireQuestion();
}

function updateScore() {
    document.getElementById('score').textContent = `Score: ${rapidFireScore}`;
}

function updateLives() {
    const lifeElements = document.querySelectorAll('#lives .life');
    lifeElements.forEach((life, index) => {
        if (index < lives) {
            life.style.visibility = 'visible';
        } else {
            life.style.visibility = 'hidden';
        }
    });
}

function spawnEnemies() {
    if (!isRapidFireMode) return;
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = `${Math.random() * (document.getElementById('space-battle').offsetWidth - 40)}px`;
    enemy.style.top = '0px';
    document.getElementById('enemies').appendChild(enemy);
    enemies.push(enemy);
    animateEnemy(enemy);
    setTimeout(spawnEnemies, 2000 / currentLevel);
}

function animateEnemy(enemy) {
    let pos = 0;
    const animation = setInterval(() => {
        pos++;
        enemy.style.top = `${pos}px`;
        if (pos > document.getElementById('space-battle').offsetHeight) {
            clearInterval(animation);
            enemy.remove();
            enemies = enemies.filter(e => e !== enemy);
            lives--;
            updateLives();
            if (lives <= 0) {
                endRapidFireMode();
            }
        }
    }, 50 / currentLevel);
}

function shootLaser() {
    const playerShip = document.getElementById('player-ship');
    const playerRect = playerShip.getBoundingClientRect();
    const battleRect = document.getElementById('space-battle').getBoundingClientRect();
    
    const targetEnemy = findClosestEnemy();
    if (targetEnemy) {
        const enemyRect = targetEnemy.getBoundingClientRect();
        
        const laser = document.createElement('div');
        laser.className = 'laser';
        
        const startX = playerRect.left + playerRect.width / 2 - battleRect.left;
        const startY = battleRect.bottom - playerRect.bottom;
        const endX = enemyRect.left + enemyRect.width / 2 - battleRect.left;
        const endY = battleRect.bottom - enemyRect.bottom;
        
        const angle = Math.atan2(endY - startY, endX - startX);
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        
        // Increase the length of the laser
        const laserLength = length * 1.5; // Adjust this multiplier to make it longer
        
        laser.style.width = `${laserLength}px`;
        laser.style.left = `${startX}px`;
        laser.style.bottom = `${startY}px`;
        laser.style.transform = `rotate(${angle}rad)`;
        
        document.getElementById('space-battle').appendChild(laser);
        
        setTimeout(() => {
            laser.remove();
            destroyEnemy(targetEnemy);
        }, 200);
    }
}

function findClosestEnemy() {
    if (enemies.length === 0) return null;
    return enemies.reduce((closest, enemy) => {
        const rect = enemy.getBoundingClientRect();
        const distance = rect.bottom;
        return closest ? (distance < closest.getBoundingClientRect().bottom ? enemy : closest) : enemy;
    }, null);
}

function destroyEnemy(enemy) {
    enemy.remove();
    enemies = enemies.filter(e => e !== enemy);
}

function endRapidFireMode() {
    isRapidFireMode = false;
    clearInterval(gameTimer);
    enemies.forEach(enemy => enemy.remove());
    enemies = [];
    document.getElementById('rapid-fire-area').style.display = 'none';
    updateHighScores();
    showScoreboard();
}

function updateHighScores() {
    if (!highScores.includes(rapidFireScore)) {
        highScores.push(rapidFireScore);
        highScores.sort((a, b) => b - a);
        highScores = highScores.slice(0, 5); // Keep only top 5 unique scores
    }
}

function showScoreboard() {
    let scoreboardHTML = `
        <h2>Rapid Fire Mode Ended!</h2>
        <p>Your score: ${rapidFireScore}</p>
        <h3>Top Scores:</h3>
        <ol>
    `;
    highScores.forEach(score => {
        scoreboardHTML += `<li>${score}</li>`;
    });
    scoreboardHTML += `
        </ol>
        <button id="closeButton">Close</button>
    `;
    
    const scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = scoreboardHTML;
    scoreboard.style.display = 'block';
    
    // Attach event listener for the Close button
    document.getElementById('closeButton').addEventListener('click', closeScoreboard);
}

function closeScoreboard() {
    document.getElementById('scoreboard').style.display = 'none';
    document.getElementById('normal-mode').style.display = 'block';
    document.getElementById('rapid-fire-mode').style.display = 'block';
    generateQuestion();
}

window.onload = function() {
    generateQuestion();
    document.getElementById('rapid-fire-mode').addEventListener('click', showTimerSelection);
    
    document.getElementById('answer').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });
    
    document.getElementById('rapid-fire-answer').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            checkRapidFireAnswer();
        }
    });

    // Initialize highScores if it's not already done
    if (!highScores || !Array.isArray(highScores)) {
        highScores = [];
    }
};