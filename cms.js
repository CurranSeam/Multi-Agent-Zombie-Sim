/*
    Curran Seam & Sharanjit Singh
    TCSS 435 AI
    Zombies
*/

// find and replace CMS with your initials (i.e. ABC)
// change this.name = "Your Chosen Name"

// only change code in selectAction function()

function CMS(game) {
    this.player = 1;
    this.radius = 10;
    this.rocks = 0;
    this.kills = 0;
    this.name = "Seam Machine";
    this.color = "White";
    this.cooldown = 0;
    this.direction = { x: randomInt(1600) - 800, y: randomInt(1600) - 800 };
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };
};

CMS.prototype = new Entity();
CMS.prototype.constructor = CMS;

// alter the code in this function to create your agent
// you may check the state but do not change the state of these variables:
//    this.rocks
//    this.cooldown
//    this.x
//    this.y
//    this.velocity
//    this.game and any of its properties

// you may access a list of zombies from this.game.zombies
// you may access a list of rocks from this.game.rocks
// you may access a list of players from this.game.players

CMS.prototype.selectAction = function() {

    var action = { direction: { x: this.direction.x, y: this.direction.y }, throwRock: false, target: null };
    var myClosest = { dist: 1000, zombie: null };
    var closestRock = { dist: 1000, rock: null };
    var theirClosest = 1000;
    var mostClosest = { dist: 1000, player: null };
    var target = { x: null, y: null };
    var rockSpeed = this.game.rocks[0].maxSpeed;
    var rockDirection = { x: 0, y: 0 };
    var acceleration = 1000000;

    for (var i = 0; i < this.game.zombies.length; i++) {
        var ent = this.game.zombies[i];
        var dist = distance(ent, this);
        if (dist < myClosest.dist) {
            myClosest.dist = dist;
            myClosest.zombie = ent;
            var timeToTarget = dist / rockSpeed;

            if (myClosest.dist > 75) {
                dist = myClosest.dist / ent.maxSpeed * maxSpeed;
            }
            if (dist < myClosest.dist || myClosest.dist < 40) {
                myClosest.dist = dist;
                myClosest.zombie = ent;
            }
            target.x = myClosest.zombie.x + myClosest.zombie.velocity.x * timeToTarget;
            target.y = myClosest.zombie.y + myClosest.zombie.velocity.y * timeToTarget;
        }
    }

    for (var i = 0; i < this.game.players.length; i++) {
        for (var j = 0; j < this.game.zombies.length; j++) {
            var player = this.game.players[i];
            var zombie = this.game.zombies[j];
            var dist = distance(zombie, player);
            if (dist < theirClosest) {
                theirClosest = dist;
            }
            if (theirClosest < mostClosest.dist) {
                mostClosest.dist = theirClosest;
                mostClosest.player = player;
            }
        }
    }

    if (mostClosest < myClosest) {
        var dist = distance(mostClosest.player, this);
        var timeToTarget = dist / rockSpeed;
        target.x = mostClosest.player.x + mostClosest.player.velocity.x * timeToTarget;
        target.y = mostClosest.player.y + mostClosest.player.velocity.y * timeToTarget;
    }

    if (target.x !== null && target.y !== null) {
        action.target = target;
        action.throwRock = true;
    }

    var rocksPerPlayer = this.game.rocks.length / this.game.players.length

    // if (this.rocks < rocksPerPlayer) {
    for (var i = 0; i < this.game.rocks.length; i++) {
        var rock = this.game.rocks[i];
        dist = distance(this, rock);
        if (dist < closestRock.dist) {
            if (myClosest.zombie !== null) {
                if (!rock.collide({ x: myClosest.zombie.x, y: myClosest.zombie.y, radius: 25 })) {
                    closestRock.dist = dist;
                    closestRock.rock = rock;
                }
            } else {
                closestRock.dist = dist;
                closestRock.rock = rock;
            }
        }
    }
    direct = direction(closestRock.rock, this);
    var dist = distance(this, closestRock.rock);
    var difX = (closestRock.rock.x - this.x) / dist;
    var difY = (closestRock.rock.y - this.y) / dist
    rockDirection.x += difX * acceleration / (dist * dist);
    rockDirection.y += difY * acceleration / (dist * dist);
    action.direction.x = rockDirection.x;
    action.direction.y = rockDirection.y;

    if (myClosest.zombie !== null) {
        if (this.collide({ x: myClosest.zombie.x, y: myClosest.zombie.y, radius: 45 })) {

            var difX = (myClosest.zombie.x - this.x) / myClosest.dist;
            var difY = (myClosest.zombie.y - this.y) / myClosest.dist;

            action.direction.x -= (difX) * acceleration / (myClosest.dist * myClosest.dist);
            action.direction.y -= (difY) * acceleration / (myClosest.dist * myClosest.dist);
        }
    }
    return action;
};

// do not change code beyond this point

CMS.prototype.collide = function(other) {
    return distance(this, other) < this.radius + other.radius;
};

CMS.prototype.collideLeft = function() {
    return (this.x - this.radius) < 0;
};

CMS.prototype.collideRight = function() {
    return (this.x + this.radius) > 800;
};

CMS.prototype.collideTop = function() {
    return (this.y - this.radius) < 0;
};

CMS.prototype.collideBottom = function() {
    return (this.y + this.radius) > 800;
};

CMS.prototype.update = function() {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;
    this.action = this.selectAction();
    //if (this.cooldown > 0) console.log(this.action);
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name !== "Zombie" && ent.name !== "Rock") {
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name === "Rock" && this.rocks < 2) {
                this.rocks++;
                ent.removeFromWorld = true;
            }
        }
    }


    if (this.cooldown === 0 && this.action.throwRock && this.rocks > 0) {
        this.cooldown = 1;
        this.rocks--;
        var target = this.action.target;
        var dir = direction(target, this);

        var rock = new Rock(this.game);
        rock.x = this.x + dir.x * (this.radius + rock.radius + 20);
        rock.y = this.y + dir.y * (this.radius + rock.radius + 20);
        rock.velocity.x = dir.x * rock.maxSpeed;
        rock.velocity.y = dir.y * rock.maxSpeed;
        rock.thrown = true;
        rock.thrower = this;
        this.game.addEntity(rock);
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

CMS.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};