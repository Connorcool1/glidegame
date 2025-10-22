var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var interval = setInterval(updateGameArea, 20);
function clear() {
    ctx.clearRect(0, 0, c.width, c.height);
}
const maxVel = 20;
const gravity = 0.3;
var moveSpeed = 10;
var airSpeed = 0.05;
var decayX = 0.98;
var glideMomentum = 0;

let moveR = false;
let moveL = false;
let jump = false;
var jumpSpeed = -20;

// const input = document.querySelector("input");
// if (input)
//     input.addEventListener("keydown", logKey);

const keyLog = [];
function logKey(e) {
    console.log(e.type, e.code);
    keyLog.push({ type: e.type, code: e.code, time: Date.now() });

    if (keyLog.length > 1000) keyLog.shift();

    // Process player inputs 
    if (e.type === "keydown") {
        if (e.code === "KeyD") moveR = true;
        else if (e.code === "KeyA") moveL = true;
        else if (e.code === "KeyW") jump = true;

    } else if (e.type === "keyup") {
        if (e.code === "KeyD") moveR = false;
        else if (e.code === "KeyA") moveL = false;
        else if (e.code === "KeyW") jump = false;
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
    this.onGround = false;
    this.width = width;
    this.height = height;
    this.radius = height / 2;
    this.speedX = 0;
    this.speedY = 1;
    this.x = x;
    this.y = y;

    // Player updates
    this.update = function() {
        // Draw player
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    this.updatePos = function() {
        // Gravity
        if (this.speedY > maxVel) this.speedY = maxVel;
        else this.speedY += gravity - (glideMomentum);
        glideMomentum *= 0.8;

        // Player input movement
        if (moveR) {
            glideMomentum = (Math.abs(this.speedX) + this.speedY) * 0.07;
            // Change speed based on if on ground or in air
            if (onGround) this.speedX = moveSpeed; 
            else if (this.speedX < moveSpeed) this.speedX += airSpeed;
        }
        else if (moveL) {
            if (onGround) this.speedX = -moveSpeed;
            else if (this.speedX > -moveSpeed) this.speedX += -airSpeed;
        }
        // if no movement inputs
        else {
            glideMomentum = 0;
            if (Math.abs(this.speedX) > decayX) {
                this.speedX *= decayX;
            } else this.speedX = 0;
        }

        if (jump && onGround) {
            this.speedY = jumpSpeed;
            jump = false;
        }

        this.x += this.speedX;
        this.y += this.speedY;
        this.collision();
    }
    this.collision = function() {
        var bottom = c.height;
        if (this.y + this.height > bottom) {
            this.y = bottom - this.height
            this.speedX = 0;
            onGround = true;
        }
        else onGround = false;
    }
};

function updateGameArea() {
    clear();
    playerPiece.updatePos();
    playerPiece.update();
}

