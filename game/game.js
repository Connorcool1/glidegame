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
const blocks = [];

function startGame() {
    console.log("Starting game");
    buildLevel();
    playerPiece = new Player(20, 20, 5, 5);
    interval;
}

function Block(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.update = function() {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function buildLevel() {
    blocks.push(new Block(100, 700, 200, 50));
    blocks.push(new Block(400, 600, 200, 50));
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
        this.setPolar(this.speedX, this.speedY);
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
        // Floor collision
        var bottom = c.height;
        if (this.y + this.height > bottom) {
            this.y = bottom - this.height
            this.speedX = 0;

            this.speedY = 0;
            onGround = true;
        }
        else onGround = false;

        // Wall collision
        var right = c.width;
        if (this.x + this.width > right) {
            this.x = right - this.width;
            this.speedX = 0;
        }
        var left = 0;
        if (this.x - this.width < left) {
            this.x = left + this.width;
            this.speedX = 0;
        }

        var top = 0;
        if (this.y - this.height < top) {
            this.y = top + this.height;
            this.speedY = -this.speedY / 2; //bounce down
        }

        //Block collision

        blocks.forEach(block => {
            //AABB collision detection
            if (this.x + this.width > block.x &&
                this.x - this.width < block.x + block.width &&
                this.y + this.height > block.y &&
                this.y - this.height < block.y + block.height) {
                    // Top of block
                    if (this.y + this.height - this.speedY <= block.y) {
                        this.y = block.y - this.height;
                        this.speedY = 0;
                        this.speedX = 0;
                        onGround = true;
                    }
                    //  Bottom of block
                    if (this.y - this.speedY >= block.y + block.height) {
                        this.y = block.y + block.height + this.height;
                        this.speedY = 0;
                    }
                    // Left of block
                    if (this.x + this.width - this.speedX <= block.x) {
                        this.x = block.x - this.width;
                        this.speedX = 0;
                    }
                    // Right of block
                    if (this.x - this.speedX >= block.x + block.width) {
                        this.x = block.x + block.width + this.width;
                        this.speedX = 0;
                    }
                    else {
                        this.x -= this.speedX;
                        this.y -= this.speedY;
                    }
                }
        });
    }   
};

                    // this.y = block.y - this.height;
                    // this.speedY = 0;
                    // this.speedX = 0;
                    // onGround = true;

function updateGameArea() {
    clear();
    blocks.forEach(block => {
        block.update();
    });
    playerPiece.updatePos();
    playerPiece.update();
}

