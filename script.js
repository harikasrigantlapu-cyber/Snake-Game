const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");

eatSound.preload = "auto";
gameOverSound.preload = "auto";
eatSound.volume = 1;
gameOverSound.volume = 1;

const box = 20;

let score = 0;
let isPaused = false;
let speed = 150;

let snake = [{ x: 200, y: 200 }];

let food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
};

let direction = "RIGHT";

document.addEventListener("keydown", changeDirection);
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") isPaused = !isPaused;
});

function changeDirection(e) {
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

/* 🔊 Unlock audio on first user interaction (click or key) */
let audioUnlocked = false;
function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    eatSound.muted = true;
    gameOverSound.muted = true;

    eatSound.play().then(() => {
        eatSound.pause();
        eatSound.currentTime = 0;
        eatSound.muted = false;
    }).catch(()=>{});

    gameOverSound.play().then(() => {
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
        gameOverSound.muted = false;
    }).catch(()=>{});
}

document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("keydown", unlockAudio, { once: true });

function playSound(sound) {
    sound.pause();
    sound.currentTime = 0;
    const p = sound.play();
    if (p && typeof p.catch === "function") p.catch(()=>{});
}

function draw() {
    if (isPaused) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 400, 400);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "lime" : "green";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText("Score: " + score, 10, 20);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        score++;
        playSound(eatSound);

        food = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };

        if (score % 5 === 0 && speed > 50) {
            clearInterval(game);
            speed -= 10;
            game = setInterval(draw, speed);
        }
    } else {
        snake.pop();
    }

    const newHead = { x: snakeX, y: snakeY };

    if (
        snakeX < 0 || snakeY < 0 ||
        snakeX >= 400 || snakeY >= 400 ||
        collision(newHead, snake)
    ) {
        playSound(gameOverSound);
        clearInterval(game);
        alert("Game Over 😢\nScore: " + score);
    }

    snake.unshift(newHead);
}

function collision(head, body) {
    return body.some(seg => seg.x === head.x && seg.y === head.y);
}

let game = setInterval(draw, speed);