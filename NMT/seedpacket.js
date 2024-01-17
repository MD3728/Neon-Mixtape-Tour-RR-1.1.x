/* Seed Packet Class File */

class SeedPacket extends Entity{
  constructor(type,name,sunCost,tier,recharge,startingRecharge, moving = false, spawnZombie = false, startingX = 1000, startingY = 1000, disabled = false){
    super(type, startingX, startingY);
    this.name = name;
    this.recharge = startingRecharge;
    this.startingRecharge = startingRecharge;
    this.maxRecharge = recharge;
    this.sun = sunCost;//Sun Cost
    this.moving = moving;//True only for conveyors
    this.tier = tier;
    this.selected = false;
    this.spawnZombie = spawnZombie;
    this.disabled = disabled;
    this.class = type>=1?plantStat[type-1].packet:6
    allPackets.push(this);
  }

  // Note: Seed packet images are pre-drawn in the setup function of graphics.js
  draw(){
    // Background Seed Packet Box
    noStroke();
    strokeWeight(3);
    switch (this.class) {
      case 0: // Dark Cyan
        for (let a = 0, la = 20; a < la; a++) {
          fill(63, 156, 192 - 65 * a / la);
          rect(this.x + 30 * a / la, this.y + 60 * a / la, 120 - 60 * a / la, 60 - 60 * a / la, 2);
        }
        break
      case 1: // Orange
        for (let a = 0, la = 20; a < la; a++) {
          fill(240, 150 - 60 * a / la, 60 - 60 * a / la);
          rect(this.x + 30 * a / la, this.y + 60 * a / la, 120 - 60 * a / la, 60 - 60 * a / la, 2);
        }
        break
      case 2: // Purple
        for (let a = 0, la = 20; a < la; a++) {
          fill(210 - 30 * a / la, 180 - 60 * a / la, 240);
          rect(this.x + 30 * a / la, this.y + 60 * a / la, 120 - 60 * a / la, 60 - 60 * a / la, 2);
        }
        break
      case 3: // Gray
        for (let a = 0, la = 20; a < la; a++) {
          fill(160 - 40 * a / la);
          rect(this.x + 30 * a / la, this.y + 60 * a / la, 120 - 60 * a / la, 60 - 60 * a / la, 2);
        }
        break
      case 4: // Green
        for (let a = 0, la = 20; a < la; a++) {
          fill(130 - 80 * a / la, 170, 130 - 80 * a / la);
          rect(this.x + 30 * a / la, this.y + 60 * a / la, 120 - 60 * a / la, 60 - 60 * a / la, 2);
        }
        break
      case 5: // Red
        for (let a = 0, la = 20; a < la; a++) {
          fill(240 - 40 * a / la, 160 - 80 * a / la, 160 - 80 * a / la);
          rect(this.x + 30 * a / la, this.y + 60 * a / la, 120 - 60 * a / la, 60 - 60 * a / la, 2);
        }
        break
      case 6: // Brown (Shovel)
        for (let a = 0, la = 20; a < la; a++) {
          fill(120 - 40 * a / la, 80 - 40 * a / la, 0);
          rect(this.x + 30 * a / la, this.y + 60 * a / la, 120 - 60 * a / la, 60 - 60 * a / la, 2);
        }
        break
      case 7: // Cafe
        for (let a = 0, la = 20; a < la; a++) {
          fill(150 - 40 * a / la, 120 - 40 * a / la, 45);
          rect(this.x + 30 * a / la, this.y + 60 * a / la, 120 - 60 * a / la, 60 - 60 * a / la, 2);
        }
        break
    }
    // Draw Recharge
    fill(0,150);
    rect(this.x, this.y, 120, (this.recharge/(this.maxRecharge + 3))*60,2);// Buffer added to make it look nicer/accurate
    // Draw Border
    if (this.selected === true){
      stroke(200,0,0);
    }else{
      stroke(200);
    }
    strokeWeight(3);
    noFill();
    rect(this.x, this.y, 120, 60, 2);
    // Show Shovel
    if(this.type=='shovel'){
      stroke(200,0,0)
      noFill()
      strokeWeight(5)
      ellipse(this.x+60,this.y+30,40)
      line(this.x+74,this.y+16,this.x+46,this.y+44)
    }
    noStroke();
    // Do not show unlocked plants (Except on conveyors and locked and loaded levels)
    if ((!unlockedPackets.includes(this.type))&&((!currentLevel.type.includes(2))&&(!currentLevel.type.includes(3)))){
      if (this.type !== "shovel"){
        fill(0,0,0,100);
        rect(this.x+1.5, this.y+1.5, 117, 57, 1.8);
      }
      return;
    }
    fill(0);
    // Draw Name
    textSize(20);
    if (this.type !== "shovel"){
      if(currentLevel["type"].includes(14)){
        image(zombiePacketImages[this.type],this.x,this.y,120,60)
      }else{
        image(seedPacketImages[this.type-1],this.x,this.y,120,60);
      }
    }
    // Draw Sun Cost
    textSize(22);
    if ((!currentLevel["type"].includes(2))&&(this.type !== "shovel")){//Not Conveyor
      fill(255);
      if ((sun < this.sun)&&(screen === "level")){//Not Enough Sun
        fill(255,0,0);
      }
      text(this.sun,this.x+95,this.y+38);
    }
    // Draw Tier
    if (!currentLevel.type.includes(14)){//Show Tier (Not I Zombie)
      if(this.tier === 1){
        stroke(120,80,40);
        strokeWeight(4);
        line(this.x+108,this.y+10,this.x+108,this.y+22);
      }else if(this.tier === 2){
        stroke(160);
        strokeWeight(4);
        line(this.x+105,this.y+10,this.x+105,this.y+22);
        line(this.x+111,this.y+10,this.x+111,this.y+22);
      }
    }
    
    // Show disabled (unselectable) overlay
    if (this.disabled === true){
      fill(0,0,0,100);
      rect(this.x, this.y, 120, 60, 2);
    }
  }

  // Incrementing Function
  move(){
    if (this.moving === true){//Conveyor
      if (this.y > 75*(allPackets.indexOf(this) - 1) + 20){
        this.y -= levelSpeed;
      }
    }else{//Other Levels
      if (this.recharge > 0){
        this.recharge -= levelSpeed;
      }else{
        this.recharge = 0;
      }
      this.x = 10;
      this.y = 80 + allPackets.indexOf(this)*75;
      if (this.type === "shovel"){
        this.x = 150;
        this.y = 630;
      }
    }
  }
}

