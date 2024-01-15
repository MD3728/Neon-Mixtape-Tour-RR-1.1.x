/* Plant Class File */

class Plant extends Entity {
  constructor(type, x, y, cost, damage, health, eatable, reload, projectile, splashDamage, tier, changed = false, endangered = false) {
    super(type, x, y);//Call Entities
    this.name = plantStat[type - 1].name;
    //Position
    this.lane = Math.floor((y - 30) / 100);
    //Timers
    this.animationTimer = 0;
    this.reloadTimer = 0;
    this.shakeTimer = 0;//Eating Animation
    this.stunTimer = 0;//Stun From Stunner and Dazey Zombie
    //Determine default reload time
    if ((eatable === false) || (this.type === 4) || (this.type === 9)) {//Instant Use OR Potato Mine OR Primal Potato Mine
      this.reload = reload;
    } else if (this.type === 11) {//Spring bean instant reload
      this.reload = 0;
    } else {//Regular Plant
      this.reload = reload / 4;
    }
    //Stats
    this.sunCost = cost;
    this.refund = Math.floor(cost / 20) * 5;//25% Shovel Refund
    this.health = health;
    this.maxHealth = health;
    this.damage = damage;
    this.splashDamage = splashDamage;
    this.maxReload = reload + Math.floor(Math.random() * 7) - 3;//Slightly Randomized Reload Time
    this.projectileType = projectile;//Types Found In Projectile Class
    this.eatable = eatable;//Determines if plant can be eaten/detected
    this.endangered = endangered;
    this.changed = changed;//Prevent Plant from changing multiple times from changer zombie
    this.tier = tier;//Keep track of tier, can be passed on to projectile
    this.firedAtLeastOnce = false
    //I Zombie
    try {
      if (currentLevel.type.includes(14)) {
        this.reload = 0;
      }
    } catch (e) {

    }
    this.graphical = { previousAttackAnim: 0 };
    this.size = 1.2;//Size of plant
    allPlants.push(this);
  }

