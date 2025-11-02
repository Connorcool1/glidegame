var c = document.getElementById("myCanvas");
// c.width = window.innerWidth;
// c.height = window.innerHeight;
c.width = 5000;
c.height = 3000;
var ctx = c.getContext("2d");
var interval = setInterval(updateGameArea, 20);
function clear() {
    ctx.fillStyle = "#070a1fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#ffffffff";
}
const maxVel = 20;
const gravity = 0.3;
var moveSpeed = 5;
var airSpeed = 5;
var decayX = 0.98;
let spawnPoint = { x: 150, y: 200 };
var respawnPoint = spawnPoint;

let moveR = false;
let moveL = false;
let jump = false;
var jumpSpeed = -9;

const jumpDelay = 200; //ms
var lastJumpTime = 0;

let startLevel = 1;
var currentLevel = startLevel;

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
        else if (e.code === "KeyR") playerPiece.reset();
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
    for (let i = startLevel; i > 0; i--) buildLevels[i]();
    playerPiece = new Player(spawnPoint.x, spawnPoint.y, 5, 5);
    interval;
}

function Block(x, y, width, height, type) {
    if (!type) type = "normal";
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    colour = "#ffffffff";

    if (this.type === "goal") {
        this.width = 20;
        this.height = 20;
    }   

    if (this.type === "death") {
        this.colour = "#2fd5ffff"; // cyan
    } else if (this.type === "bouncy") { // haven't used these yet
        this.colour = "#65997aff"; // green
    } else if (this.type === "goal") {
        this.colour = "#ffd700ff"; // gold
    } else {
        this.colour = "#ffffffff"; // white
    }

    this.update = function() {
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function buildLevel1() {
    //                    x,   y,   w,   h
    blocks.push(new Block(100, 300, 200, 20));
    blocks.push(new Block(1300, 300, 200, 20));
    blocks.push(new Block(800, 0, 20, 400));
    blocks.push(new Block(2100, 0, 20, 400));
    blocks.push(new Block(2400, 880, 20, 20, "goal"));
    blocks.push(new Block(2300, 900, 400, 20));
    respawnPoint = spawnPoint;
}

function buildLevel2() {

    blocks.push(new Block(1900, 600, 20, 500)); // long one
    blocks.push(new Block(1800, 1000, 100, 20));
    blocks.push(new Block(1880, 980, 20, 20, "goal"));
    respawnPoint = { x: 1400, y: 250 };
}

function buildLevel3() {
    blocks.push(new Block(200, 1500, 2000, 20, "death"));
    blocks.push(new Block(1900, 1100, 20, 1300)); // pole
    blocks.push(new Block(1820, 1580, 20, 20, "goal"));
    blocks.push(new Block(1800, 1600, 100, 20));

    blocks.push(new Block(300, 1520, 20, 300, "death"));
    blocks.push(new Block(500, 1520, 20, 250, "death"));
    blocks.push(new Block(700, 1520, 20, 200, "death"));
    blocks.push(new Block(900, 1520, 20, 150, "death"));
    blocks.push(new Block(1100, 1520, 20, 50, "death"));
    blocks.push(new Block(1300, 1520, 20, 30, "death"));
    blocks.push(new Block(1500, 1520, 20, 10, "death"));
    blocks.push(new Block(1300, 320, 20, 1050, "death"));

    respawnPoint = { x: 1810, y: 970 };
}


let buildLevels = {
    1: buildLevel1,
    2: buildLevel2,
    3: buildLevel3
}

function Player(x, y, width, height) {
    const turnRate = 0.06; //radians
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
    this.tail = new tail();

    this.reset = function() {
        this.x = respawnPoint.x;
        this.y = respawnPoint.y;
        this.updateSpeed(0);
        this.tail.clear();
    }
    // Speed and angle setters
    this.setPolar = function() {
        this.speed = Math.hypot(this.speedX, this.speedY);
        this.angle = Math.atan2(this.speedY, this.speedX); 
    }
    this.updateAngle = function(newAngle) {
        this.angle = newAngle;
        this.speedX = this.speed * Math.cos(newAngle);
        this.speedY = this.speed * Math.sin(newAngle);
    }
    this.updateSpeed = function(newSpeed) {
        this.speed = newSpeed;
        this.speedX = newSpeed * Math.cos(this.angle);
        this.speedY = newSpeed * Math.sin(this.angle);
    }
    this.updateSpeedX = function(newSpeedX) {
        this.speedX = newSpeedX;
        this.speed = Math.hypot(newSpeedX, this.speedY);
        this.angle = Math.atan2(this.speedY, newSpeedX);
    }
    this.updateSpeedY = function(newSpeedY) {
        this.speedY = newSpeedY;
        this.speed = Math.hypot(this.speedX, newSpeedY);
        this.angle = Math.atan2(newSpeedY, this.speedX);
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

        // Draw tail
        this.tail.draw();
    }
    this.updatePos = function() {
        // Gravity
        if (this.speedY > maxVel) this.updateSpeedY(maxVel);
        else this.updateSpeedY(this.speedY += gravity);

        const inputLock = performance.now() < lastJumpTime;

        // Player input movement
        if (moveR && !inputLock) {
            if (!onGround) this.updateAngle(this.angle += turnRate);
            else this.updateSpeedX(this.speedX + moveSpeed);
        }
        else if (moveL && !inputLock) {
            if (!onGround) this.updateAngle(this.angle -= turnRate);
            else this.updateSpeedX(this.speedX - moveSpeed);
        }
        // if no movement inputs, slow down
        else {
            if (Math.abs(this.speedX) > decayX) {
                this.updateSpeedX(this.speedX *= decayX);
            } else this.updateSpeedX(0); // stops jiggle at low speed
        }

        // Jumping
        if (jump && onGround) {
            this.updateSpeedY(jumpSpeed);
            jump = false;
            lastJumpTime = performance.now() + jumpDelay;
        }

        console.log("Total speed: " + this.speed + " SpeedX: " + this.speedX + " SpeedY: " + this.speedY + " Angle: " + this.angle);


        this.x += this.speedX;
        this.y += this.speedY;
        this.collision();

        this.tail.update(this.x, this.y);
    }



    this.collision = function() {
        // Floor collision
        var bottom = c.height;
        if (this.y + this.height > bottom) {
            // if u dont want to die on the floor vv
                // this.y = bottom - this.height
                // this.speedX = 0;

                // this.speedY = 0;
                // onGround = true;
            this.reset(); // death on floor
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

        // Block collision
        for (let i = blocks.length - 1; i >= 0; i--) {
            const block = blocks[i];
            // AABB collision detection
            if (this.x + this.width > block.x &&
                this.x - this.width < block.x + block.width &&
                this.y + this.height > block.y &&
                this.y - this.height < block.y + block.height) {
                if (block.type === "normal") {
                    this.blockCollision(block);
                } else if (block.type === "goal") {
                    // Level advance
                    currentLevel += 1;
                    blocks.splice(i, 1); //remove goal block
                    buildLevels[currentLevel]();
                } else if (block.type === "death") {
                    this.reset();
                }
            }
        };
        this.setPolar(); // Updates values after collisions, 
        // haven't used update functions here bcs I wrote this part before they existed thank you
    }   

    // Player doesn't go through blocks, yippee
    this.blockCollision = function(block) {
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

};

function tail() {
    let length = 20;
    let list = new LinkedList();
    this.addSection = function(x, y) {
        const section = new tailSection(x, y);
        list.appendHead(section);
    }

    this.update = function(x, y) {
        this.addSection(x, y);
        if (list.size() > length) {
            list.deleteLast();
        }
    }

    this.draw = function() {
        let current = list.getFirst();

        let i = 0;
        while (current && current.next) {
            ctx.beginPath();
            ctx.moveTo(current.data.x, current.data.y);
            ctx.lineTo(current.next.data.x, current.next.data.y);
            ctx.strokeStyle = `rgba(${i*12}, 0, 255, 1)`;
            ctx.stroke();
            current = current.next;
            i++;
            if (i > length) { console.log("Scream") }
        }
    }

    this.clear = function() {
        list.clear();
    }
}

function tailSection(x, y) {
    this.x = x;
    this.y = y;
}

function centerCamera() {
    let xt = 0;
    let yt = 0;
    // x axis
    if (playerPiece.x > window.innerWidth / 2) {
        xt = -playerPiece.x + (window.innerWidth / 2);
    }
    if (playerPiece.x > c.width - (window.innerWidth / 2)) {
        xt = -c.width + window.innerWidth;
    }

    // y axis
    if (playerPiece.y > window.innerHeight / 2) {
        ctx.translate(0, -playerPiece.y + (window.innerHeight / 2));
    }

    ctx.translate(xt, yt);
}
function updateGameArea() {
    clear();
    ctx.save();

    // Upate
    playerPiece.updatePos();
    centerCamera();
    console.log("Player position: " + playerPiece.x + ", " + playerPiece.y);

    // Draw
    blocks.forEach(block => {
        block.update();
    });
    playerPiece.update();
    ctx.restore();
}

function LinkedList(head = null) {
    this.head = head;

    this.size = function() {
        let count = 0;
        let node = this.head;
        while (node) {
            count++;
            node = node.next;
        }
        return count;
    }
    this.getLast = function() {
        let lastNode = this.head;
        if (lastNode) {
            while (lastNode.next) {
                lastNode = lastNode.next;
            }
        }
        return lastNode;
    }
    this.getFirst = function() {
        return this.head;
    }
    this.clear = function() {
        this.head = null;
    }
    this.deleteLast = function() {
        if (!this.head) return;
        if (!this.head.next) {
            this.head = null;
            return;
        }
        let node = this.head;
        while (node.next.next) {
            node = node.next;
        }
        node.next = null;
    }
    this.appendHead = function(data) {
        const node = new Node(data);
        node.next = this.head;
        this.head = node;
    }
    // add append tail if needed
}

function Node(data) {
    this.data = data;
    this.next = null;
}