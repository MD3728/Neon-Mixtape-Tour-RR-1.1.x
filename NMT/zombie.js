/* Zombie Class File */

class Zombie extends Entity{
  constructor(x,y,row,type,health,shield,degrade,speed,eatSpeed,altSpeed,altEatSpeed,specialJam,wave,stunned = 0){
    super(type,x,y);//Call Entity Constructor
    this.lane = row;//Current Lane
    this.isZombie = true;//For tracking object types
    this.health = health;//Maximum Health
    this.shieldHealth = shield;//Shield Health
    this.maxHealth = health;//Maximum Health
    this.maxShieldHealth = shield;//Maximum Health
    this.degrade = degrade;//List of degrades with healths
    this.speed = speed;//Regular walking speed
    this.eatSpeed = eatSpeed;//Regular Eat Speed
    this.altSpeed = altSpeed;//Speed during jam OR when shield is active
    this.altEatSpeed = altEatSpeed;//Eat speed
    this.specialJam = specialJam;//Jam Zombie Reacts To, Default is -1
    this.protected = false;//Glitter Protection
    this.stunTimer = stunned;//Initial Freeze and Noxious Stun (Dazey, Stunion, Garlic)
    this.freezeTimer = 0;//Freeze (Melon Grenade)
    this.solarStunTimer = 0;//Solar Stun (Solar Tomato)
    this.chillTimer = 0;//Chill
    this.damageTimer = 0;//Damage Display
    this.eating = false;
    this.garlicCounter = 0;//For garlic, zombie switches lane when it gets to 60
    this.playedMusic = false;//For Boombox (Cannot Play Music Twice)
    this.permanentDamage = 0;//For Valley Lily Damage Over Time
    //Determine Reload and Max Shield Health
    switch (this.type){
      case 18://Gargantuar
        this.reload = 0;
        break;
      case 22://Gadgeter
        this.reload = 600;
        break;
      case 27: case 30://Cherry Bomb Zombie OR Dazey Zombie
        this.reload = -1;
        break;
      default://Arcade Spawn Timer OR Regular
        this.reload = 180;
    }
    this.waveSpawn = wave;// For determining 75% rule
    this.rate = [0,0,0,0,0];
    this.fade = 0;
    this.time = 0;
    this.size = 1;
    this.graphical = {previousAttackAnim:0};
    allZombies.push(this);
  }