  // Seed Packet Draw (Layering system not fully implemented)
  layeredDraw(layer) {
    layer.noStroke();
    layer.fill(0, 0, 0, 50);
    layer.translate(this.x, this.y);
    if (this.endangered === true) {
      layer.fill(255, 255, 50);
      layer.triangle(0, 0, 10, 0, 0, 10);
      layer.quad(20, 0, 30, 0, 0, 30, 0, 20);
      layer.quad(40, 0, 50, 0, 0, 50, 0, 40);
      layer.quad(60, 0, 60, 10, 0, 70, 0, 60);
      layer.quad(0, 80, 10, 80, 60, 30, 60, 20);
      layer.quad(20, 80, 30, 80, 60, 50, 60, 40);
      layer.quad(40, 80, 50, 80, 60, 70, 60, 60);
      layer.fill(0);
      layer.quad(10, 0, 20, 0, 0, 20, 0, 10);
      layer.quad(30, 0, 40, 0, 0, 40, 0, 30);
      layer.quad(50, 0, 60, 0, 0, 60, 0, 50);
      layer.quad(60, 10, 60, 20, 0, 80, 0, 70);
      layer.quad(10, 80, 20, 80, 60, 40, 60, 30);
      layer.quad(30, 80, 40, 80, 60, 60, 60, 50);
      layer.triangle(50, 80, 60, 80, 60, 70);
    }
    layer.translate(30, 70);
    layer.scale(this.size);
    if (this.shakeTimer > 0) {
      layer.translate(sin(this.shakeTimer * 24) * 3, cos(this.shakeTimer * 24) * 3 / 2)
    }
    layer.noStroke();
    switch (this.type) {
      case 1://Sunflower
        layer.fill(120, 180, 85);
        layer.rect(-3, -20, 6, 18);
        layer.fill(130, 190, 95);
        layer.ellipse(-8, -2, 11, 7);
        layer.ellipse(8, -2, 11, 7);
        layer.ellipse(0, 1, 11, 7);
        layer.translate(0, -36);
        layer.fill(255, 245, 115);
        for (let a = 0; a < 15; a++) {
          layer.rotate(24);
          layer.arc(14, 0, 12, 7, -90, 90);
        }
        layer.translate(0, 36);
        layer.fill(230.25, 165, 65);
        layer.ellipse(0, -36, 30, 30);
        layer.fill(0);
        layer.ellipse(-6, -39, 5, 5);
        layer.ellipse(6, -39, 5, 5);
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.arc(0, -33, 14, 8, 30, 150)
        break;
      case 2://Twin Sunflower
        layer.fill(120, 180, 85)
        layer.quad(-3, -2, 2, -2, -10, -24, -15, -24)
        layer.quad(3, -2, -2, -2, 10, -24, 15, -24)
        layer.fill(130, 190, 95)
        layer.ellipse(-8, -2, 11, 7)
        layer.ellipse(8, -2, 11, 7)
        layer.ellipse(0, 1, 11, 7)
        layer.translate(-18, -36)
        layer.fill(255, 245, 115)
        for (let a = 0; a < 15; a++) {
          layer.rotate(24)
          layer.arc(12, 0, 10, 6, -90, 90)
        }
        layer.translate(36, 0)
        layer.fill(255, 245, 115)
        for (let a = 0; a < 15; a++) {
          layer.rotate(24)
          layer.arc(12, 0, 10, 6, -90, 90)
        }
        layer.translate(-18, 36)
        layer.fill(230.25, 165, 65)
        layer.ellipse(-18, -36, 25, 25)
        layer.ellipse(18, -36, 25, 25)
        layer.fill(0)
        layer.ellipse(-23, -38, 4, 4)
        layer.ellipse(-13, -38, 4, 4)
        layer.ellipse(23, -38, 4, 4)
        layer.ellipse(13, -38, 4, 4)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.25)
        layer.arc(18, -34, 12, 7, 30, 150)
        layer.arc(-18, -34, 12, 7, 30, 150)
        break
      case 3://Solar Tomato
        layer.fill(75, 225, 75)
        layer.rect(-2, -58, 4, 4)
        layer.fill(255, 255, 150)
        layer.ellipse(0, -30, 50, 50)
        layer.fill(0)
        layer.ellipse(5, -32, 6, 6)
        layer.ellipse(15, -32, 6, 6)
        layer.fill(255, 255, 180)
        layer.ellipse(-10, -30, 20, 30)
        layer.fill(220)
        layer.rect(6, -24, 3, 4)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.line(16, -24, 4, -24)
        break
      case 4://Potato Mine
        layer.fill(160)
        layer.rect(-1.5, -34, 3, 12)
        layer.fill(255, 0, 0)
        layer.ellipse(0, -36, 6, 6)
        layer.fill(220, 200, 100)
        layer.arc(0, -10, 30, 36, -180, 0)
        layer.fill(120, 70, 20)
        layer.ellipse(-13.5, -10, 10)
        layer.ellipse(-4.5, -10, 10)
        layer.ellipse(4.5, -10, 10)
        layer.ellipse(13.5, -10, 10)
        layer.fill(0)
        layer.ellipse(-6, -22, 5, 5)
        layer.ellipse(6, -22, 5, 5)
        layer.fill(220)
        layer.rect(-4, -17, 2, 3)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.line(-6, -17, 6, -17)
        break
      case 5://Squash
        layer.fill(100, 150, 100)
        layer.rect(-2, -63, 4, 4)
        layer.fill(100, 200, 100)
        layer.arc(0, -20, 50, 40, 0, 180)
        layer.quad(25, -20, -25, -20, -15, -50, 15, -50)
        layer.arc(0, -50, 30, 20, -180, 0)
        layer.fill(0)
        layer.ellipse(0, -25, 6, 6)
        layer.ellipse(15, -25, 6, 6)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.line(3, -20, 12, -20)
        layer.line(-3, -29, 3, -27)
        layer.line(18, -29, 12, -27)
        break
      case 6://Celery Stalker
        layer.fill(100, 255, 100)
        layer.quad(-10, -10, 0, -10, -10, -50, -20, -50)
        layer.quad(10, -10, 0, -10, 10, -50, 20, -50)
        layer.rect(-22, -30, 12, 8)
        layer.rect(10, -30, 12, 8)
        layer.fill(0)
        layer.ellipse(-15, -40, 3, 3)
        layer.ellipse(-11, -40, 3, 3)
        layer.ellipse(15, -40, 3, 3)
        layer.ellipse(11, -40, 3, 3)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1)
        layer.line(-16, -43, -14, -42)
        layer.line(-12, -42, -10, -43)
        layer.line(-15, -37, -11, -37)
        layer.line(16, -43, 14, -42)
        layer.line(12, -42, 10, -43)
        layer.line(15, -37, 11, -37)
        break
      case 7://Cherry Bomb
        layer.stroke(25, 175, 25);
        layer.strokeWeight(6);
        layer.line(-20, -40, 0, -55);
        layer.line(20, -40, 0, -55);
        layer.noStroke();
        layer.fill(225, 25, 25);
        layer.ellipse(-20, -30, 30, 30);
        layer.ellipse(20, -30, 30, 30);
        layer.fill(0);
        layer.ellipse(-28, -28, 6, 6);
        layer.ellipse(-18, -28, 6, 6);
        layer.ellipse(18, -28, 6, 6);
        layer.ellipse(28, -28, 6, 6);
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.line(-31, -32, -25, -30)
        layer.line(-15, -32, -21, -30)
        layer.arc(-23, -20, 12, 6, -160, -20)
        layer.line(31, -32, 25, -30)
        layer.line(15, -32, 21, -30)
        layer.arc(23, -20, 12, 6, -160, -20)
        break
      case 8://Melon Grenade
        layer.fill(150, 255, 255)
        layer.ellipse(0, -30, 50, 50)
        layer.stroke(0, 100, 100)
        layer.strokeWeight(1)
        layer.ellipse(0, -30, 30, 48)
        layer.ellipse(0, -30, 10, 48)
        layer.noStroke()
        layer.fill(0)
        layer.ellipse(10, -30, 6, 6)
        layer.ellipse(20, -30, 6, 6)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.arc(15, -22, 12, 4, -165, -15)
        break
      case 9://Primal Potato Mine
        layer.fill(255)
        layer.triangle(4, -26, -4, -26, 0, -36)
        layer.fill(220, 200, 100)
        layer.quad(-16, -10, 16, -10, 12, -26, -12, -26)
        layer.fill(120, 70, 20)
        layer.ellipse(-13.5, -10, 10)
        layer.ellipse(-4.5, -10, 10)
        layer.ellipse(4.5, -10, 10)
        layer.ellipse(13.5, -10, 10)
        layer.fill(0)
        layer.ellipse(-6, -22, 5, 5)
        layer.ellipse(6, -22, 5, 5)
        layer.fill(220)
        layer.rect(-4, -17, 2, 3)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.line(-6, -17, 6, -17)
        break
      case 10://Dazey
        layer.fill(120, 180, 85)
        layer.rect(-3, -20, 6, 18)
        layer.fill(130, 190, 95)
        layer.ellipse(-8, -2, 11, 7)
        layer.ellipse(8, -2, 11, 7)
        layer.ellipse(0, 1, 11, 7)
        layer.translate(0, -36)
        layer.fill(255, 75, 75)
        for (let a = 0; a < 15; a++) {
          layer.rotate(24)
          layer.arc(14, 0, 12, 7, -90, 90)
        }
        layer.translate(0, 36)
        layer.fill(255, 125, 125)
        layer.ellipse(0, -36, 30, 30)
        layer.fill(0)
        layer.ellipse(-6, -39, 5, 5)
        layer.ellipse(6, -39, 5, 5)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.ellipse(0, -30, 10, 4)
        break
      case 11://Spring Bean
        layer.translate(0, -10)
        layer.noFill()
        layer.stroke(175, 225, 125)
        layer.strokeWeight(2)
        layer.arc(0, -4, 10, 8, 90, 270)
        layer.arc(0, -2, 10, 4, -90, 90)
        layer.arc(0, 0, 10, 8, 90, 270)
        layer.arc(0, 2, 10, 4, -90, 90)
        layer.arc(0, 4, 10, 8, 90, 270)
        layer.noStroke()
        layer.fill(175, 225, 125)
        layer.rect(-10, -35, 20, 20)
        layer.arc(0, -35, 20, 20, -180, 0)
        layer.arc(0, -15, 20, 20, 0, 180)
        layer.fill(0)
        if (this.reload > 0) {
          layer.rect(-5, -24, 4, 1)
          layer.rect(4, -24, 4, 1)
        } else {
          layer.ellipse(-3, -23, 4, 4)
          layer.ellipse(6, -23, 4, 4)
        }
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.arc(1.5, -16, 6, 3, -150, -30)
        break
      case 12://Wall-nut
        layer.fill(120, 60, 15)
        if (this.health > this.maxHealth * 2 / 3) {
          layer.ellipse(0, -30, 40, 54)
        } else if (this.health > this.maxHealth / 3) {
          layer.arc(0, -30, 40, 54, -60, 285)
        } else {
          layer.arc(0, -30, 40, 54, -115, -75)
          layer.arc(0, -30, 40, 54, -60, 230)
        }
        layer.fill(0)
        layer.ellipse(6, -36, 6, 6)
        layer.ellipse(-6, -36, 6, 6)
        layer.noFill()
        layer.stroke(0)
        layer.strokeWeight(2)
        if (this.health > this.maxHealth / 2) {
          layer.arc(0, -20, 20, -6 + 12 * this.health / this.maxHealth, 0, 180)
        } else if (this.health == this.maxHealth / 2) {
          layer.line(-10, -20, 10, -20)
        } else {
          layer.arc(0, -20, 20, -6 + 12 * this.health / this.maxHealth, -180, 0)
        }
        break
      case 13://Explode-O-Nut
        layer.fill(160 + (1 - this.health / this.maxHealth) * 80, 60, 30 + (1 - this.health / this.maxHealth) * 30)
        if (this.health > this.maxHealth * 2 / 3) {
          layer.ellipse(0, -30, 40, 54)
        } else if (this.health > this.maxHealth / 3) {
          layer.arc(0, -30, 40, 54, -60, 285)
        } else {
          layer.arc(0, -30, 40, 54, -115, -75)
          layer.arc(0, -30, 40, 54, -60, 230)
        }
        layer.fill(0)
        layer.ellipse(6, -36, 6, 6)
        layer.ellipse(-6, -36, 6, 6)
        layer.noFill()
        layer.stroke(0)
        layer.strokeWeight(2)
        layer.arc(0, -20, 20, 6, 0, 180)
        break
      case 14://Boomberry
        layer.fill(255, 50, 255)
        layer.ellipse(-12, -48, 16, 16)
        layer.ellipse(0, -48, 16, 16)
        layer.ellipse(12, -48, 16, 16)
        layer.ellipse(-6, -36, 16, 16)
        layer.ellipse(6, -36, 16, 16)
        layer.ellipse(-18, -36, 16, 16)
        layer.ellipse(18, -36, 16, 16)
        layer.ellipse(-12, -24, 16, 16)
        layer.ellipse(0, -24, 16, 16)
        layer.ellipse(12, -24, 16, 16)
        layer.ellipse(-6, -12, 16, 16)
        layer.ellipse(6, -12, 16, 16)
        layer.fill(0)
        layer.ellipse(-3, -36, 6, 6)
        layer.ellipse(12, -36, 6, 6)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1)
        layer.arc(4.5, -27, 12, 6, -150, -30)
        layer.arc(-3, -36, 10, 10, -180, -90)
        layer.arc(12, -36, 10, 10, -90, 0)
        break
      case 15://Garlic
        layer.fill(220, 220, 200);
        if (this.health > this.maxHealth / 2) {
          layer.ellipse(0, -30, 48, 48);
          layer.triangle(-15, -48, 15, -48, 0, -60);
        } else {
          layer.arc(0, -30, 48, 48, -30, 210);
          layer.triangle(cos(30) * -24, -30 - sin(30) * 24, cos(30) * 24, -30 - sin(30) * 24, 0, -29);
        }
        layer.fill(0);
        layer.ellipse(6, -28, 6, 6);
        layer.ellipse(18, -28, 6, 6);
        layer.fill(160)
        layer.rect(12, -22, 2, 3)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.line(8, -22, 16, -22)
        break;
      case 16://Puff-Shroom
        layer.fill(200, 150, 200)
        layer.rect(-5, -20, 10, 12)
        layer.ellipse(5, -14, 4, 6)
        layer.fill(150, 50, 200)
        layer.arc(0, -20, 30, 30, -180, 0)
        layer.arc(0, -20, 30, 3, 0, 180)
        layer.fill(100, 50, 150)
        layer.ellipse(-5, -24, 6, 6)
        layer.ellipse(5, -23, 5, 5)
        layer.fill(0)
        layer.ellipse(2, -17, 3, 3)
        layer.ellipse(5, -14, 2, 3)
        break
      case 17://Red Stinger
        layer.fill(25, 200, 25)
        layer.rect(-3, -24, 6, 24)
        layer.ellipse(6, 0, 15, 6)
        layer.ellipse(-6, 0, 15, 6)
        layer.fill(235, 25, 30)
        layer.ellipse(-10, -18, 20, 8)
        layer.ellipse(10, -18, 20, 8)
        layer.arc(0, -45, 40, 54, 0, 180)
        layer.triangle(-20, -45, -10, -45, -19, -54)
        layer.triangle(-10, -45, 0, -45, -8, -57)
        layer.triangle(20, -45, 10, -45, 19, -54)
        layer.triangle(10, -45, 0, -45, 8, -57)
        layer.fill(0)
        layer.ellipse(4, -30, 6, 6)
        layer.ellipse(12, -30, 6, 6)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.line(2, -34, 6, -32)
        layer.line(14, -34, 10, -32)
        layer.arc(8, -27, 10, 6, 30, 150)
        break
      case 18://Peashooter
        layer.fill(25, 200, 25)
        layer.ellipse(-9, -36, 30, 30)
        layer.rect(-9, -43, 30, 16)
        layer.ellipse(21, -35, 6, 16)
        layer.quad(-12, -36, -6, -36, 3, 0, -3, 0)
        layer.ellipse(6, 0, 15, 6)
        layer.ellipse(-6, 0, 15, 6)
        layer.fill(0)
        layer.ellipse(21, -35, 4, 12)
        layer.ellipse(-2, -42, 5, 5)
        break
      case 19://Phat Beet
        if (this.graphical.previousAttackAnim > 0) {
          layer.stroke(0, this.graphical.previousAttackAnim * 40)
          layer.strokeWeight(5)
          layer.ellipse(0, -10, 80 - this.graphical.previousAttackAnim * 8, 30 - this.graphical.previousAttackAnim * 3)
          this.graphical.previousAttackAnim--
        }
        layer.noStroke()
        layer.fill(50, 150, 50)
        layer.ellipse(20, -30, 15, 24)
        layer.fill(200, 50, 150)
        layer.ellipse(0, -30, 40, 40)
        layer.fill(0)
        layer.ellipse(13, -28, 5, 5)
        layer.ellipse(3, -28, 5, 5)
        layer.fill(50, 150, 50)
        layer.ellipse(-20, -30, 15, 24)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.arc(8, -20, 8, 4, -150, -30)
        break
      case 20://Spore Shroom
        layer.fill(200, 150, 200)
        layer.rect(-6, -24, 12, 18)
        layer.fill(150, 50, 200)
        layer.arc(0, -24, 48, 48, -180, 0)
        layer.arc(0, -24, 48, 6, 0, 180)
        layer.rect(6, -36, 24, 12)
        layer.ellipse(30, -30, 10, 18)
        layer.fill(100, 50, 150)
        layer.ellipse(-9, -35, 14, 14)
        layer.ellipse(9, -33, 12, 12)
        layer.fill(0)
        layer.ellipse(30, -30, 6, 12)
        layer.ellipse(3, -17, 5, 5)
        layer.rect(3, -12, 3, 1)
        break
      case 21://Threepeater
        layer.fill(25, 200, 25)
        layer.ellipse(-9, -51, 20, 20)
        layer.ellipse(-11, -36, 20, 20)
        layer.ellipse(-9, -21, 20, 20)
        layer.rect(-9, -55, 24, 10)
        layer.rect(-11, -40, 24, 10)
        layer.rect(-9, -25, 24, 10)
        layer.ellipse(15, -50, 4, 10)
        layer.ellipse(13, -35, 4, 10)
        layer.ellipse(15, -20, 4, 10)
        layer.quad(-13, -22, -7, -22, 3, 0, -3, 0)
        layer.ellipse(6, 0, 15, 6)
        layer.ellipse(-6, 0, 15, 6)
        layer.fill(0)
        layer.ellipse(15, -50, 3, 7)
        layer.ellipse(13, -35, 3, 7)
        layer.ellipse(15, -20, 3, 7)
        layer.ellipse(-4, -56, 4, 4)
        layer.ellipse(-6, -41, 4, 4)
        layer.ellipse(-4, -26, 4, 4)
        break
      case 22://Fume Shroom
        if (this.graphical.previousAttackAnim > 0) {
          layer.fill(200, 100, 250, this.graphical.previousAttackAnim * 8)
          layer.ellipse(200 - this.graphical.previousAttackAnim * 9, -24, 360 - this.graphical.previousAttackAnim * 18, 60 - this.graphical.previousAttackAnim * 3)
          this.graphical.previousAttackAnim--
        }
        layer.translate(0, -5)
        layer.fill(200, 150, 200)
        layer.rect(-12, -18, 24, 15)
        layer.fill(150, 50, 200)
        layer.ellipse(0, -24, 48, 30)
        layer.rect(6, -30, 20, 12)
        layer.ellipse(25, -24, 10, 18)
        layer.fill(100, 50, 150)
        layer.ellipse(-9, -26, 14, 14)
        layer.ellipse(9, -22, 12, 12)
        layer.fill(0)
        layer.ellipse(25, -24, 6, 12)
        layer.ellipse(6, -7, 5, 5)
        break
      case 23://Valley Lily
        layer.translate(0, -15)
        layer.noFill()
        layer.stroke(0, 180, 0)
        layer.strokeWeight(8)
        layer.line(5, 10, 15, 0)
        layer.stroke(0, 180, 0)
        layer.strokeWeight(4)
        layer.arc(-10, -23, 18, 26, 90, 270)
        layer.noStroke()
        layer.fill(180, 235, 240)
        layer.ellipse(0, -5, 36, 35)
        layer.arc(4, -36, 30, 20, 90, 270)
        layer.fill(0)
        layer.ellipse(13, -5, 5, 5)
        layer.ellipse(3, -5, 5, 5)
        layer.stroke(0, 180, 0)
        layer.strokeWeight(8)
        layer.line(-5, 10, -15, 0)
        layer.stroke(210, 60, 60)
        layer.strokeWeight(4)
        layer.line(-6, -18, 6, -24)
        layer.strokeWeight(3)
        layer.line(0, -21, 6, -12)
        layer.line(0, -21, -1, -9)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.arc(8, -1, 7, 5, 30, 150)
        break
      case 24://Pepper Cannon
        layer.fill(240, 20, 20, 50)
        layer.ellipse(-8, -30, 36, 60)
        layer.ellipse(8, -30, 36, 60)
        layer.fill(160, 20, 20)
        layer.rect(-3, -54, 6, 10)
        layer.fill(240, 20, 20)
        layer.ellipse(-8, -30, 24, 48)
        layer.ellipse(8, -30, 24, 48)
        layer.fill(230, 20, 20)
        layer.ellipse(-8, -30, 18, 36)
        layer.ellipse(8, -30, 18, 36)
        layer.fill(0)
        layer.arc(-2, -33, 8, 8, 30, 210)
        layer.arc(12, -33, 8, 8, -30, 150)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.arc(5, -24, 7, 4, -160, -20)
        break
      case 25://Coconut Cannon
        layer.fill(85, 45, 5)
        layer.ellipse(6, -12, 18, 18)
        layer.ellipse(-18, -12, 18, 18)
        layer.fill(125, 65, 10)
        layer.arc(-11, -30, 36, 48, 90, 270)
        layer.quad(-12, -6, -12, -54, 21, -45, 21, -15)
        layer.arc(21, -30, 18, 30, -90, 90)
        layer.fill(0)
        layer.ellipse(21, -30, 12, 20)
        layer.ellipse(3, -36, 8, 8)
        layer.stroke(0)
        layer.strokeWeight(1)
        layer.line(-24, -48, -28, -52)
        layer.fill(255, 125, 0)
        layer.noStroke()
        layer.ellipse(-28, -52, 6, 6)
        break
      case 26://Snow Pea
        layer.fill(25, 200, 25)
        layer.quad(-12, -36, -6, -36, 3, 0, -3, 0)
        layer.ellipse(6, 0, 15, 6)
        layer.ellipse(-6, 0, 15, 6)
        layer.fill(150, 225, 225)
        layer.triangle(-18, -40, -18, -32, -33, -36)
        layer.triangle(-18, -42, -18, -30, -28, -48)
        layer.triangle(-18, -42, -18, -30, -28, -24)
        layer.fill(75, 225, 225)
        layer.ellipse(-9, -36, 30, 30)
        layer.rect(-9, -43, 30, 16)
        layer.ellipse(21, -35, 6, 16)
        layer.fill(0)
        layer.ellipse(21, -35, 4, 12)
        layer.ellipse(-2, -42, 5, 5)
        break;
      case 27://Stunion
        layer.stroke(0, 200, 0)
        layer.strokeWeight(3)
        layer.line(-10, -20, -25, -35)
        layer.line(-10, -20, -30, -25)
        layer.line(-10, -20, -15, -40)
        layer.noStroke()
        layer.fill(200, 175, 100)
        layer.ellipse(0, -20, 30, 20)
        layer.fill(0)
        layer.ellipse(-2, -22, 5, 5)
        layer.ellipse(6, -22, 5, 5)
        layer.fill(160)
        layer.rect(2, -16, 2, 3)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.line(-2, -16, 6, -16)
        break
      case 28://Endurian
        layer.fill(200, 150, 50)
        if (this.firedAtLeastOnce) {
          for (let g = 0; g < 15; g++) {
            if (g != 7 && g != 8) {
              layer.triangle(sin(g * 24 - 12) * -17, cos(g * 24 - 12) * -21 - 30, sin(g * 24 + 12) * -17, cos(g * 24 + 12) * -21 - 30, sin(g * 24) * 25 * min(-1, -1.2 + (this.maxReload - this.reload) / 75), cos(g * 24) * 32 * min(-1, -1.2 + (this.maxReload - this.reload) / 75) - 30)
            }
          }
        } else {
          for (let g = 0; g < 15; g++) {
            if (g != 7 && g != 8) {
              layer.triangle(sin(g * 24 - 12) * -17, cos(g * 24 - 12) * -21 - 30, sin(g * 24 + 12) * -17, cos(g * 24 + 12) * -21 - 30, sin(g * 24) * 25 * -1, cos(g * 24) * 32 * -1 - 30)
            }
          }
        }
        layer.arc(0, -30, 36, 48, -255, 75)
        layer.triangle(cos(-250) * 18, sin(-250) * 24 - 30, cos(70) * 18, sin(70) * 24 - 30, 0, -30)
        layer.fill(0)
        layer.ellipse(0, -36, 6, 6)
        layer.ellipse(10, -36, 6, 6)
        layer.stroke(0)
        layer.noFill()
        layer.strokeWeight(1.5)
        layer.line(-2, -41, 2, -39)
        layer.line(12, -41, 8, -39)
        layer.arc(5, -27, 12, 6, -150, -30)
        break
      case 29://Spikeweed
        layer.fill(200)
        if (this.firedAtLeastOnce) {
          for (let a = 0; a < 9; a++) {
            layer.triangle(-27 + a * 6, 0, -21 + a * 6, 0, -24 + a * 6, min(-8, -12 + (this.maxReload - this.reload) / 2))
          }
        } else {
          for (let a = 0; a < 9; a++) {
            layer.triangle(-27 + a * 6, 0, -21 + a * 6, 0, -24 + a * 6, -8)
          }
        }
        layer.fill(25, 75, 25)
        layer.rect(-30, 0, 60, 10, 5)
        layer.fill(0)
        layer.ellipse(-9, 5, 6, 6)
        layer.ellipse(9, 5, 6, 6)
        break
      default://Placeholder Plant If No Sprite Available
        layer.fill("rgba(0,0,0,0.5)");
        layer.rect(-30, -60, 60, 60);
    }
    if (this.stunTimer > 0) {//Stunned
      layer.fill(255, 50);
      layer.noStroke();
      layer.ellipse(0, -30, 75, 75);
    }
    if (this.shakeTimer > 0) {//Eating
      layer.translate(sin(this.shakeTimer * 24) * -3, cos(this.shakeTimer * 24) * -3 / 2);
    }
    layer.scale(1 / this.size);
    layer.translate(-this.x - 30, -this.y - 70);
  }

  // Standard Draw
  draw() {
    noStroke();
    fill(0, 0, 0, 50);
    translate(this.x, this.y);
    if (this.endangered === true) {
      fill(255, 255, 50);
      triangle(0, 0, 10, 0, 0, 10);
      quad(20, 0, 30, 0, 0, 30, 0, 20);
      quad(40, 0, 50, 0, 0, 50, 0, 40);
      quad(60, 0, 60, 10, 0, 70, 0, 60);
      quad(0, 80, 10, 80, 60, 30, 60, 20);
      quad(20, 80, 30, 80, 60, 50, 60, 40);
      quad(40, 80, 50, 80, 60, 70, 60, 60);
      fill(0);
      quad(10, 0, 20, 0, 0, 20, 0, 10);
      quad(30, 0, 40, 0, 0, 40, 0, 30);
      quad(50, 0, 60, 0, 0, 60, 0, 50);
      quad(60, 10, 60, 20, 0, 80, 0, 70);
      quad(10, 80, 20, 80, 60, 40, 60, 30);
      quad(30, 80, 40, 80, 60, 60, 60, 50);
      triangle(50, 80, 60, 80, 60, 70);
    }
    translate(30, 70);
    scale(this.size);
    if (this.shakeTimer > 0) {
      translate(sin(this.shakeTimer * 24) * 3, cos(this.shakeTimer * 24) * 3 / 2)
    }
    noStroke();
    switch (this.type) {
      case 1://Sunflower
        fill(120, 180, 85);
        rect(-3, -20, 6, 18);
        fill(130, 190, 95);
        ellipse(-8, -2, 11, 7);
        ellipse(8, -2, 11, 7);
        ellipse(0, 1, 11, 7);
        translate(0, -36);
        fill(255, 245, 115);
        for (let a = 0; a < 15; a++) {
          rotate(24);
          arc(14, 0, 12, 7, -90, 90);
        }
        translate(0, 36);
        fill(230.25, 165, 65);
        ellipse(0, -36, 30, 30);
        fill(0);
        ellipse(-6, -39, 5, 5);
        ellipse(6, -39, 5, 5);
        stroke(0)
        noFill()
        strokeWeight(1.5)
        arc(0, -33, 14, 8, 30, 150)
        break;
      case 2://Twin Sunflower
        fill(120, 180, 85)
        quad(-3, -2, 2, -2, -10, -24, -15, -24)
        quad(3, -2, -2, -2, 10, -24, 15, -24)
        fill(130, 190, 95)
        ellipse(-8, -2, 11, 7)
        ellipse(8, -2, 11, 7)
        ellipse(0, 1, 11, 7)
        translate(-18, -36)
        fill(255, 245, 115)
        for (let a = 0; a < 15; a++) {
          rotate(24)
          arc(12, 0, 10, 6, -90, 90)
        }
        translate(36, 0)
        fill(255, 245, 115)
        for (let a = 0; a < 15; a++) {
          rotate(24)
          arc(12, 0, 10, 6, -90, 90)
        }
        translate(-18, 36)
        fill(230.25, 165, 65)
        ellipse(-18, -36, 25, 25)
        ellipse(18, -36, 25, 25)
        fill(0)
        ellipse(-23, -38, 4, 4)
        ellipse(-13, -38, 4, 4)
        ellipse(23, -38, 4, 4)
        ellipse(13, -38, 4, 4)
        stroke(0)
        noFill()
        strokeWeight(1.25)
        arc(18, -34, 12, 7, 30, 150)
        arc(-18, -34, 12, 7, 30, 150)
        break
      case 3://Solar Tomato
        fill(75, 225, 75)
        rect(-2, -58, 4, 4)
        fill(255, 255, 150)
        ellipse(0, -30, 50, 50)
        fill(0)
        ellipse(5, -32, 6, 6)
        ellipse(15, -32, 6, 6)
        fill(255, 255, 180)
        ellipse(-10, -30, 20, 30)
        fill(220)
        rect(6, -24, 3, 4)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        line(16, -24, 4, -24)
        break
      case 4://Potato Mine
        if (this.reload > 0) {
          fill(160)
          rect(-1.5, -20, 3, 12)
          fill(255, 0, 0)
          ellipse(0, -22, 6, 6)
          fill(120, 70, 20)
          ellipse(-9, -10, 10, 10)
          ellipse(0, -10, 10, 10)
          ellipse(9, -10, 10, 10)
        } else {
          fill(160)
          rect(-1.5, -34, 3, 12)
          fill(255, 0, 0)
          ellipse(0, -36, 6, 6)
          fill(220, 200, 100)
          arc(0, -10, 30, 36, -180, 0)
          fill(120, 70, 20)
          ellipse(-13.5, -10, 10)
          ellipse(-4.5, -10, 10)
          ellipse(4.5, -10, 10)
          ellipse(13.5, -10, 10)
          fill(0)
          ellipse(-6, -22, 5, 5)
          ellipse(6, -22, 5, 5)
          fill(220)
          rect(-4, -17, 2, 3)
          stroke(0)
          noFill()
          strokeWeight(1.5)
          line(-6, -17, 6, -17)
        }
        break
      case 5://Squash
        fill(100, 150, 100)
        rect(-2, -63, 4, 4)
        fill(100, 200, 100)
        arc(0, -20, 50, 40, 0, 180)
        quad(25, -20, -25, -20, -15, -50, 15, -50)
        arc(0, -50, 30, 20, -180, 0)
        fill(0)
        ellipse(0, -25, 6, 6)
        ellipse(15, -25, 6, 6)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        line(3, -20, 12, -20)
        line(-3, -29, 3, -27)
        line(18, -29, 12, -27)
        break
      case 6://Celery Stalker
        if (this.reload > 0) {
          fill(100, 255, 100)
          quad(-10, -10, 0, -10, -10, -50, -20, -50)
          quad(10, -10, 0, -10, 10, -50, 20, -50)
          rect(-22, -30, 12, 8)
          rect(10, -30, 12, 8)
          fill(0)
          ellipse(-15, -40, 3, 3)
          ellipse(-11, -40, 3, 3)
          ellipse(15, -40, 3, 3)
          ellipse(11, -40, 3, 3)
          stroke(0)
          noFill()
          strokeWeight(1)
          line(-16, -43, -14, -42)
          line(-12, -42, -10, -43)
          line(-15, -37, -11, -37)
          line(16, -43, 14, -42)
          line(12, -42, 10, -43)
          line(15, -37, 11, -37)
        } else {
          fill(100, 255, 100)
          rect(-10, -14, 20, 4)
        }
        break
      case 7://Cherry Bomb
        stroke(25, 175, 25);
        strokeWeight(6);
        line(-20, -40, 0, -55);
        line(20, -40, 0, -55);
        noStroke();
        fill(225, 25, 25);
        ellipse(-20, -30, 30, 30);
        ellipse(20, -30, 30, 30);
        fill(0);
        ellipse(-28, -28, 6, 6);
        ellipse(-18, -28, 6, 6);
        ellipse(18, -28, 6, 6);
        ellipse(28, -28, 6, 6);
        stroke(0)
        noFill()
        strokeWeight(1.5)
        line(-31, -32, -25, -30)
        line(-15, -32, -21, -30)
        arc(-23, -20, 12, 6, -160, -20)
        line(31, -32, 25, -30)
        line(15, -32, 21, -30)
        arc(23, -20, 12, 6, -160, -20)
        break
      case 8://Melon Grenade
        fill(150, 255, 255)
        ellipse(0, -30, 50, 50)
        stroke(0, 100, 100)
        strokeWeight(1)
        ellipse(0, -30, 30, 48)
        ellipse(0, -30, 10, 48)
        noStroke()
        fill(0)
        ellipse(10, -30, 6, 6)
        ellipse(20, -30, 6, 6)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        arc(15, -22, 12, 4, -165, -15)
        break
      case 9://Primal Potato Mine
        if (this.reload > 0) {
          fill(255)
          triangle(0, -20, 4, -10, -4, -10)
          fill(120, 70, 20)
          ellipse(-9, -10, 10, 10)
          ellipse(0, -10, 10, 10)
          ellipse(9, -10, 10, 10)
        } else {
          fill(255)
          triangle(4, -26, -4, -26, 0, -36)
          fill(220, 200, 100)
          quad(-16, -10, 16, -10, 12, -26, -12, -26)
          fill(120, 70, 20)
          ellipse(-13.5, -10, 10)
          ellipse(-4.5, -10, 10)
          ellipse(4.5, -10, 10)
          ellipse(13.5, -10, 10)
          fill(0)
          ellipse(-6, -22, 5, 5)
          ellipse(6, -22, 5, 5)
          fill(220)
          rect(-4, -17, 2, 3)
          stroke(0)
          noFill()
          strokeWeight(1.5)
          line(-6, -17, 6, -17)
        }
        break
      case 10://Dazey
        fill(120, 180, 85)
        rect(-3, -20, 6, 18)
        fill(130, 190, 95)
        ellipse(-8, -2, 11, 7)
        ellipse(8, -2, 11, 7)
        ellipse(0, 1, 11, 7)
        translate(0, -36)
        fill(255, 75, 75)
        for (let a = 0; a < 15; a++) {
          rotate(24)
          arc(14, 0, 12, 7, -90, 90)
        }
        translate(0, 36)
        fill(255, 125, 125)
        ellipse(0, -36, 30, 30)
        fill(0)
        ellipse(-6, -39, 5, 5)
        ellipse(6, -39, 5, 5)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        ellipse(0, -30, 10, 4)
        break
      case 11://Spring Bean
        noFill()
        stroke(175, 225, 125)
        strokeWeight(2)
        arc(0, -4, 10, 8, 90, 270)
        arc(0, -2, 10, 4, -90, 90)
        arc(0, 0, 10, 8, 90, 270)
        arc(0, 2, 10, 4, -90, 90)
        arc(0, 4, 10, 8, 90, 270)
        noStroke()
        fill(175, 225, 125)
        rect(-10, -35, 20, 20)
        arc(0, -35, 20, 20, -180, 0)
        arc(0, -15, 20, 20, 0, 180)
        fill(0)
        if (this.reload > 0) {
          rect(-5, -24, 4, 1)
          rect(4, -24, 4, 1)
        } else {
          ellipse(-3, -23, 4, 4)
          ellipse(6, -23, 4, 4)
        }
        stroke(0)
        noFill()
        strokeWeight(1.5)
        arc(1.5, -16, 6, 3, -150, -30)
        break
      case 12://Wall-nut
        fill(120, 60, 15)
        if (this.health > this.maxHealth * 2 / 3) {
          ellipse(0, -30, 40, 54)
        } else if (this.health > this.maxHealth / 3) {
          arc(0, -30, 40, 54, -60, 285)
        } else {
          arc(0, -30, 40, 54, -115, -75)
          arc(0, -30, 40, 54, -60, 230)
        }
        fill(0)
        ellipse(6, -36, 6, 6)
        ellipse(-6, -36, 6, 6)
        noFill()
        stroke(0)
        strokeWeight(2)
        if (this.health > this.maxHealth / 2) {
          arc(0, -20, 20, -6 + 12 * this.health / this.maxHealth, 0, 180)
        } else if (this.health == this.maxHealth / 2) {
          line(-10, -20, 10, -20)
        } else {
          arc(0, -20, 20, -6 + 12 * this.health / this.maxHealth, -180, 0)
        }
        break
      case 13://Explode-O-Nut
        fill(160 + (1 - this.health / this.maxHealth) * 80, 60, 30 + (1 - this.health / this.maxHealth) * 30)
        if (this.health > this.maxHealth * 2 / 3) {
          ellipse(0, -30, 40, 54)
        } else if (this.health > this.maxHealth / 3) {
          arc(0, -30, 40, 54, -60, 285)
        } else {
          arc(0, -30, 40, 54, -115, -75)
          arc(0, -30, 40, 54, -60, 230)
        }
        fill(0)
        ellipse(6, -36, 6, 6)
        ellipse(-6, -36, 6, 6)
        noFill()
        stroke(0)
        strokeWeight(2)
        arc(0, -20, 20, 6, 0, 180)
        break
      case 14://Boomberry
        fill(255, 50, 255)
        ellipse(-12, -48, 16, 16)
        ellipse(0, -48, 16, 16)
        ellipse(12, -48, 16, 16)
        ellipse(-6, -36, 16, 16)
        ellipse(6, -36, 16, 16)
        ellipse(-18, -36, 16, 16)
        ellipse(18, -36, 16, 16)
        ellipse(-12, -24, 16, 16)
        ellipse(0, -24, 16, 16)
        ellipse(12, -24, 16, 16)
        ellipse(-6, -12, 16, 16)
        ellipse(6, -12, 16, 16)
        fill(0)
        ellipse(-3, -36, 6, 6)
        ellipse(12, -36, 6, 6)
        stroke(0)
        noFill()
        strokeWeight(1)
        arc(4.5, -27, 12, 6, -150, -30)
        arc(-3, -36, 10, 10, -180, -90)
        arc(12, -36, 10, 10, -90, 0)
        break
      case 15://Garlic
        fill(220, 220, 200);
        if (this.health > this.maxHealth / 2) {
          ellipse(0, -30, 48, 48);
          triangle(-15, -48, 15, -48, 0, -60);
        } else {
          arc(0, -30, 48, 48, -30, 210);
          triangle(cos(30) * -24, -30 - sin(30) * 24, cos(30) * 24, -30 - sin(30) * 24, 0, -29);
        }
        fill(0);
        ellipse(6, -28, 6, 6);
        ellipse(18, -28, 6, 6);
        fill(160)
        rect(12, -22, 2, 3)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        line(8, -22, 16, -22)
        break;
      case 16://Puff-Shroom
        fill(200, 150, 200)
        rect(-5, -20, 10, 12)
        ellipse(5, -14, 4, 6)
        fill(150, 50, 200)
        arc(0, -20, 30, 30, -180, 0)
        arc(0, -20, 30, 3, 0, 180)
        fill(100, 50, 150)
        ellipse(-5, -24, 6, 6)
        ellipse(5, -23, 5, 5)
        fill(0)
        ellipse(2, -17, 3, 3)
        ellipse(5, -14, 2, 3)
        break
      case 17://Red Stinger
        fill(25, 200, 25)
        rect(-3, -24, 6, 24)
        ellipse(6, 0, 15, 6)
        ellipse(-6, 0, 15, 6)
        fill(235, 25, 30)
        ellipse(-10, -18, 20, 8)
        ellipse(10, -18, 20, 8)
        arc(0, -45, 40, 54, 0, 180)
        triangle(-20, -45, -10, -45, -19, -54)
        triangle(-10, -45, 0, -45, -8, -57)
        triangle(20, -45, 10, -45, 19, -54)
        triangle(10, -45, 0, -45, 8, -57)
        fill(0)
        ellipse(4, -30, 6, 6)
        ellipse(12, -30, 6, 6)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        line(2, -34, 6, -32)
        line(14, -34, 10, -32)
        arc(8, -27, 10, 6, 30, 150)
        break
      case 18://Peashooter
        fill(25, 200, 25)
        ellipse(-9, -36, 30, 30)
        rect(-9, -43, 30, 16)
        ellipse(21, -35, 6, 16)
        quad(-12, -36, -6, -36, 3, 0, -3, 0)
        ellipse(6, 0, 15, 6)
        ellipse(-6, 0, 15, 6)
        fill(0)
        ellipse(21, -35, 4, 12)
        ellipse(-2, -42, 5, 5)
        break
      case 19://Phat Beet
        if (this.graphical.previousAttackAnim > 0) {
          stroke(0, this.graphical.previousAttackAnim * 40)
          strokeWeight(5)
          ellipse(0, -10, 80 - this.graphical.previousAttackAnim * 8, 30 - this.graphical.previousAttackAnim * 3)
          this.graphical.previousAttackAnim--
        }
        noStroke()
        fill(50, 150, 50)
        ellipse(20, -30, 15, 24)
        fill(200, 50, 150)
        ellipse(0, -30, 40, 40)
        fill(0)
        ellipse(13, -28, 5, 5)
        ellipse(3, -28, 5, 5)
        fill(50, 150, 50)
        ellipse(-20, -30, 15, 24)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        arc(8, -20, 8, 4, -150, -30)
        break
      case 20://Spore Shroom
        fill(200, 150, 200)
        rect(-6, -24, 12, 18)
        fill(150, 50, 200)
        arc(0, -24, 48, 48, -180, 0)
        arc(0, -24, 48, 6, 0, 180)
        rect(6, -36, 24, 12)
        ellipse(30, -30, 10, 18)
        fill(100, 50, 150)
        ellipse(-9, -35, 14, 14)
        ellipse(9, -33, 12, 12)
        fill(0)
        ellipse(30, -30, 6, 12)
        ellipse(3, -17, 5, 5)
        rect(3, -12, 3, 1)
        break
      case 21://Threepeater
        fill(25, 200, 25)
        ellipse(-9, -51, 20, 20)
        ellipse(-11, -36, 20, 20)
        ellipse(-9, -21, 20, 20)
        rect(-9, -55, 24, 10)
        rect(-11, -40, 24, 10)
        rect(-9, -25, 24, 10)
        ellipse(15, -50, 4, 10)
        ellipse(13, -35, 4, 10)
        ellipse(15, -20, 4, 10)
        quad(-13, -22, -7, -22, 3, 0, -3, 0)
        ellipse(6, 0, 15, 6)
        ellipse(-6, 0, 15, 6)
        fill(0)
        ellipse(15, -50, 3, 7)
        ellipse(13, -35, 3, 7)
        ellipse(15, -20, 3, 7)
        ellipse(-4, -56, 4, 4)
        ellipse(-6, -41, 4, 4)
        ellipse(-4, -26, 4, 4)
        break
      case 22://Fume Shroom
        if (this.graphical.previousAttackAnim > 0) {
          fill(200, 100, 250, this.graphical.previousAttackAnim * 8)
          ellipse(200 - this.graphical.previousAttackAnim * 9, -24, 360 - this.graphical.previousAttackAnim * 18, 60 - this.graphical.previousAttackAnim * 3)
          this.graphical.previousAttackAnim--
        }
        fill(200, 150, 200)
        rect(-12, -18, 24, 15)
        fill(150, 50, 200)
        ellipse(0, -24, 48, 30)
        rect(6, -30, 20, 12)
        ellipse(25, -24, 10, 18)
        fill(100, 50, 150)
        ellipse(-9, -26, 14, 14)
        ellipse(9, -22, 12, 12)
        fill(0)
        ellipse(25, -24, 6, 12)
        ellipse(6, -7, 5, 5)
        break
      case 23://Valley Lily
        noFill()
        stroke(0, 180, 0)
        strokeWeight(8)
        line(5, 10, 15, 0)
        stroke(0, 180, 0)
        strokeWeight(4)
        arc(-10, -23, 18, 26, 90, 270)
        noStroke()
        fill(180, 235, 240)
        ellipse(0, -5, 36, 35)
        arc(4, -36, 30, 20, 90, 270)
        fill(0)
        ellipse(13, -5, 5, 5)
        ellipse(3, -5, 5, 5)
        stroke(0, 180, 0)
        strokeWeight(8)
        line(-5, 10, -15, 0)
        stroke(210, 60, 60)
        strokeWeight(4)
        line(-6, -18, 6, -24)
        strokeWeight(3)
        line(0, -21, 6, -12)
        line(0, -21, -1, -9)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        arc(8, -1, 7, 5, 30, 150)
        break
      case 24://Pepper Cannon
        fill(240, 20, 20, 50)
        ellipse(-8, -30, 36, 60)
        ellipse(8, -30, 36, 60)
        fill(160, 20, 20)
        rect(-3, -54, 6, 10)
        fill(240, 20, 20)
        ellipse(-8, -30, 24, 48)
        ellipse(8, -30, 24, 48)
        fill(230, 20, 20)
        ellipse(-8, -30, 18, 36)
        ellipse(8, -30, 18, 36)
        fill(0)
        arc(-2, -33, 8, 8, 30, 210)
        arc(12, -33, 8, 8, -30, 150)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        arc(5, -24, 7, 4, -160, -20)
        break
      case 25://Coconut Cannon
        fill(85, 45, 5)
        ellipse(6, -12, 18, 18)
        ellipse(-18, -12, 18, 18)
        fill(125, 65, 10)
        arc(-11, -30, 36, 48, 90, 270)
        quad(-12, -6, -12, -54, 21, -45, 21, -15)
        arc(21, -30, 18, 30, -90, 90)
        fill(0)
        ellipse(21, -30, 12, 20)
        ellipse(3, -36, 8, 8)
        stroke(0)
        strokeWeight(1)
        line(-24, -48, -28, -52)
        if (this.reload <= 0) {
          fill(255, 125, 0)
          noStroke()
          ellipse(-28, -52, 6, 6)
        }
        break
      case 26://Snow Pea
        fill(25, 200, 25)
        quad(-12, -36, -6, -36, 3, 0, -3, 0)
        ellipse(6, 0, 15, 6)
        ellipse(-6, 0, 15, 6)
        fill(150, 225, 225)
        triangle(-18, -40, -18, -32, -33, -36)
        triangle(-18, -42, -18, -30, -28, -48)
        triangle(-18, -42, -18, -30, -28, -24)
        fill(75, 225, 225)
        ellipse(-9, -36, 30, 30)
        rect(-9, -43, 30, 16)
        ellipse(21, -35, 6, 16)
        fill(0)
        ellipse(21, -35, 4, 12)
        ellipse(-2, -42, 5, 5)
        break;
      case 27://Stunion
        stroke(0, 200, 0)
        strokeWeight(3)
        line(-10, -20, -25, -35)
        line(-10, -20, -30, -25)
        line(-10, -20, -15, -40)
        noStroke()
        fill(200, 175, 100)
        ellipse(0, -20, 30, 20)
        fill(0)
        ellipse(-2, -22, 5, 5)
        ellipse(6, -22, 5, 5)
        fill(160)
        rect(2, -16, 2, 3)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        line(-2, -16, 6, -16)
        break
      case 28://Endurian
        fill(200, 150, 50)
        if (this.firedAtLeastOnce) {
          for (let g = 0; g < 15; g++) {
            if (g != 7 && g != 8) {
              triangle(sin(g * 24 - 12) * -17, cos(g * 24 - 12) * -21 - 30, sin(g * 24 + 12) * -17, cos(g * 24 + 12) * -21 - 30, sin(g * 24) * 25 * min(-1, -1.2 + (this.maxReload - this.reload) / 75), cos(g * 24) * 32 * min(-1, -1.2 + (this.maxReload - this.reload) / 75) - 30)
            }
          }
        } else {
          for (let g = 0; g < 15; g++) {
            if (g != 7 && g != 8) {
              triangle(sin(g * 24 - 12) * -17, cos(g * 24 - 12) * -21 - 30, sin(g * 24 + 12) * -17, cos(g * 24 + 12) * -21 - 30, sin(g * 24) * 25 * -1, cos(g * 24) * 32 * -1 - 30)
            }
          }
        }
        arc(0, -30, 36, 48, -255, 75)
        triangle(cos(-250) * 18, sin(-250) * 24 - 30, cos(70) * 18, sin(70) * 24 - 30, 0, -30)
        fill(0)
        ellipse(0, -36, 6, 6)
        ellipse(10, -36, 6, 6)
        stroke(0)
        noFill()
        strokeWeight(1.5)
        line(-2, -41, 2, -39)
        line(12, -41, 8, -39)
        arc(5, -27, 12, 6, -150, -30)
        break
      case 29://Spikeweed
        fill(200)
        if (this.firedAtLeastOnce) {
          for (let a = 0; a < 9; a++) {
            triangle(-27 + a * 6, 0, -21 + a * 6, 0, -24 + a * 6, min(-8, -12 + (this.maxReload - this.reload) / 2))
          }
        } else {
          for (let a = 0; a < 9; a++) {
            triangle(-27 + a * 6, 0, -21 + a * 6, 0, -24 + a * 6, -8)
          }
        }
        fill(25, 75, 25)
        rect(-30, 0, 60, 10, 5)
        fill(0)
        ellipse(-9, 5, 6, 6)
        ellipse(9, 5, 6, 6)
        break
      default://Placeholder Plant If No Sprite Available
        fill("rgba(0,0,0,0.5)");
        rect(-30, -60, 60, 60);
    }
    if (this.stunTimer > 0) {//Stunned
      fill(255, 50);
      noStroke();
      ellipse(0, -30, 75, 75);
    }
    if (this.shakeTimer > 0) {//Eating
      translate(sin(this.shakeTimer * 24) * -3, cos(this.shakeTimer * 24) * -3 / 2);
    }
    scale(1 / this.size);
    translate(-this.x - 30, -this.y - 70);
  }

  // Incrementing Function
  move() {
    this.stunTimer -= levelSpeed;
    if (this.stunTimer <= 0) {//Plant not stunned
      this.reload -= levelSpeed;
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer -= levelSpeed;
    }
    if (this.reload <= 0) {
      switch (this.type) {
        case 1://Sunflower
          if (!currentLevel.type.includes(14)) {
            this.reload = this.maxReload;
            new Collectible(this.x + floor(random() * 110 - 25), this.y - 15, 1, this.damage, 1, false);
          }
          break;
        case 2://Twin Sunflower
          if (!currentLevel.type.includes(14)) {
            this.reload = this.maxReload;
            new Collectible(this.x, this.y - 15, 1, this.damage, 1, false);
            new Collectible(this.x + 55, this.y - 15, 1, this.damage, 1, false);
          }
          break;
        case 3://Solar Tomato
          this.health = 0;
          for (let currentZombie of allZombies) {
            if ((currentZombie.x + 30 > this.x - 90) && (currentZombie.x < this.x + 150)
              && (currentZombie.lane >= this.lane - 1) && (currentZombie.lane <= this.lane + 1)) {//Stun and given sun for zombies in 3x3
              currentZombie.determineSolarStun(this.splashDamage);
              new Collectible(currentZombie.x + 10, currentZombie.y + 30, 1, this.damage, 1);
            }
          }
          new Particle(3, this.x + 30, this.y + 30);
          break;
        case 7://Cherry Bomb
          this.health = 0;
          for (let currentZombie of allZombies) {
            if ((currentZombie.x + 30 > this.x - 90) && (currentZombie.x < this.x + 150) && (currentZombie.lane >= this.lane - 1) &&
              (currentZombie.lane <= this.lane + 1)) {//Damage zombies in 3x3
              currentZombie.determineDamage(this.damage);
            }
          }
          new Particle(0, this.x + 30, this.y + 30);
          break;
        case 8://Melon Grenade
          this.health = 0;
          for (let currentZombie of allZombies) {
            if ((currentZombie.x + 30 > this.x - 170) && (currentZombie.x < this.x + 230) && (currentZombie.lane >= this.lane - 2) &&
              (currentZombie.lane <= this.lane + 2)) {//Stun zombies in 5x5
              currentZombie.determineFreeze(this.splashDamage);
              currentZombie.determineChill(1.5 * this.splashDamage);//Chill is half as long as stun
            }
            if ((currentZombie.x + 30 > this.x - 90) && (currentZombie.x < this.x + 150) && (currentZombie.lane >= this.lane - 1) &&
              (currentZombie.lane <= this.lane + 1)) {//Damage zombies in 3x3
              currentZombie.determineDamage(this.damage);
            }
          }
          new Particle(1, this.x + 30, this.y + 30);
          break;
        case 10://Dazey
          this.health = 0;
          for (let currentZombie of allZombies) {
            if ((currentZombie.x + 30 > this.x - 90) && (currentZombie.x < this.x + 150) && (currentZombie.lane >= this.lane - 1) &&
              (currentZombie.lane <= this.lane + 1)) {//Stun zombies in 3x3
              currentZombie.determineStun(this.damage);
              if (this.splashDamage > 0) {//Tier 2 Daisy
                currentZombie.determineDamage(this.splashDamage);
              }
            }
          }
          new Particle(2, this.x + 30, this.y + 30);
          break;
        case 14://Boomberry
          this.health = 0;
          boomberryActive = true;
          currentJam = 0;
          setTimeout(function () { boomberryActive = false; currentJam = currentLevel["jams"][currentWave - 1] }, this.damage * 50 / 3);
          new Particle(5, this.x + 30, this.y + 30);
          break;
        case 27://Stunion
          this.health = 0;
          for (let currentZombie of allZombies) {
            if ((currentZombie.x + 30 > this.x - 10) && (currentZombie.x < this.x + 150) &&
              (currentZombie.lane === this.lane)) {//Stun zombies in 3x3
              currentZombie.determineStun(this.damage);
            }
          }
          new Particle(11, this.x + 40, this.y + 36);
          break;
        case 28://Endurian
          for (let currentZombie of allZombies) {
            if ((currentZombie.x + 30 > this.x - 20) && (currentZombie.x < this.x + 80) &&
              (currentZombie.lane === this.lane)) {//Hit Zombie in Tile Range
              this.reload = this.maxReload;
              this.firedAtLeastOnce = true;
              currentZombie.determineDamage(this.damage);
            }
          }
          break;
        case 29://Spikeweed
          for (let currentZombie of allZombies) {
            if ((currentZombie.x + 30 > this.x - 10) && (currentZombie.x < this.x + 70) && (currentZombie.lane === this.lane)) {//1 tile range
              this.reload = this.maxReload;
              this.firedAtLeastOnce = true
              currentZombie.determineDamage(this.damage);
            }
          }
          break;
        default:
          break;
      }
    }
    if ((this.reload <= 0) && (this.projectileType !== 0)) {//Projectile Shooting Plants (Peashooter, Red Stinger)
      //Shoot only if there is a zombie ahead (Coconut Cannon is excluded)
      let zombieInRange = false
      for (let currentZombie of allZombies) {
        if ((currentZombie.type === 20) && (currentZombie.eating === false) && ((currentJam === 5) || (currentJam === 8))) {//Shadow zombie during jam
          continue;
        }
        if ((currentZombie.lane === this.lane) && (currentZombie.x > this.x) && ((this.type === 17) || (this.type === 18) || (this.type === 20) || (this.type === 23) || (this.type === 24) || (this.type === 26))) {
          //Peashooter OR Red Stinger OR Spore Shroom OR Valley Lily OR Pepper Cannon OR Snow Pea 
          zombieInRange = true;
          break;
        } else if (((currentZombie.lane === this.lane) || (currentZombie.lane === this.lane - 1) || (currentZombie.lane === this.lane + 1)) && (currentZombie.x > this.x) && (this.type === 21)) {//Threepeater
          zombieInRange = true;
          break;
        } else if ((currentZombie.lane === this.lane) && (currentZombie.x > this.x) && (currentZombie.x < this.x + 320) && (this.type === 16)) {//Puff Shroom
          zombieInRange = true;
          break;
        } else if ((currentZombie.lane === this.lane) && (currentZombie.x > this.x) && (currentZombie.x < this.x + 400) && (this.type === 22)) {//Fume Shroom
          zombieInRange = true;
          break;
        } else if ((currentZombie.x + 30 > this.x - 90) && (currentZombie.x < this.x + 150) && (currentZombie.lane >= this.lane - 1) && (currentZombie.lane <= this.lane + 1) && (this.type === 19)) {//Phat Beet
          zombieInRange = true;
          break;
        }
      }
      //Regular Projectile Plants Not Fume or Phat Beet
      if (zombieInRange === true) {
        this.reload = this.maxReload;
        if ((this.projectileType !== 6) && (this.projectileType !== 7)) {//Normal projectiles
          if (this.type === 16) {//Puff-shroom Fires Lower
            new Projectile(this.x + 20, this.y + 40, this.lane, this.projectileType, this.damage, 1, this.tier, this.splashDamage);
          } else {//Normal
            new Projectile(this.x + 35, this.y + 15, this.lane, this.projectileType, this.damage, 1, this.tier, this.splashDamage);
          }
          if (this.type === 21) {//Threepeater
            if (this.lane === 1) {
              new Projectile(this.x + 40, this.y, this.lane, this.projectileType, this.damage, 1, this.tier, this.splashDamage);
              new Projectile(this.x + 40, this.y + 30, this.lane + 1, this.projectileType, this.damage, 1, this.tier, this.splashDamage);
              allProjectiles[allProjectiles.length - 1].goDownTimer = 17
            } else if (this.lane === 5) {
              new Projectile(this.x + 40, this.y, this.lane - 1, this.projectileType, this.damage, 1, this.tier, this.splashDamage);
              allProjectiles[allProjectiles.length - 1].goUpTimer = 17
              new Projectile(this.x + 40, this.y + 30, this.lane, this.projectileType, this.damage, 1, this.tier, this.splashDamage);
            } else {//Lane 2,3,4
              new Projectile(this.x + 40, this.y, this.lane - 1, this.projectileType, this.damage, 1, this.tier, this.splashDamage);
              allProjectiles[allProjectiles.length - 1].goUpTimer = 17
              new Projectile(this.x + 40, this.y + 30, this.lane + 1, this.projectileType, this.damage, 1, this.tier, this.splashDamage);
              allProjectiles[allProjectiles.length - 1].goDownTimer = 17
            }
          }
        } else if (this.projectileType === 6) {//Fume Shroom
          for (let currentZombie of allZombies) {
            if ((currentZombie.x > this.x) && (currentZombie.x < this.x + 400) && (this.lane === currentZombie.lane)) {
              currentZombie.determineDamage(this.damage);
              this.graphical.previousAttackAnim = 20;
            }
          }
        } else if (this.projectileType === 7) {//Phat Beet
          for (let currentZombie of allZombies) {
            if ((currentZombie.x + 30 > this.x - 90) && (currentZombie.x < this.x + 150) && (currentZombie.lane >= this.lane - 1) && (currentZombie.lane <= this.lane + 1)) {
              currentZombie.determineDamage(this.damage);
              this.graphical.previousAttackAnim = 10;
            }
          }
        }
      }
    }
    //General Movement
    if (this.type === 5) {//Squash
      let zombieX = []
      for (let currentZombie of allZombies) {
        //Find Zombie
        if ((currentZombie.lane === this.lane) && (currentZombie.x + 30 > this.x - 90) && (currentZombie.x < this.x + 150)) {
          zombieX.push(currentZombie.x);
        }
      }
      //If there is a zombie, target furthest left
      if (zombieX.length !== 0) {
        this.health = 0
        let lowestX = zombieX[0]
        for (let currentEntry of zombieX) {
          if (currentEntry < lowestX) {
            lowestX = currentEntry
          }
        }
        //Squash Area Around Specified X
        for (let currentZombie of allZombies) {
          if ((currentZombie.x + 30 > lowestX - 40) && (currentZombie.x < lowestX + 40) && (currentZombie.lane === this.lane)) {
            currentZombie.determineDamage(this.damage);
          }
        }
        if (zombieX > this.x) {
          new Particle(9, this.x + 30, this.y + 70);
        } else {
          new Particle(10, this.x + 30, this.y + 70);
        }
      }
    }
    if ((this.type === 6) && (this.stunTimer <= 0)) {//Celery Stalker
      for (let currentZombie of allZombies) {
        if ((currentZombie.lane === this.lane) && (currentZombie.x + 30 > this.x - 90) && (currentZombie.x + 30 < this.x - 10)) {//Damage to zombie behind celery
          this.eatable = true;
          this.reload = 300;
          currentZombie.determineDamage(this.damage * levelSpeed);
          break;
        }
      }
      if (this.reload < 0) {
        this.eatable = false;
      }
    }
  }

  // Individual collisions
  collision() {
    //Zombotany (or Punk) Projectiles
    for (let currentProjectile of allProjectiles) {
      if ((this.x + 60 > currentProjectile.x) && (this.x < currentProjectile.x + 20) && (this.lane === currentProjectile.lane)
        && (currentProjectile.used === false) && (currentProjectile.toZombie === false) && (this.eatable === true)) {//Zombie projectiles
        currentProjectile.used = true;
        this.take(currentProjectile.damage);
      }
    }
  }

  //General Damage Function
  take(damage) {
    this.health -= damage;
    if (this.shakeTimer <= 0) {
      this.shakeTimer = 15;
    }
  }
}

