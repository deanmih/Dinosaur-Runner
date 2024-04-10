const CANVAS_ID = 'canvas';
const SCORE_BOX_ID = 'scoreBox2';
const START_GAME_BTN_ID = 'startGameBtn';
const ARROW_DOWN_KEY = 'ArrowDown';
const SPACE_KEY = ' ';

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT_INITIAL = 100;
const PLAYER_HEIGHT_CROUCH = 50;
const PLAYER_START_X = 100;
const PLAYER_START_Y = 350;
const GROUND_HEIGHT = 50;
const GROUND_Y = 450;
const BACKGROUND_PARTICLE_SIZE = 4;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 50;
const OBSTACLE_INITIAL_Y = 400;
const OBSTACLE_CROUCH_Y = 340;
const SCORE_INCREMENT = 10;
const BACKGROUND_PARTICLE_DEFAULT_SPEED = 5;
const OBSTACLE_DEFAULT_SPEED = 5;
const SPEED_INCREMENT = 2;
const DELAY_FACTOR_BACKGROUND_PARTICLES = 50;
const DELAY_FACTOR_OBSTACLES = 200;

let canvas = document.querySelector(`#${CANVAS_ID}`);
let ctx = canvas.getContext('2d');
let score = 0;
let scoreBox2 = document.getElementById(SCORE_BOX_ID);
let gameIsRunning = true;
let speedIncreasedForCurrentScore = false;
let canvasWidth = 1500;
let canvasHeight = 500;
let playerXcoord = PLAYER_START_X;
let playerYcoord = PLAYER_START_Y;
let playerHeight = PLAYER_HEIGHT_INITIAL;
let backgroundParticleSpeed = BACKGROUND_PARTICLE_DEFAULT_SPEED;
let obstacleSpeed = OBSTACLE_DEFAULT_SPEED;

function generatePlayer() {
    document.getElementById(START_GAME_BTN_ID).innerHTML = "running";
    document.getElementById(START_GAME_BTN_ID).disabled = true;
    drawPlayer();
    setInterval(updateCanvas, 16);
}

function drawPlayer() {
    ctx.fillStyle = "black";
    ctx.fillRect(playerXcoord, playerYcoord, PLAYER_WIDTH, playerHeight);
}

function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, GROUND_Y, canvasWidth, GROUND_HEIGHT);
}

function updateCanvas() {
    if (!gameIsRunning) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    checkCollision();
    drawPlayer();
    drawGround();
    delayBackgroundParticlesGeneration();
    drawBackgroundParticles();
    delayObstacleGeneration();
    drawObstacles();
    increaseSpeed();
}

addEventListener("keydown", function(e) {
    if (e.key == ARROW_DOWN_KEY) playerHeight = PLAYER_HEIGHT_CROUCH, playerYcoord = 400;
});

addEventListener("keyup", function(e) {
    if (e.key == SPACE_KEY) playerYcoordUpdate();    
    if (e.key == ARROW_DOWN_KEY) playerYcoord = PLAYER_START_Y, playerHeight = PLAYER_HEIGHT_INITIAL;
});

function playerYcoordUpdate() {
    playerYcoord = 290;
    setTimeout(resetPlayerYcoord, 500);
}

function resetPlayerYcoord() {
    playerYcoord = 350;
}

let backgroundParticles = [];

function delayBackgroundParticlesGeneration() {
    let rnd = Math.floor(Math.random() * 1000);
    if (rnd % DELAY_FACTOR_BACKGROUND_PARTICLES == 0) {
        backgroundParticlesStartCoordinates();
        drawBackgroundParticles();
    }
}

function backgroundParticlesStartCoordinates() {
    for (let i = 0; i < 5; ++i) {
        let particleX = Math.floor(Math.random() * canvasWidth);
        let particleY = Math.floor(Math.random() * (GROUND_Y - BACKGROUND_PARTICLE_SIZE));
        let particleData = [particleX, particleY, backgroundParticleSpeed];
        backgroundParticles.push(particleData);
    }
}

function drawBackgroundParticles() {
    for (let i = 0; i < backgroundParticles.length; ++i) {
        if (backgroundParticles[i][0] < 0) {
            backgroundParticles.splice(i, 1);
        } else {
            backgroundParticles[i][0] -= backgroundParticles[i][2];
            ctx.fillStyle = 'black';
            ctx.fillRect(backgroundParticles[i][0], backgroundParticles[i][1], BACKGROUND_PARTICLE_SIZE, BACKGROUND_PARTICLE_SIZE);
        }
    }
}

let obstacles = [];

function delayObstacleGeneration() {
    let rnd = Math.floor(Math.random() * 1000);
    if (rnd % DELAY_FACTOR_OBSTACLES == 0) {
        obstaclesStartCoordinates();
        drawObstacles();
    }
}

function obstaclesStartCoordinates() {
    let up = Math.floor(Math.random() * 1000);
    let obstacleX = Math.floor(Math.random() * 3000) + canvasWidth;
    let obstacleY = OBSTACLE_INITIAL_Y;
    if (up % 2 == 0) {
        obstacleY = OBSTACLE_CROUCH_Y;
    }
    let obstacleData = [obstacleX, obstacleY, obstacleSpeed];
    obstacles.push(obstacleData);
}

function drawObstacles() {
    for (let i = 0; i < obstacles.length; ++i) {
        if (obstacles[i][0] < 0) {
            obstacles.splice(i, 1);
            score += SCORE_INCREMENT;
            scoreBox2.innerHTML = score;
        } else {
            obstacles[i][0] -= obstacles[i][2];
            ctx.fillStyle = 'black';
            ctx.fillRect(obstacles[i][0], obstacles[i][1], OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
        }
    }
}

function checkCollision() {
    for (let i = 0; i < obstacles.length; ++i) {
        let obstacleX = obstacles[i][0];
        let obstacleY = obstacles[i][1];
        let obstacleWidth = OBSTACLE_WIDTH;
        let obstacleHeight = OBSTACLE_HEIGHT;
        let playerWidth = PLAYER_WIDTH;
        let playerHeight = playerYcoord === 290 ? PLAYER_HEIGHT_CROUCH : PLAYER_HEIGHT_INITIAL;
        let playerX = playerXcoord;
        let playerY = playerYcoord;
        if (
            playerX < obstacleX + obstacleWidth &&
            playerX + playerWidth > obstacleX &&
            playerY < obstacleY + obstacleHeight &&
            playerY + playerHeight > obstacleY
        ) {
            handlePlayerCollision();
        }
    }
}

function increaseSpeed() {
    if (score % 100 === 0 && score !== 0 && !speedIncreasedForCurrentScore) {
        backgroundParticleSpeed += SPEED_INCREMENT;
        obstacleSpeed += SPEED_INCREMENT;
        speedIncreasedForCurrentScore = true;
    } else if (score % 100 !== 0) {
        speedIncreasedForCurrentScore = false;
    }
}

function handlePlayerCollision() {
    gameIsRunning = false;
    let refreshBtn = document.createElement("button");
    refreshBtn.addEventListener('click', refreshGame);
    refreshBtn.className = "refreshBtn";
    refreshBtn.innerHTML = "refresh game";
    document.getElementById("buttonContainer").appendChild(refreshBtn);
    document.getElementById(START_GAME_BTN_ID).innerHTML = "game ended";
}

function refreshGame() {
    location.reload();
}
