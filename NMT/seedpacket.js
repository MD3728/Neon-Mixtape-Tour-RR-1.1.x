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
    allPackets.push(this);
  }

  draw(){
    // Box
    noStroke();
    fill(180,200,180);
    rect(this.x, this.y, 120, 60, 2);
    // Draw Recharge
    fill(0,50);
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
    // Draw Name
    noStroke();
    fill(0);
    textSize(20);
    //text(this.name,this.x+60,this.y+28);
    if(this.type=='shovel'){
      stroke(200,0,0)
      noFill()
      strokeWeight(5)
      ellipse(this.x+60,this.y+30,40)
      line(this.x+74,this.y+16,this.x+46,this.y+44)
    }else{
      image(seedpacketimages[this.type-1],this.x,this.y,120,60)
    }
    // Draw Sun Cost
    textSize(18);
    if ((!currentLevel["type"].includes(2))&&(this.type !== "shovel")){//Not Conveyor
      if ((sun < this.sun)&&(screen === "level")){
        fill(255,0,0);
      }
      text(this.sun,this.x+103,this.y+38);
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
        line(this.x+106,this.y+10,this.x+106,this.y+22);
        line(this.x+110,this.y+10,this.x+110,this.y+22);
      }
    }
    // else if(this.tier==3){
    //   stroke(255,225,0)
    //   strokeWeight(2)
    //   line(this.x+102,this.y+26,this.x+102,this.y+32)
    //   line(this.x+108,this.y+26,this.x+108,this.y+32)
    //   line(this.x+114,this.y+26,this.x+114,this.y+32)
    // }
    // Draw Disabled Overlay
    if (this.disabled === true){
      fill(0,0,0,100);
      rect(this.x, this.y, 120, 60, 2);
    }
  }

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

