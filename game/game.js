var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var interval = setInterval(updateGameArea, 20);
function clear() {
    ctx.clearRect(0, 0, c.width, c.height);
}

// const input = document.querySelector("input");
// if (input)
//     input.addEventListener("keydown", logKey);

const keyLog = [];
function logKey(e) {
    console.log(e.type, e.code);
    keyLog.push({ type: e.type, code: e.code, time: Date.now() });

    if (keyLog.length > 1000) keyLog.shift();

    if (e.type === "keydown") {
        if (e.code === "ArrowRight") {
            playerPiece.speedX = 1;
        } else if (e.code === "ArrowLeft") {
            playerPiece.speedX = -1;
        }
    } else if (e.type === "keyup") {
        if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
            playerPiece.speedX = 0;
        }
    }
}
window.addEventListener("keydown", logKey);
window.addEventListener("keyup", logKey);

var playerPiece;

function startGame() {
    console.log("Starting game");
    playerPiece = new Player(20, 20, 5, 5);
    interval;
}

function Player(x, y, width, height) {
    this.width = width;
    this.height = height;
    this.radius = height / 2;
    this.speedX = 0;
    this.speedY = 1;
    this.x = x;
    this.y = y;

    this.update = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    this.updatePos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.collision();
    }
    this.collision = function() {
        var bottom = c.height;
        if (this.y + this.height > bottom) {
            this.y = bottom - this.height
        }
    }
};

function updateGameArea() {
    clear();
    playerPiece.updatePos();
    playerPiece.update();
}