  //Generic Draw
  draw(){
    noStroke();
    fill(0,0,0,50);
    translate(this.x+15,this.y+80);
    scale(this.size);
    noStroke();
    let performDraw = false;
    try{
      if (!currentLevel["type"].includes(11)){
        performDraw = true;
      } 
    }catch(e){//Almanac draw
      performDraw = true;
    }
    if (performDraw){//Zombies not drawn in Invisighoul
      switch(this.type){
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 32: ///Regulars
          stroke(60,80,100,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(120,80,40,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if((this.health>100)||((this.health > 175)&&(this.type === 3))){//Flag Zombie
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(120,80,40,this.fade)
          ellipse(0,-45,18,36)
          fill(255,this.fade)
          triangle(4,-70,-20/3,-70,-4,-50)
          fill(200,50,50,this.fade)
          quad(-4,-49,-14/3,-55,-4/3,-70,-2,-55)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          fill(0,this.fade)
          ellipse(-4,-72,4,4)
          ellipse(-12,-72,4,4)
          if(this.type==1&&this.health>200){
            strokeJoin(ROUND)
            stroke(255,150,0,this.fade)
            strokeWeight(4)
            fill(255,150,0,this.fade)
            line(-15,-85,15,-85)
            if(this.health>440){
              triangle(-10,-85,10,-85,0,-101)
            }else if(this.health>320){
              quad(-10,-85,10,-85,5,-93,-5,-93)
            }
            strokeJoin(MITER)
          }else if(this.type==2&&this.health>200){
            fill(180,185,190,this.fade)
            if(this.health>930){
              quad(-15,-81,15,-81,10,-101,-10,-101)
            }else if(this.health>570){
              beginShape()
              vertex(-15,-81)
              vertex(15,-81)
              vertex(10,-101)
              vertex(-4,-101)
              vertex(-6,-91)
              vertex(-8,-101)
              vertex(-10,-101)
              endShape()
            }else{
              quad(-15,-81,15,-81,12.5,-91,-12.5,-91)
            }
            quad(-15,-81,-12,-81,-15,-78,-18,-78)
            quad(0,-81,3,-81,0,-78,-3,-78)
            rect(-18,-78,18,3)
          }else if(this.type==3){
            fill(200,120,40,this.fade)
            rect(-28,-84,4,48)
            fill(240,40,40,this.fade)
            rect(-52,-82,24,20)
          }else if(this.type==4&&this.health>200){
            translate(0,-75)
            rotate(this.rate[0]*30)
            if(this.health>730){
              for(let a=0;a<12;a++){
                fill(200+(a%3)*20,this.fade)
                if(this.health>1270||a!=11&&a!=9){
                  arc(0,0,36,36,a*30,a*30+30)
                }
              }
            }else{
              for(let a=0;a<6;a++){
                fill(200+(a%3)*20,this.fade)
                arc(0,0,36,36,a*60,a*60+30)
              }
            }
            rotate(this.rate[0]*-30)
            translate(0,75)
          }else if(this.type==5&&this.health>200){
            stroke(100,200,200,this.fade/2)
            fill(75,150,150,this.fade/2)
            strokeWeight(1)
            if(this.health>1670){
              rect(-20,-95,8,40)
              rect(-12,-95,8,40)
              rect(-4,-95,8,40)
              rect(4,-95,8,40)
              rect(12,-95,8,40)
            }else if(this.health>930){
              rect(12,-91,8,36)
              rect(4,-83,8,28)
              rect(-4,-87,8,32)
              rect(-12,-79,8,24)
              rect(-20,-75,8,20)
            }else{
              rect(12,-79,8,24)
              rect(4,-71,8,16)
              rect(-4,-75,8,20)
              rect(-12,-67,8,12)
              rect(-20,-63,8,8)
            }
          }else if(this.type==6&&this.shieldHealth>0){//Speakerhead
            fill(80,this.fade);
            if(this.shieldHealth>500){
              rect(-18,-105,36,60);
              fill(60,this.fade);
              ellipse(-6,-90,18,18);
              ellipse(-6,-60,18,18);
            }else{
              rect(-18,-75,36,30);
              fill(60,this.fade);
              ellipse(-6,-60,18,18);
            }
          }else if(this.type==32&&this.health>200){
            strokeJoin(ROUND)
            stroke(255,150,0,this.fade)
            strokeWeight(4)
            fill(255,150,0,this.fade)
            line(-15,-85,15,-85)
            if(this.health>440){
              triangle(-10,-85,10,-85,0,-101)
            }else if(this.health>320){
              quad(-10,-85,10,-85,5,-93,-5,-93)
            }
            strokeJoin(MITER)
            if(this.health>560){
              noStroke()
              fill(180,185,190,this.fade)
              if(this.health>1290){
                quad(-15,-91,15,-91,10,-111,-10,-111)
              }else if(this.health>930){
                beginShape()
                vertex(-15,-91)
                vertex(15,-91)
                vertex(10,-111)
                vertex(-4,-111)
                vertex(-6,-101)
                vertex(-8,-111)
                vertex(-10,-111)
                endShape()
              }else{
                quad(-15,-91,15,-91,12.5,-101,-12.5,-101)
              }
              quad(-15,-91,-12,-91,-15,-88,-18,-88)
              quad(0,-91,3,-91,0,-88,-3,-88)
              rect(-18,-88,18,3)
            }
          }
        break
        case 7://Newspaper
          if(this.shieldHealth > 0){
            strokeWeight(4)
            stroke(220,this.fade)
            strokeJoin(ROUND)
            fill(180,190,200,this.fade)
            beginShape()
            vertex(-30,-30)
            vertex(-30,-66)
            if(this.health>730){
              vertex(-12,-72)
            }else{
              vertex(-24,-68)
              vertex(-12,-48)
            }
            vertex(-12,-36)
            endShape(CLOSE)
          }
          stroke(80,70,60,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(100,90,80,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if(this.health>200){//Arm
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(100,90,80,this.fade)
          ellipse(0,-45,18,36)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          fill(0,this.fade) 
          ellipse(-4,-72,4,4)
          ellipse(-12,-72,4,4)
          if(this.shieldHealth > 0){
            strokeWeight(4)
            stroke(220,this.fade)
            fill(180,190,200,this.fade)
            beginShape()
            vertex(-30,-30)
            vertex(-30,-66)
            if(this.shieldHealth > 670){
              vertex(-12,-60)
            }else{
              vertex(-24,-64)
              vertex(-12,-48)
            }
            vertex(-12,-24)
            endShape(CLOSE)
          }
          strokeJoin(MITER)
        break
        case 8:
          stroke(200,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(200,20,20,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(200,20,20,this.fade)
          ellipse(0,-45,18,36)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          fill(0,this.fade) 
          ellipse(-4,-72,4,4)
          ellipse(-12,-72,4,4)
          if(this.health>1130){
            fill(200,20,20,this.fade)
            arc(0,-75,36,36,-180,90)
            fill(120,this.fade)
            rect(-15,-71,15,2)
            rect(-15,-75,2,4)
            rect(-9,-75,2,4)
          }else if(this.health>660){
            fill(200,20,20,this.fade)
            arc(0,-75,36,36,-180,60)
            fill(120,this.fade)
            rect(-15,-71,8,2)
            rect(-15,-75,2,4)
            rect(-9,-75,2,4)
          }else if(this.health>200){
            fill(200,20,20,this.fade)
            arc(0,-75,36,36,-150,15)
          }
        break
        case 9://Punk
          stroke(100,120,120,this.fade);
          strokeWeight(4);
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0);
          line(4,-30,8+sin(this.rate[0]*18)*3,0);
          stroke(60,this.fade);
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3);
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3);
          }
          noStroke();
          fill(60,this.fade);
          ellipse(0,-45,18,36);
          fill(240,120,120,this.fade);
          arc(0,-75,48,48,-135,-45);
          fill(120,240,240,this.fade);
          arc(0,-75,48,48,-105,-75);
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade);
          ellipse(0,-75,30,30);
          fill(0,this.fade);
          ellipse(-4,-72,4,4);
          ellipse(-12,-72,4,4);
          break;
        case 10:
          stroke(40,50,40,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(30,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noFill()
          stroke(120,this.fade)
          strokeWeight(3)
          arc(0,-72,16,40,-180,-90)
          noStroke()
          fill(30,this.fade)
          ellipse(0,-45,18,36)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          fill(0,this.fade)
          ellipse(-4,-72,7,6)
          rect(-12,-73,8,2)
          ellipse(-12,-72,7,6)
          stroke(120,this.fade)
          noFill()
          strokeWeight(3)
          arc(0,-72,16,40,-90,0)
          fill(100,this.fade)
          ellipse(8,-72,12,12)
        break
        case 11:
          if(currentJam===2||currentJam===8){
            fill(255,50,50,this.fade/5)
            rect(0,-80,240,8)
            fill(255,150,50,this.fade/5)
            rect(0,-72,240,8)
            fill(255,255,50,this.fade/5)
            rect(0,-64,240,8)
            fill(50,255,50,this.fade/5)
            rect(0,-56,240,8)
            fill(50,50,255,this.fade/5)
            rect(0,-48,240,8)
            fill(255,50,255,this.fade/5)
            rect(0,-40,240,8)
          }
          stroke(225,200,225,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(250,225,250,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(250,225,250,this.fade)
          ellipse(0,-45,18,36)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          fill(0,this.fade)
          ellipse(-4,-72,4,4)
          ellipse(-12,-72,4,4)
          fill(255,this.fade)
          for(let a=0;a<10;a++){
            ellipse(sin(this.rate[0]*(36+a)+a*a*25)*24,-96+a*8,3,3)
          }
        break
        case 12:
          strokeWeight(6)
          noFill()
          stroke(255,this.fade*(1-(this.time%30)/30))
          ellipse(0,-45,(this.time%30)*2,(this.time%30)*4)
          stroke(220,220,180,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(240,240,200,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(240,240,200,this.fade)
          ellipse(0,-45,18,36)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          fill(0,this.fade)
          ellipse(-4,-72,4,4)
          ellipse(-12,-72,4,4)
        break
        case 13:
          stroke(40,40,80,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          if(this.eating){
            if((currentJam === 3)||(currentJam === 8)){
              noStroke()
              fill(40,this.fade/5)
              arc(0,-45,240,240,-this.rate[2]*24+90,-this.rate[2]*24+120)
              stroke(40,this.fade)
              strokeWeight(3)
              line(0,-45,sin(this.rate[2]*24)*120,-45+cos(this.rate[2]*24)*120)
              strokeWeight(4)
              stroke(60,60,100,this.fade)
              line(0,-45,sin(this.rate[2]*12)*27,-45+cos(this.rate[2]*12)*27)
              if(this.health>this.maxHealth/2){
                line(0,-45,-sin(this.rate[2]*12)*27,-45-cos(this.rate[2]*12)*27)
              }
            }else{
              line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
              if(this.health>this.maxHealth/2){
                line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
              }
            }
          }else{
            stroke(60,60,100,this.fade)
            line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
            if(this.health>this.maxHealth/2){
              line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
            }
          }
          noStroke()
          fill(60,60,100,this.fade)
          ellipse(0,-45,18,36)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          strokeWeight(1)
          stroke(60,this.fade) 
          fill(240,this.fade)
          rect(-7,-74,6,5)
          rect(-15,-74,6,5)
          line(-7,-72,-9,-72)
          strokeWeight(3)
          stroke(80,120,200,this.fade)
          fill(80,120,200,this.fade)
          arc(0,-80,30,20,-180,0)
          line(-24,-80,15,-80)
        break
        case 14:
          stroke(40,80,120,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          if((currentJam === 3)||(currentJam === 8)){
            strokeWeight(4)
            stroke(60,100,140,this.fade)
            line(0,-45,sin(this.rate[2]*12)*27,-45+cos(this.rate[2]*12)*27)
            if(this.health>this.maxHealth/2){
              line(0,-45,-sin(this.rate[2]*12)*27,-45-cos(this.rate[2]*12)*27)
            }
          }else{
            stroke(60,100,140,this.fade)
            line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
            if(this.health>this.maxHealth/2){
              line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
            }
          }
          noStroke()
          fill(60,100,140,this.fade)
          ellipse(0,-45,18,36)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          fill(0,this.fade) 
          ellipse(-4,-72,4,4)
          ellipse(-12,-72,4,4)
          stroke(80,200,200,this.fade)
          fill(80,200,200,this.fade)
          arc(0,-80,30,20,-180,0)
          line(-24,-80,16,-80)
        break
        case 15:
          stroke(160,80,80,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(120,60,60,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(80,this.fade)
          rect(-42,-63,18,30,3)
          fill(40,this.fade)
          rect(-40,-61,14,6,2)
          rect(-40,-51,6,4,2)
          rect(-32,-51,6,4,2)
          rect(-40,-45,6,4,2)
          rect(-32,-45,6,4,2)
          rect(-40,-39,6,4,2)
          rect(-32,-39,6,4,2)
          fill(120,60,60,this.fade)
          ellipse(0,-45,18,36)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          strokeWeight(1.5)
          stroke(120,this.fade)
          fill(200,this.fade) 
          ellipse(-4,-72,5,5)
          ellipse(-12,-72,5,5)
          line(-6.5,-72,-9.5,-72)
        break
        case 16: case 17://8-bit
          stroke(60,80,100,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(120,80,40,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if(this.health>100){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(120,80,40,this.fade)
          rect(-8,-61,16,32)
          fill(255,this.fade)
          triangle(4,-70,-20/3,-70,-4,-50)
          fill(200,50,50,this.fade)
          quad(-4,-49,-14/3,-55,-4/3,-70,-2,-55)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          rect(-13,-88,26,26)
          fill(0,this.fade)
          ellipse(-4,-72,4,4)
          ellipse(-12,-72,4,4)
          if(this.type==17&&this.health>200){
            strokeJoin(ROUND)
            stroke(255,150,0,this.fade)
            strokeWeight(4)
            fill(255,150,0,this.fade)
            line(-15,-87,15,-87)
            if(this.health>440){
              triangle(-10,-87,10,-87,0,-103)
            }else if(this.health>320){
              quad(-10,-87,10,-87,5,-95,-5,-95)
            }
            strokeJoin(MITER)
          }
        break
        case 18:
          stroke(40,50,40,this.fade)
          strokeWeight(8)
          line(-10,-45,-15-sin(this.rate[0]*18)*5,0)
          line(10,-45,15+sin(this.rate[0]*18)*5,0)
          stroke(30,this.fade)
          line(-12,-72,-54+this.rate[3],-60-sin(this.rate[1]*9)*3)
          if(this.health>this.maxHealth/2){
            line(-12,-84,-54+this.rate[3],-96+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(30,this.fade)
          ellipse(0,-75,48,96)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-135,30,30)
          fill(0,this.fade) 
          ellipse(-4,-132,4,4)
          ellipse(-12,-132,4,4)
          if(this.rate[4]>0){
            this.rate[4]--
            if(this.rate[4]>=5){
              this.rate[3]+=6
            }else{
              this.rate[3]-=6
            }
          }
        break
        case 19:
            stroke(75,this.fade)
            strokeWeight(4)
            line(-4,-24,-7-sin(this.rate[0]*18)*3,0)
            line(4,-24,7+sin(this.rate[0]*18)*3,0)
            stroke(50,this.fade)
            line(-6,-34,-21,-30-sin(this.rate[1]*9)*3)
            if(this.health>this.maxHealth/2){
              line(-6,-40,-21,-44+sin(this.rate[1]*9)*3)
            }
            noStroke()
            fill(50,this.fade)
            ellipse(0,-34,18,27)
            fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
            ellipse(0,-60,30,30)
            fill(0,this.fade) 
            ellipse(-4,-57,4,4)
            ellipse(-12,-57,4,4)
          break
        case 20:
          stroke(50,0,50,this.fade/3)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(50,0,50,this.fade/3)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(50,0,50,this.fade/3)
          ellipse(0,-45,18,36)
          fill(100,0,100,this.fade/3)
          ellipse(0,-75,30,30)
          fill(0,this.fade/3) 
          ellipse(-4,-72,4,4)
          ellipse(-12,-72,4,4)
        break
        case 21://Techie
          strokeWeight(2);
          stroke(80,this.fade);
          noFill();
          arc(0,-75,36,36,-180,0);
          fill(120,this.fade);
          ellipse(-15,-75,12,12);
          ellipse(15,-75,12,12);
          stroke(60,150,60,this.fade);
          strokeWeight(4);
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0);
          line(4,-30,8+sin(this.rate[0]*18)*3,0);
          stroke(50,125,50,this.fade);
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3);
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3);
          }
          noStroke();
          fill(50,125,50,this.fade);
          ellipse(0,-45,18,36);
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade);
          ellipse(0,-75,30,30);
          fill(0,this.fade);
          ellipse(-4,-72,4,4);
          ellipse(-12,-72,4,4);
          fill(100,255,100,this.fade/5);
          if (this.shieldHealth < 0){
            this.shieldHealth = 0;
          }
          rect(-30,15-this.shieldHealth/this.maxShieldHealth*120,60,this.shieldHealth/this.maxShieldHealth*120);
        break
        case 22://Gadgeter
          stroke(80,120,80,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(60,100,60,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(180,this.fade)
          rect(-36,-45-sin(this.rate[1]*9)*3,12,12)
          fill(200,this.fade)
          rect(-34,-43-sin(this.rate[1]*9)*3,8,8)
          fill(60,100,60,this.fade)
          ellipse(0,-45,18,36)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          strokeWeight(1.5)
          stroke(120,this.fade)
          fill(200,this.fade) 
          ellipse(-4,-72,5,5)
          ellipse(-12,-72,5,5)
          line(-6.5,-72,-9.5,-72)
        break
        case 23://Boombox
          stroke(255,100,0,this.fade);
          strokeWeight(4);
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0);
          line(4,-30,8+sin(this.rate[0]*18)*3,0);
          stroke(255,150,0,this.fade);
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3);
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3);
          }
          noStroke();
          fill(40,this.fade);
          rect(-60,-60,36,24,3);
          fill(60,this.fade);
          ellipse(-51,-48,12,12);
          ellipse(-33,-48,12,12);
          fill(255,150,0,this.fade);
          ellipse(0,-45,18,36);
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade);
          ellipse(0,-75,30,30);
          fill(0,this.fade); 
          ellipse(-4,-72,4,4);
          ellipse(-12,-72,4,4);
          break;
        case 24:
          break;
        case 25://Peashooter Zombie
        stroke(60,80,100,this.fade)
        strokeWeight(4)
        line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
        line(4,-30,8+sin(this.rate[0]*18)*3,0)
        stroke(120,80,40,this.fade)
        line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
        if((this.health>100)||((this.health > 175)&&(this.type === 3))){//Flag Zombie
          line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
        }
        noStroke()
        fill(120,80,40,this.fade)
        ellipse(0,-45,18,36)
        fill(255,this.fade)
        triangle(4,-70,-20/3,-70,-4,-50)
        fill(200,50,50,this.fade)
        quad(-4,-49,-14/3,-55,-4/3,-70,-2,-55)
        fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
        ellipse(0,-75,30,30)
        fill(0,this.fade)
        ellipse(-4,-72,4,4)
        ellipse(-12,-72,4,4)
          if (this.shieldHealth > 0){//Peashooter Head
            fill(25,200,25);
            ellipse(-21,-48,30,30);
            rect(-51,-55,30,16);
            ellipse(-51,-47,6,16);
            fill(0);
            ellipse(-51,-47,4,12);
            ellipse(-28,-54,5,5);
          }
          break;
        case 26://Wall-nut Zombie
        stroke(60,80,100,this.fade)
        strokeWeight(4)
        line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
        line(4,-30,8+sin(this.rate[0]*18)*3,0)
        stroke(120,80,40,this.fade)
        line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
        if((this.health>100)||((this.health > 175)&&(this.type === 3))){//Flag Zombie
          line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
        }
        noStroke()
        fill(120,80,40,this.fade)
        ellipse(0,-45,18,36)
        fill(255,this.fade)
        triangle(4,-70,-20/3,-70,-4,-50)
        fill(200,50,50,this.fade)
        quad(-4,-49,-14/3,-55,-4/3,-70,-2,-55)
        fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
        ellipse(0,-75,30,30)
        fill(0,this.fade)
        ellipse(-4,-72,4,4)
        ellipse(-12,-72,4,4)
          //Wall-nut
          fill(120,60,15);
          if(this.shieldHealth > this.maxShieldHealth*2/3){
            ellipse(-30,-48,40,54);
          }else if(this.shieldHealth > this.maxShieldHealth/3){
            arc(-30,-48,40,54,-60,285);
          }else if(this.shieldHealth > 0){
            arc(-30,-48,40,54,-115,-75);
            arc(-30,-48,40,54,-60,230);
          }
          if(this.shieldHealth > 0){
            fill(0);
            ellipse(-24,-54,6,6);
            ellipse(-36,-54,6,6);
          }
          noFill();
          stroke(0);
          strokeWeight(2);
          if(this.shieldHealth > (this.maxShieldHealth-200)/2){
            arc(-30,-38,20,-6+12*(this.shieldHealth)/(this.maxShieldHealth),0,180);
          }else if(this.shieldHealth === this.maxShieldHealth/2){
            line(-30,-28,10,-40);
          }else if(this.shieldHealth > 0){
            arc(-30,-38,20,-6+12*(this.shieldHealth)/(this.maxShieldHealth),-180,0);
          }
          break;
        case 27://Cherry Bomb Zombie
        stroke(60,80,100,this.fade)
        strokeWeight(4)
        line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
        line(4,-30,8+sin(this.rate[0]*18)*3,0)
        stroke(120,80,40,this.fade)
        line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
        if((this.health>100)||((this.health > 175)&&(this.type === 3))){//Flag Zombie
          line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
        }
        noStroke()
        fill(120,80,40,this.fade)
        ellipse(0,-45,18,36)
        fill(255,this.fade)
        triangle(4,-70,-20/3,-70,-4,-50)
        fill(200,50,50,this.fade)
        quad(-4,-49,-14/3,-55,-4/3,-70,-2,-55)
        fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
        ellipse(0,-75,30,30)
        fill(0,this.fade)
        ellipse(-4,-72,4,4)
        ellipse(-12,-72,4,4)
          //Cherry Bomb
          if (this.shieldHealth > 0){
            stroke(25,175,25);
            strokeWeight(6);
            line(-42,-36,-22,-53);
            line(-2,-36,-22,-53);
            noStroke();
            fill(225,25,25);
            ellipse(-42,-28,30,30);
            ellipse(-2,-28,30,30);
            fill(0);
            ellipse(-50,-26,6,6);
            ellipse(-40,-26,6,6);
            ellipse(-4,-26,6,6);
            ellipse(6,-26,6,6);
          }
        break
        case 28://Fume Shroom Zombie
          if(this.graphical.previousAttackAnim>0){
            fill(200,100,250,this.graphical.previousAttackAnim*8)
            ellipse(-220+this.graphical.previousAttackAnim*9,-48,360-this.graphical.previousAttackAnim*18,60-this.graphical.previousAttackAnim*3)
            this.graphical.previousAttackAnim--
          }
          stroke(60,80,100,this.fade)
          strokeWeight(4)
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0)
          line(4,-30,8+sin(this.rate[0]*18)*3,0)
          stroke(120,80,40,this.fade)
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3)
          if((this.health>100)||((this.health > 175)&&(this.type === 3))){//Flag Zombie
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3)
          }
          noStroke()
          fill(120,80,40,this.fade)
          ellipse(0,-45,18,36)
          fill(255,this.fade)
          triangle(4,-70,-20/3,-70,-4,-50)
          fill(200,50,50,this.fade)
          quad(-4,-49,-14/3,-55,-4/3,-70,-2,-55)
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade)
          ellipse(0,-75,30,30)
          fill(0,this.fade)
          ellipse(-4,-72,4,4)
          ellipse(-12,-72,4,4)
          //Fume Shroom
          if (this.shieldHealth > 0){
            fill(150,50,200);
            ellipse(-30,-48,48,30);
            rect(-55,-54,20,12);
            ellipse(-55,-48,10,18);
            fill(100,50,150);
            ellipse(-39,-50,14,14);
            ellipse(-21,-46,12,12);
            fill(0);
            ellipse(-55,-48,6,12);
          }
          break;
        case 29://Squash Zombie
          stroke(60,80,100,this.fade);
          strokeWeight(4);
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0);
          line(4,-30,8+sin(this.rate[0]*18)*3,0);
          stroke(120,80,40,this.fade);
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3);
          if((this.health>100)||((this.health > 175)&&(this.type === 3))){//Flag Zombie
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3);
          }
          noStroke()
          fill(120,80,40,this.fade);
          ellipse(0,-45,18,36);
          fill(255,this.fade);
          triangle(4,-70,-20/3,-70,-4,-50);
          fill(200,50,50,this.fade);
          quad(-4,-49,-14/3,-55,-4/3,-70,-2,-55);
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade);
          ellipse(0,-75,30,30);
          fill(0,this.fade);
          ellipse(-4,-72,4,4);
          ellipse(-12,-72,4,4);
          //Squash
          if (this.shieldHealth > 0){
            fill(100,150,100);
            rect(-42,-83,4,4);
            fill(100,200,100);
            arc(-40,-40,50,40,0,180);
            quad(-15,-40,-65,-40,-55,-70,-25,-70);
            arc(-40,-70,30,20,-180,0);
            fill(0);
            ellipse(-40,-45,6,6);
            ellipse(-55,-45,6,6);
          }
          break;
        case 30://Dazey Zombie
          stroke(60,80,100,this.fade);
          strokeWeight(4);
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0);
          line(4,-30,8+sin(this.rate[0]*18)*3,0);
          stroke(120,80,40,this.fade);
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3);
          if((this.health>100)||((this.health > 175)&&(this.type === 3))){//Flag Zombie
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3);
          }
          noStroke();
          fill(120,80,40,this.fade);
          ellipse(0,-45,18,36);
          fill(255,this.fade);
          triangle(4,-70,-20/3,-70,-4,-50);
          fill(200,50,50,this.fade);
          quad(-4,-49,-14/3,-55,-4/3,-70,-2,-55);
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade);
          ellipse(0,-75,30,30);
          fill(0,this.fade);
          ellipse(-4,-72,4,4);
          ellipse(-12,-72,4,4);
          //Dazey
          if (this.shieldHealth > 0){
            fill(120,180,85);
            rect(-33,-40,6,18);
            fill(130,190,95);
            ellipse(-38,-22,11,7);
            ellipse(-22,-22,11,7);
            ellipse(-30,-19,11,7);
            translate(-30,-56);
            fill(255,75,75);
            for(let a=0;a<15;a++){
              rotate(24);
              arc(14,0,12,7,-90,90);
            }
            translate(30,56);
            fill(255,125,125);
            ellipse(-30,-56,30,30);
            fill(0);
            ellipse(-36,-59,5,5);
            ellipse(-24,-59,5,5);
          }
          break;
        case 31://Garlic Zombie
          stroke(60,80,100,this.fade);
          strokeWeight(4);
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0);
          line(4,-30,8+sin(this.rate[0]*18)*3,0);
          stroke(120,80,40,this.fade);
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3);
          if((this.health>100)||((this.health > 175)&&(this.type === 3))){//Flag Zombie
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3);
          }
          noStroke();
          fill(120,80,40,this.fade);
          ellipse(0,-45,18,36);
          fill(255,this.fade);
          triangle(4,-70,-20/3,-70,-4,-50);
          fill(200,50,50,this.fade);
          quad(-4,-49,-14/3,-55,-4/3,-70,-2,-55);
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade);
          ellipse(0,-75,30,30);
          fill(0,this.fade);
          ellipse(-4,-72,4,4);
          ellipse(-12,-72,4,4);
          //Garlic
          if (this.shieldHealth > 0){
            fill(220,220,200);
            if(this.shieldHealth>this.maxShieldHealth/2){
              ellipse(-30,-48,48,48);
              triangle(-45,-66,-15,-66,-30,-78);
            }else{
              arc(-30,-48,48,48,-30,210);
              triangle(cos(30)*-24-30,-48-sin(30)*24,cos(30)*24-30,-48-sin(30)*24,-30,-47);
            }
            fill(0);
            ellipse(-36,-46,6,6);
            ellipse(-48,-46,6,6);
          }
        break
        case 9999://Test
          stroke(40,50,40,this.fade);
          strokeWeight(4);
          line(-4,-30,-8-sin(this.rate[0]*18)*3,0);
          line(4,-30,8+sin(this.rate[0]*18)*3,0);
          stroke(30,this.fade);
          line(-6,-45,-24,-39-sin(this.rate[1]*9)*3);
          if(this.health>this.maxHealth/2){
            line(-6,-51,-24,-57+sin(this.rate[1]*9)*3);
          }
          noStroke();
          fill(30,this.fade);
          ellipse(0,-45,18,36);
          fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade);
          ellipse(0,-75,30,30);
          fill(0,this.fade);
          ellipse(-4,-72,4,4);
          ellipse(-12,-72,4,4);
          break;
        default://Placeholder Hitbox for Nonexistent Zombies
          scale(1/this.size);
          translate(-this.x-15,-this.y-80);
          fill(0,0,0);
          rect(this.x, this.y,30,80);
          return;
      }
    }else if(this.determineColor()[0]!==0||this.determineColor()[1]!==0||this.determineColor()[2]!==0){
      fill(this.determineColor()[0],this.determineColor()[1],this.determineColor()[2],this.fade*this.maxFade()*0.8)
      ellipse(0,-30,40,40)
    }
    scale(1/this.size);
    translate(-this.x-15,-this.y-80);
  }

  //Determine color of zombie face
  determineColor(){
    let performDraw = false;
    try{
      if (!currentLevel["type"].includes(11)){
        performDraw = true;
      } 
    }catch(e){//Almanac draw
      performDraw = true;
    }
    if(performDraw){
      this.color=[240,220,180];
    }else{
      this.color=[0,0,0]
    }
    if(this.chillTimer>0){
      this.color=mergeArray(this.color,[100,255,255],0.6);
    }
    if(this.stunTimer>0){//Noxious Stun (Dazey and Stunion)
      this.color = mergeArray(this.color,[100,0,100],0.4);
    }
    if(this.freezeTimer>0){//Freeze
      this.color = mergeArray(this.color,[200,255,255],0.4);
    }
    if(this.solarStunTimer>0){//Solar Tomato Stun
      this.color = mergeArray(this.color,[255,255,150],0.4);
    }
    if(this.damageTimer>0){
      this.color=mergeArray(this.color,[255,0,0],1-this.damageTimer/15);
    }
    if(this.protected){
      this.color=mergeArray(this.color,[255,120,255],0.2);
    }
    if(this.permanentDamage>0){
      this.color=mergeArray(this.color,[240,255,255],0.5+sin(this.time*this.permanentDamage)*0.5);
    }
    return this.color;
  }
  
  maxFade(){
    return max(this.permanentDamage,this.damageTimer/15,this.stunTimer/30,this.freezeTimer/30,this.solarStunTimer/30,this.chillTimer/30)
  }

  //Move and Change Method
  move(){
    //General Incrementation
    this.time++
    if(this.fade < 255){
      this.fade += 25.5;
    }
    this.stunTimer -= levelSpeed;
    this.freezeTimer -= levelSpeed;
    this.solarStunTimer -= levelSpeed;
    this.chillTimer -= levelSpeed;
    this.damageTimer -= levelSpeed;
    if (!this.isStunned()){//Not Stunned
      if (this.chillTimer > 0){
        this.reload -= levelSpeed/2;
      }else{
        this.reload -= levelSpeed;
      }
    }
    //Garlic Zombie Garlic Counter
    if ((this.type === 31)&&(this.shieldHealth > 0)&&(!this.isStunned())){
      this.garlicCounter += 0.2*levelSpeed;
    }
    //Peashooter Zombie Shooting
    if ((this.reload <= 0)&&(this.type === 25)&&(this.shieldHealth > 0)){
      this.reload = 90;
      new Projectile(this.x-30, this.y+23, this.lane, 1, 25, -1, 1, 0, false);//Spawn Pea
    }
    //Fume Shroom Zombie Shooting
    if ((this.reload <= 0)&&(this.type === 28)&&(this.shieldHealth > 0)){
      this.reload = 90;
      this.graphical.previousAttackAnim=20;
      for (let currentPlant of allPlants){
        if ((currentPlant.lane === this.lane)&&(currentPlant.x + 60 > this.x - 320)&&(currentPlant.x < this.x)){
          currentPlant.take(15);
        }
      }
    }
    //Cherry Bomb Zombie Explosion
    if ((this.reload > 0)&&(this.reload < 10)&&(this.type === 27)){
      this.shieldHealth = 0;
      this.reload = -1;
      new Particle(0, this.x, this.y+50);
      for (let currentPlant of allPlants){
        if ((currentPlant.x + 40 > this.x - 85)&&(currentPlant.x + 40 < this.x + 115)&&(currentPlant.lane >= this.lane - 1)&&(currentPlant.lane <= this.lane + 1)){//3x3 Range
          currentPlant.take(2000);
        }
      }
    }
    //Dazey Zombie Stun
    if ((this.reload > 0)&&(this.reload < 10)&&(this.type === 30)){
      this.shieldHealth = 0;
      this.reload = -1;
      //new Particle(0, this.x, this.y+30);//Needs to be replaced
      for (let currentPlant of allPlants){
        if ((currentPlant.x + 40 > this.x - 85)&&(currentPlant.x + 40 < this.x + 115)&&(currentPlant.lane >= this.lane - 1)&&(currentPlant.lane <= this.lane + 1)){//3x3 Range
          currentPlant.stunTimer = 300;
        }
      }
      new Particle(2,this.x,this.y+50);
    }
    //Garg Smash Stun
    if ((this.reload > 0)&&(this.type === 18)){
      this.eating = true;
    }
    //Techie shield only on during jam
    if ((this.type === 21)&&(!this.inJam())){
      this.shieldHealth = 0;
    }
    //Valley Lily Damage
    this.health -= this.permanentDamage*levelSpeed;
    this.shieldHealth -= this.permanentDamage*levelSpeed;
    //Garlic Lane Change
    if (this.garlicCounter >= 60){
      this.garlicCounter = 0;
      this.stunTimer = 60;
      if (this.lane === 1){
        this.lane = 2;
        this.y += 100;
      }else if (this.lane === 5){
        this.lane = 4;
        this.y -= 100;
      }else{
        let laneChange = -1 + 2*floor(random()*2);
        this.lane += laneChange;
        this.y += laneChange*100;
      }
    }
    //Glitter Protection
    if ((this.type === 11)&&(this.inJam())){
      for (let currentZombie of allZombies){
        if ((currentZombie.x > this.x + 30)&&(currentZombie.x < this.x + 270)&&(currentZombie.type !== 11)&&(currentZombie.lane === this.lane)){//In three tile range, glitters cannot protect glitters
          currentZombie.protected = true;
        }
      }
    }
    //Determine Move Speed
    if ((!this.isStunned())&&(this.eating === false)){
      //Determine Jam Speed and Chill
      let jamMultiplier;
      let chillMultiplier = 1;
      let positionMultiplier = 1;
      if (this.x > 920){//Make Zombies Move Onscreen Faster
        positionMultiplier = 2;
      }
      if (this.chillTimer > 0){
        chillMultiplier = 0.5;
      }
      switch(currentJam){
        case 0://None
          jamMultiplier = 1;
          break;
        case 1://Punk
          jamMultiplier = 1.25;
          break;
        case 2://Pop
          jamMultiplier = 0.75;
          break;
        case 3://Rap
          jamMultiplier = 1;
          break;
        case 4://8-bit
          jamMultiplier = 0.9;
          break;
        case 5://Metal
          jamMultiplier = 1.1;
          break;
        case 6://Techno
          jamMultiplier = 1;
          break;
        case 7://Ballad
          jamMultiplier = 2;
          break;
        case 8://All
          jamMultiplier = 1;
          break; 
        default:
          jamMultiplier = 1;
      }
      if ((this.shieldHealth > 0)||(this.inJam())){//With Shield or In Jam
        this.x -= this.altSpeed*0.3*jamMultiplier*chillMultiplier*levelSpeed*positionMultiplier; 
        this.rate[0] += this.altSpeed*0.3*jamMultiplier*chillMultiplier*levelSpeed*positionMultiplier;
      }else{//Regular Speed 
        this.x -= this.speed*0.3*jamMultiplier*chillMultiplier*levelSpeed*positionMultiplier; 
        this.rate[0] += this.speed*0.3*jamMultiplier*chillMultiplier*levelSpeed*positionMultiplier;
      }
    }
    //Gadgeter Change Plant
    if ((this.type === 22)&&(this.reload <= 0)&&(this.inJam())){
      this.reload = 1080;
      let unchangedPlants = [];
      for (let a = 0; a < allPlants.length; a++){
        if ((allPlants[a].changed === false)&&(allPlants[a].health < 8000)&&(allPlants[a].endangered === false)){//Cannot be previously changed or be an instant kill
          unchangedPlants.push(a);
        }
      }
      if (unchangedPlants.length === 0){
        return 0;
      }
      let randomIndex = floor(random()*unchangedPlants.length);
      let oldPlant = allPlants[unchangedPlants[randomIndex]];
      let plantType = null;
      let plantTier = null;
      let plantData = null;
      if (oldPlant.sunCost <= 25){//Puff Shroom Tier 1
        plantType = 16;
        plantTier = 1;
      }else if (oldPlant.sunCost <= 100){//Potato Mine Tier 1
        plantType = 4;
        plantTier = 1;
      }else if (oldPlant.sunCost <= 200){//Pepper Cannon Tier 2
        plantType = 24;
        plantTier = 2;
      }else if (oldPlant.sunCost <= 300){//Peashooter Tier 2
        plantType = 18;
        plantTier = 2;
      }else if (oldPlant.sunCost <= 450){//Threepeater Tier 1
        plantType = 21;
        plantTier = 1;
      }else{//Coconut Cannon Tier 1
        plantType = 25;
        plantTier = 1;
      }
      //Find Plant Data
      for (let currentPlant of plantStat){
        if (currentPlant.type === plantType){
          if (plantTier === 1){//Tier 1
            plantData = currentPlant["t1"];
            break;
          }else{//Tier 2
            plantData = currentPlant["t2"];
            break;
          }
        }
      }
      //Set old plant to be new plant
      if ((plantType === 4)||(plantType === 25)){//Immediately Arm Potato Mine and Coconut Cannon
        oldPlant.type = plantType;
        oldPlant.sun = plantData.sun;
        oldPlant.damage = plantData.damage; 
        oldPlant.health = plantData.health;
        oldPlant.eatable = plantData.eatable;
        oldPlant.reload = 0;
        oldPlant.maxReload = plantData.reload;
        oldPlant.projectileType = plantData.projectile;
        oldPlant.splashDamage = plantData.splashDamage
        oldPlant.changed = true;
        oldPlant.stunTimer = 0;
      }else{
        oldPlant.type = plantType;
        oldPlant.sun = plantData.sun;
        oldPlant.damage = plantData.damage; 
        oldPlant.health = plantData.health;
        oldPlant.eatable = plantData.eatable;
        oldPlant.reload = plantData.reload/4;
        oldPlant.maxReload = plantData.reload;
        oldPlant.projectileType = plantData.projectile;
        oldPlant.splashDamage = plantData.splashDamage
        oldPlant.changed = true;
        oldPlant.stunTimer = 0;
      }
    }
  }

  //General method for colision
  collision(){
    this.eating = false;
    //Collision with lawnmower
    if (lawnMowers.length !== 0){
      let laneMower = lawnMowers[this.lane - 1];
      if (laneMower.x < 1100){
        if ((this.x + 15 > laneMower.x)&&(this.x < laneMower.x + 40)){
          if (this.type !== 24){//Not Boss
            this.health  = 0;
          }
          if (laneMower.active === false){
            laneMower.active = true;
          }
        }
      }
    }
    //Collision with flowers (For Don't Trample the Flower Levels)
    if (currentLevel["type"].includes(7) === true){
      //Mark for pointbox
      let flowerLineX = currentLevel["flowerLine"];
      if ((this.x > flowerLineX)&&(this.x < flowerLineX + 20)){//If zombie is on flower, lose
        screen = "gameOver";
        running = false;
      }
    }
    //MC Collision
    if ((this.type === 13)&&!(this.isStunned())&&(this.inJam())){
      //Mark for pointbox
      for (let currentPlant of allPlants){
        if ((currentPlant.x + 60 > this.x - 80)&&(currentPlant.x < this.x + 110)
        &&(currentPlant.lane >= this.lane - 1)&&(currentPlant.lane <= this.lane + 1)&&(currentPlant.eatable === true)){//2.25 x 3 Microphone Swing
          currentPlant.take(10)
          this.eating = true;
        }
      }
      this.rate[2]++;
    }
    //Breakdancer Collision
    if ((this.type === 14)&&(this.inJam())){
      for (let currentZombie of allZombies){
        if ((currentZombie.x + 30 > this.x)&&(currentZombie.x < this.x + 30)
        &&(currentZombie.lane === this.lane)&&(currentZombie !== this)){//Breakdancer Jumps Other Zombies Forward
          currentZombie.x -= 120;
          if (currentZombie.x < 200){
            currentZombie.x = 200;
          }
        }
      }
      this.rate[2]++
    }
    //Boombox Activate on 7th column for 10 seconds
    if ((this.type === 23)&&(this.x <= 680)&&(this.playedMusic === false)){
      this.playedMusic = true;
      boomboxActive = true;
      currentJam = 7;
      setTimeout(function(){boomboxActive = false; currentJam = currentLevel["jams"][currentWave - 1];}, 10000);
    }
    //Glitter Clear Effect
    if (this.protected === true){
      this.stunTimer = 0;
      this.freezeTimer = 0;
      this.solarStunTimer = 0;
      this.chillTimer = 0;
    }
    //Collision with plants
    let plantCollision = [];
    if (!this.isStunned()){
      for (let currentPlant of allPlants){
        if ((this.x + 30 > currentPlant.x)&&(this.x < currentPlant.x + 60)&&(this.lane === currentPlant.lane)&&(currentPlant.eatable === true)){
          plantCollision.push(currentPlant);//Mark for pointbox
        }
      }
    }
    if (plantCollision.length > 0){
      this.eating = true;
      //Cherry Bomb Zombie Explosion Setup
      if ((this.type === 27)&&(this.reload < 0)&&(this.shieldHealth > 0)){
        this.reload = 60;
        return;
      }
      //Dazey Zombie Stun Setup
      if ((this.type === 30)&&(this.reload < 0)&&(this.shieldHealth > 0)){
        this.reload = 60;
        return;
      }
      //Collision
      let currentPlant = null;
      if (plantCollision.length === 1){
        currentPlant = plantCollision[0];
      }else if (plantCollision.length === 2){
        if (plantCollision[0].x < plantCollision[1].x){
          currentPlant = plantCollision[1];
        }else{
          currentPlant = plantCollision[0];
        }
      }
      //Instant Kills
      if ((currentPlant.type === 4)&&(currentPlant.reload <= 0)){//Potato Mine
        for (let currentZombie of allZombies){
          if ((currentZombie.x + 30 > currentPlant.x - 10)&&(currentZombie.x < currentPlant.x + 70)&&(currentZombie.lane === currentPlant.lane)){//Mark for pointbox
            currentZombie.determineDamage(currentPlant.damage);
          }
        }
        currentPlant.health = 0;
        new Particle(6,currentPlant.x+30,currentPlant.y+30);
      }else if ((currentPlant.type === 11)&&(currentPlant.reload <= 0)){//Spring Bean
        this.x += currentPlant.damage;
        for (let currentZombie of allZombies){
          if ((currentZombie !== this)&&(currentZombie.x + 30 > currentPlant.x)&&(currentZombie.x < currentPlant.x + 60)&&(currentZombie.lane === currentPlant.lane)){//Mark for pointbox
            currentZombie.x += currentPlant.damage;
          }
        }
        currentPlant.reload = currentPlant.maxReload;
      }else if ((currentPlant.type === 9)&&(currentPlant.reload <= 0)){//Primal Potato Mine
        for (let currentZombie of allZombies){
          if ((currentZombie.x + 30 > currentPlant.x - 170)&&(currentZombie.x < currentPlant.x + 230)&&(currentZombie.lane >= currentPlant.lane - 2)&&
          (currentZombie.lane <= currentPlant.lane + 2)&&(currentZombie.protected === false)){//Damage zombies in 5x5
            currentZombie.determineDamage(currentPlant.damage);
          }
        }
        currentPlant.health = 0;
        new Particle(7,currentPlant.x+30,currentPlant.y+30);
      }else if (currentPlant.type === 15){//Garlic
        currentPlant.take(this.determineEatSpeed(this))
        if (this.type !== 18){//Not Gargantuar
          this.garlicCounter += levelSpeed;
        }
        this.rate[1] += this.determineEatSpeed(this);
      }else{
        currentPlant.take(this.determineEatSpeed(this))
        this.rate[1] += this.determineEatSpeed(this);
      }
    }
    //Collision with projectile
    if (!((this.type === 20)&&(this.eating === false)&&((currentJam === 5)||(currentJam === 8)))){//If not shadow zobmie during metal jam
      for (let currentProjectile of allProjectiles){
        if ((this.x + 30 > currentProjectile.x)&&(this.x < currentProjectile.x + 20)&&(this.lane === currentProjectile.lane)
        &&(currentProjectile.used === false)&&(currentProjectile.toZombie === true)){
          currentProjectile.used = true;
          //Punk Zombie and jam is on and not stunned (Coconuts are not counted)
          if ((this.type === 9)&&((currentJam === 1)||(currentJam === 8))&&!(this.isStunned())&&(currentProjectile.type !== 9)){
            this.determineDamage(currentProjectile.damage, 0.2);//Punk takes 20% damage
            new Projectile(currentProjectile.x, currentProjectile.y, currentProjectile.lane,
              currentProjectile.type, currentProjectile.damage, -1.5*currentProjectile.speed, currentProjectile.tier, 0, false);//Send Projectile back
          }else{
            this.determineDamage(currentProjectile.damage);
            if ((currentProjectile.type === 3)&&(this.chillTimer < 480)){//Snow Pea
              this.determineChill(480);
            }else if ((currentProjectile.type === 4)&&(this.health <= 0)){//Spore Shroom Spore Spawn
              let spawnX = this.x + 15;
              //Find tile
              for (let currentTile of tiles){
                if ((spawnX >= currentTile.x)&&(spawnX < currentTile.x + 80)&&(this.y === currentTile.y)){//Correct Tile
                  if (currentTile.occupied === false){
                    let sporePlantTier = currentProjectile.tier;
                    let plantData;
                    for (let currentPlant of plantStat){//Find spore shroom stats
                      if (currentPlant.type === 20){
                        if (sporePlantTier === 1){//Tier 1
                          plantData = currentPlant["t1"];
                          break;
                        }else{//Tier 2
                          plantData = currentPlant["t2"];
                          break;
                        }
                      }
                    }
                    let newPlant = new Plant(20, currentTile.x + 10, currentTile.y + 10, 0, plantData.damage, plantData.health, 
                      plantData.eatable, plantData.reload, plantData.projectile, plantData.splashDamage, sporePlantTier);
                    currentTile.plantID = newPlant.id;
                    currentTile.occupied = true;
                  }
                  break;
                }
              }
            }else if (currentProjectile.type === 10){//Valley Lily Damage
              this.permanentDamage += 0.165;
            }
            if (currentProjectile.splashDamage !== 0){//Coconut and Pepper
              if(currentProjectile.type==9){
                new Particle(8,currentProjectile.x+10,currentProjectile.y+10)
              }
              for (let currentZombie of allZombies){
                if ((currentZombie.x + 30 > currentProjectile.x - 90)&&(currentZombie.x < currentProjectile.x + 150)&&(currentZombie.lane >= currentProjectile.lane - 1)&&
                (currentZombie.lane <= currentProjectile.lane + 1)&&(currentZombie.protected === false)&&(currentZombie !== this)){
                  currentZombie.determineDamage(currentProjectile.splashDamage);
                }
              }
            }
          }
        }
      }
    }
    //Lose Scenario and I Zombie Win Scenario
    if ((this.x < 90)&&(this.x > 50)&&(this.health > 0)){
      if (currentLevel.type.includes(14)){//I, Zombie
        this.lane = this.lane + 10;
        this.x = 45;
        this.speed = 0;
        this.altSpeed = 0;
        this.eatSpeed = 0;
        this.altEatSpeed = 0;
        //Determine if brain is to be taken
        let laneTaken = false;
        for (let currentZombie of allZombies){
          if (((currentZombie.x < 50)&&(currentZombie.y === this.y))&&(currentZombie !== this)){
            laneTaken = true;
            break;
          }
        }
        if (!laneTaken){
          currentWave++;
        }
      }else{
        screen = "gameOver";
        running = false;
      }
    }
  }

  //Calculate individual eat speed for zombies
  determineEatSpeed(currentGarg = null){
    if (this.type === 18){//Gargantuar Smash
      if (this.reload <= 0){//Prepare to smash
        this.reload = 160;
        return 0;
      }else if ((this.reload > 1)&&(this.reload <= 10)){//Smash
        this.reload = 1;
        this.rate[4]=10;
        if ((currentJam === 5)||(currentJam === 8)){//Special ability: destroy plants in front only while smashing
          let rightPlant = null;
          //Find Plant farthest to the right in front of garg
          for (let currentPlant of allPlants){
            if ((rightPlant === null)&&(currentPlant.lane === currentGarg.lane)
            &&(currentPlant.x < currentGarg.x - 61)&&(currentPlant.eatable === true)){//Find first plant
              rightPlant = currentPlant;
              continue;
            }
            if (rightPlant !== null){//If Plant Exists
              if ((currentPlant.lane === currentGarg.lane)&&(currentPlant.x > rightPlant.x)
              &&(currentPlant.x < currentGarg.x - 61)&&(currentPlant.eatable === true)){//Compare x with other plants
                rightPlant = currentPlant;
              }
            }
          }
          if (rightPlant !== null){//Such plant exists
            rightPlant.take(500)
          }        
        }        
        return 2000;
      }else{//While smashing
        return 0;
      }
    }
    let finalEatSpeed = 0;
    let jamMultiplier = 1;
    let chillMultiplier = 1;
    if (this.chillTimer > 0){
      chillMultiplier = 0.5;
    }
    //Jam Eat Speed
    switch(currentJam){
      case 0://None
        jamMultiplier = 1;
        break;
      case 1://Punk
        jamMultiplier = 1.25;
        break;
      case 2://Pop
        jamMultiplier = 0.75;
        break;
      case 3://Rap
        jamMultiplier = 1;
        break;
      case 4://8 bit
        jamMultiplier = 1;
        break;
      case 5://Metal
        jamMultiplier = 1.1;
        break;
      case 6://Techno
        jamMultiplier = 1;
        break;
      case 7://Ballad
        jamMultiplier = 1.5;
        break;
      case 8://All
        jamMultiplier = 1;
        break;
      default:
        jamMultiplier = 1;
    }
    if ((this.shieldHealth > 0)||(this.inJam())){//Has Positive Shield Health or Matching Jam
      finalEatSpeed = 1.4*levelSpeed*jamMultiplier*this.altEatSpeed*chillMultiplier;
    }else{//Normal or No Shield
      finalEatSpeed = 1.4*levelSpeed*jamMultiplier*this.eatSpeed*chillMultiplier;
    }
    if ((this.type === 29)&&(this.shieldHealth > 0)){//Squash Zombie
      finalEatSpeed = 2000;
      this.shieldHealth = 0;
      new Particle(10,this.x-20,this.y+60);
    }
    return finalEatSpeed;
  }

  //Calculate damage to zombie
  determineDamage(pureDamageAmount, damageMultiplier = 1){
    let damageAmount = pureDamageAmount*damageMultiplier;
    if (this.protected === true){//Glitter reduces damage by 75%
      damageAmount *= 0.25;
    }
    if (this.type === 24){//Boss
      bossDamage += damageAmount; 
      return;
    }
    if (this.shieldHealth > 0){//If shield has any health
      if (damageAmount - this.shieldHealth > 0){//Overkill damage
        this.health -= damageAmount - this.shieldHealth;
      }
      this.shieldHealth -= damageAmount;
    }else{//Regular Zombie
      this.health -= damageAmount;
    }
    this.damageTimer = 15;
  }

  //Calculate Stun Time
  //Dazey and Stunion (Noxious)
  determineStun(stunAmount){
    if ((this.stunTimer < stunAmount)&&(this.protected === false)){//Make sure that stun is not shortened
      this.stunTimer = stunAmount;
    }
  }

  //Freeze
  determineFreeze(stunAmount){
    if ((this.freezeTimer < stunAmount)&&(this.protected === false)){//Make sure that stun is not shortened
      this.freezeTimer = stunAmount;
    }
  }

  //Solar Tomato
  determineSolarStun(stunAmount){
    if ((this.solarStunTimer < stunAmount)&&(this.protected === false)){//Make sure that stun is not shortened
      this.solarStunTimer = stunAmount;
    }
  }

  //Calculate Chill Time
  determineChill(chillAmount){
    if ((this.chillTimer < chillAmount)&&(this.protected === false)){//Make sure chill is not shortened
      this.chillTimer = chillAmount;
    }
  }

  //Determine if zombie is under any stun effect
  isStunned(){
    if ((this.stunTimer > 0)||(this.freezeTimer > 0)||(this.solarStunTimer > 0)){
      return true
    }else{
      return false;
    }
  }

  //Determine if zombie is in corresponding jam
  inJam(){
    if (this.specialJam !== -1){
      if ((currentJam === this.specialJam)||(currentJam === 8)){
        return true;
      }else{
        return false;
      }
    }else{//No Jam
      return false;
    }
  }
}
  
  
  
  
  
  
 