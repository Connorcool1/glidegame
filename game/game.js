var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var interval = setInterval(updateGameArea, 20);
function clear() {
    ctx.clearRect(0, 0, c.width, c.height);
}
const maxVel = 20;
const gravity = 0.3;
var moveSpeed = 10;
var airSpeed = 5;
var decayX = 0.98;

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
    const turnRate = 0.06; //radians per frame
    this.onGround = false;
    this.width = width;
    this.height = height;
    this.radius = height / 2;
    this.speedX = 0;
    this.speedY = 0;
    this.speed = 0; //speed total
    this.angle = Math.PI / 2; //direction of movement
    this.x = x;
    this.y = y;

    this.setPolar = function(speedX, speedY) {
        this.speed = Math.hypot(this.speedX, this.speedY);
        this.angle = Math.atan2(this.speedY, this.speedX); 
    }

    this.getSpeedX = function() {
        this.speedX = this.speed * Math.cos(this.angle);
    }
    this.getSpeedY = function() {
        this.speedY = this.speed * Math.sin(this.angle);
    }

    // Player updates
    this.update = function() {
        // Draw player
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw direction line
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (10 * Math.cos(this.angle)), this.y + (10 * Math.sin(this.angle)));
        ctx.stroke();
    }
    this.updatePos = function() {
        this.getSpeedX();
        this.getSpeedY();
        // Gravity
        if (this.speedY > maxVel) this.speedY = maxVel;
        else this.speedY += gravity;

        this.setPolar(this.speedX, this.speedY);


        // Player input movement
        if (moveR) {
            if (!onGround) this.angle -= turnRate;
            this.getSpeedX();
            this.getSpeedY();
        }
        else if (moveL) {
            if (!onGround) this.angle += turnRate;
            this.getSpeedX();
            this.getSpeedY();
        }
        // if no movement inputs
        else {
            if (Math.abs(this.speedX) > decayX) {
                this.speedX *= decayX;
            } else this.speedX = 0;
        }

        if (jump && onGround) {
            this.speedY = jumpSpeed;
            jump = false;
        }
        this.setPolar(this.speedX, this.speedY);

        this.getSpeedY();
        this.getSpeedX();

        console.log("Total speed: " + this.speed + " SpeedX: " + this.speedX + " SpeedY: " + this.speedY + " Angle: " + this.angle);


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

