//
// Draw File
//

// Draw Title Screen
function drawTitleScreen(){
  background(0);
  noStroke();
  push()

  // Temporary Solution to constantly changing background
  translate(width/2,height/2)
  rotate((actualGlobalTimer%25)*2)
  rotate(-floor((actualGlobalTimer%50)/50)*(actualGlobalTimer%10)/10)
  for(let a=0,la=12;a<la;a++){
    rotate(15+sin(actualGlobalTimer)*10)
    fill(0,50,100-(a+floor(actualGlobalTimer%100/50))%2*25)
    let size=(600-a*50-actualGlobalTimer%50)*width/600
    rect(-size,-size,size*2,size*2)
  }
  pop()

  textSize(60);
  fill(110,105,220);   
  text('N o  M x a e  o r',width/2,200);
  fill(80,170,230);
  text(' e n  i t p  T u ',width/2,200);
  textSize(20);
  fill(110,105,220);   
  text('M / P  r d c i n',width/2,250);
  fill(80,170,230);
  text(' D D  P o u t o ',width/2,250);
  for(let a=0,la=3;a<la;a++){
    push()
    translate(width*(0.3+0.2*a),400)
    for(let b=0,lb=6;b<lb;b++){
      rotate(24)
      fill(110-(a+b)%2*30,105+(a+b)%2*65,220+(a+b)%2*10);
      rect(-60+b*2,-60+b*2,120-b*4,120-b*4)
    }
    pop()
  }
  /*fill(120);
  rect(width/2-60,400,120,50,10);
  rect(width/2-60,460,120,50,10);
  rect(width/2-60,570,120,50,10);*/
  textSize(20);
  fill(50,45,160);
  text('Adventure',width*0.3,400);
  text('Save',width*0.7,400);
  fill(140,230,255);
  text('Minigames',width*0.5,400);
}

// Draw Level Select Screens
function drawLevelSelect(screenNum){
  background(0,0,0);
  fill(230,230,230);
  textSize(25);
  switch(screenNum){
    case 1://Level Select
      text("Adventure", 450, 60);
      for (let a = 1; a < 37; a++){//Level Button Select
        let levelName = "l" + a.toString();
        let levelUnlocked = unlockedLevels.includes(levelName);
        //Level Button
        if (levelUnlocked){
          if((a+floor((a-1)/6))%2 === 0){
            fill(110,105,220);
            stroke(90,85,200);
          }else{
            fill(80,170,230);
            stroke(60,150,210);
          }
        }else{
          fill(110);
          stroke(90)
        }
        strokeWeight(4)
        let buttonX = ((a-1)%6)*80+225;
        let buttonY = floor((a-1)/6)*80+100;
        strokeJoin(ROUND)
        rect(buttonX, buttonY, 50, 50);
        quad(buttonX,buttonY,buttonX+50,buttonY,buttonX+55,buttonY-5,buttonX+5,buttonY-5)
        quad(buttonX+50,buttonY,buttonX+50,buttonY+50,buttonX+55,buttonY+45,buttonX+55,buttonY-5)
        strokeJoin(MITER)
        noStroke();
        fill(0);
        text(a, buttonX + 25, buttonY + 25);
        // Starts levels in various methods
        if (pointBox(mouseX, mouseY, buttonX, buttonY, 50, 50)&&(mouseIsPressed === true)&&(levelUnlocked)){
          currentLevel = levels["l" + a.toString()];
          if (currentLevel.daveSpeech.length !== 0){//There is Dialogue
            daveSetup();
          }else if ((currentLevel.type.includes(10))||(currentLevel.type.includes(14))){//Boss or I Zombie
            basicLevelSetup();
            advancedLevelSetup();
            transition.trigger = true;
            transition.screen = "level";
          }else{//Normal
            basicLevelSetup();
            initiateChooseSeeds();
          }
        }
      }
      break;
    case 2://Minigame Select
      text("Minigames", 450, 60);
      for (let a = 1; a < 14; a++){//Minigame Select
        let levelName = "m" + a.toString();
        let levelUnlocked = unlockedLevels.includes(levelName);
        //Level Button
        if (levelUnlocked){
          if((a+floor(a/13))%2 === 0){
            fill(110,105,220);
            stroke(90,85,200);
          }else{
            fill(80,170,230);
            stroke(60,150,210);
          }
        }else{
          fill(110);
          stroke(90)
        }
        let buttonX = ((a-1)%3)*80+345;
        let buttonY = floor((a-1)/3)*80+130;
        if (a === 13){//Survival Special Placement
          buttonX = 425;
        }
        strokeWeight(3)
        strokeJoin(ROUND)
        rect(buttonX, buttonY, 50, 50);
        quad(buttonX,buttonY,buttonX+50,buttonY,buttonX+55,buttonY-5,buttonX+5,buttonY-5)
        quad(buttonX+50,buttonY,buttonX+50,buttonY+50,buttonX+55,buttonY+45,buttonX+55,buttonY-5)
        strokeJoin(MITER)
        noStroke()
        fill(0);
        text(`M${a}`, buttonX + 25, buttonY + 25);
        //Make sure level is unlocked
        if ((pointBox(mouseX, mouseY, buttonX, buttonY, 50, 50))&&(mouseIsPressed === true)&&(levelUnlocked)){
          currentLevel = levels[levelName];
          if (currentLevel.type.includes(15)){//Survival
            previousSurvivalNum = currentSurvivalNum - 1;
            currentLevel = createSurvivalLevel();
          }
          if (currentLevel.daveSpeech.length !== 0){//There is Dialogue
            daveSetup();
          }else if ((currentLevel.type.includes(10))||(currentLevel.type.includes(14))){//Boss or I Zombie
            basicLevelSetup();
            advancedLevelSetup();
            transition.trigger=true;
            transition.screen="level";
          }else{//Normal
            basicLevelSetup();
            initiateChooseSeeds();
          }
          break;
        }
      }
      break;
    default:
      break;
  }
  strokeJoin(ROUND)
  for(let a=0,la=3;a<la;a++){
    let buttonX=25+a*75
    let buttonY=height-75
    fill(180);
    stroke(160)
    strokeWeight(3)
      rect(buttonX, buttonY, 50, 50);
      quad(buttonX,buttonY,buttonX+50,buttonY,buttonX+55,buttonY-5,buttonX+5,buttonY-5)
      quad(buttonX+50,buttonY,buttonX+50,buttonY+50,buttonX+55,buttonY+45,buttonX+55,buttonY-5)
      stroke(120)
      noFill()
      strokeWeight(5)
      switch(a){
        case 0:
          line(buttonX+10,buttonY+25,buttonX+20,buttonY+15)
          line(buttonX+10,buttonY+25,buttonX+20,buttonY+35)
          line(buttonX+10,buttonY+25,buttonX+30,buttonY+25)
          arc(buttonX+30,buttonY+30,20,10,-90,90)
        break
        case 1:
          quad(buttonX+10,buttonY+10,buttonX+10,buttonY+30,buttonX+25,buttonY+40,buttonX+25,buttonY+20)
          quad(buttonX+40,buttonY+10,buttonX+40,buttonY+30,buttonX+25,buttonY+40,buttonX+25,buttonY+20)
        break
        case 2:
          rect(buttonX+10,buttonY+20,30,20)
          arc(buttonX+25,buttonY+20,20,20,-180,0)
          strokeWeight(2)
          arc(buttonX+25,buttonY+28,6,4,90,270)
          arc(buttonX+25,buttonY+32,6,4,-90,90)
          line(buttonX+25,buttonY+24,buttonX+25,buttonY+36)
          line(buttonX+25,buttonY+26,buttonX+27,buttonY+26)
          line(buttonX+25,buttonY+34,buttonX+23,buttonY+34)
        break
      }
      
    }
  strokeJoin(MITER)
  /*fill(180);
  rect(760,20,120,40,3);
  rect(310,570,120,40,3);
  rect(470,570,120,40,3);
  fill(0);
  textSize(20);
  text('Almanac',370,590);
  text('Shop',530,590);
  text('Back',820,40);*/
}

// Draw Game Over Screen
function drawGameOver(){
  background(20);
  stroke(100);
  strokeWeight(5);
  fill(120);
  rect(width/2-60,height-150, 120, 60,5);
  fill(200);
  noStroke();
  textSize(60);
  text("Game Over", width/2, 60);
  textSize(20);
  text("Return",width/2,height-120);
  noFill();
  stroke(50,200,50);
  strokeWeight(10);
  ellipse(width/2,height/2-50,300,300);
  line(width/2-50,height/2-80+sin(frameCount*3)*5,width/2-50,height/2-120+sin(frameCount*3)*5);
  line(width/2+50,height/2-80+sin(frameCount*3)*5,width/2+50,height/2-120+sin(frameCount*3)*5);
  line(width/2-60,height/2+40+sin(frameCount*3)*15,width/2+60,height/2+40+sin(frameCount*3)*15);
  arc(width/2,height/2+40+sin(frameCount*3)*15,120,80-sin(frameCount*3)*40,-180,0);
  strokeWeight(5);
  if(frameCount%120<30){
    ellipse(width/2+50,height/2-80+(frameCount%120)/4,(frameCount%120)/2,(frameCount%120)/2);
  }else{
    ellipse(width/2+50,height/2-312.5+(frameCount%120)*8,15,15);
  }  
}

// Shortcut Draw Methods
//Default Create Triangle
function regTriangle(x, y, radius, direction){
  triangle(x+sin(direction)*radius,y+cos(direction)*radius,x+sin(direction+120)*radius,y+cos(direction+120)*radius,x+sin(direction+240)*radius,y+cos(direction+240)*radius);
}

//Merge Array
function mergeArray(arr,arr2,value){
  return [arr[0]*value+arr2[0]*(1-value),arr[1]*value+arr2[1]*(1-value),arr[2]*value+arr2[2]*(1-value)]
}

//Screen transition animation
function displayTransition(transition){
  noStroke();
  fill(0);
  rectMode(CENTER);
  rect(transition.anim*width/4,height/2,transition.anim*width/2,height);
  rect(width-transition.anim*width/4,height/2,transition.anim*width/2,height);
  rect(width/2,transition.anim*height/4,width,transition.anim*height/2);
  rect(width/2,height-transition.anim*height/4,width,transition.anim*height/2);
  rectMode(CORNER);
  if(transition.trigger){
    transition.anim=round(transition.anim*10+1)/10;
    if(transition.anim>1.1){
      transition.trigger = false;
      screen=transition.screen;
    }
  }
  else if(transition.anim>0){
    transition.anim=round(transition.anim*10-1)/10;
  }
}

//Draw Methods 

// Normal Level Draw Stack
function drawStack(){
  drawBackground();
  drawTiles();
  drawBoss();
  drawJams();
  drawPlants();
  drawZombies();
  drawConveyor();
  drawProjectiles();
  drawLawnmowers();
  drawParticles();
  drawSeedPackets();
  drawSun();
  drawUserStats();
  drawObjectives();
  drawProgressBar();
  drawNavigation();
}

// Cutscene Draw Stack
function backgroundDrawStack(){
  drawBackground();
  drawTiles();
  drawBoss();
  drawConveyor();
  drawPlants();
  drawZombies();
  drawLawnmowers();
  //drawSeedPackets(); Done after dark filter
  drawSun();
  drawObjectives();
  drawProgressBar();
}

// Draws jams
function drawJams(){
  //Draw Jams
  if((currentJam===1)||(currentJam===8)){//Punk
    fill(250,75,0,150);
    for(let a=0;a<9;a++){
      arc(a*80+220,100,20*(1+sin(frameCount*6)*0.5),20*(1+sin(frameCount*6)*0.5),0,180);
      triangle(a*80+220-10*(1+sin(frameCount*6)*0.5),100,a*80+220+10*(1+sin(frameCount*6)*0.5),100,a*80+220,100-50*(1+sin(frameCount*6)*0.5));
      arc(a*80+220,640,20*(1+sin(frameCount*6)*0.5),20*(1+sin(frameCount*6)*0.5),0,180);
      triangle(a*80+220-10*(1+sin(frameCount*6)*0.5),640,a*80+220+10*(1+sin(frameCount*6)*0.5),640,a*80+220,640-50*(1+sin(frameCount*6)*0.5));
    }
    fill(250,175,0,150);
    for(let a=0;a<9;a++){
      arc(a*80+220,100,10*(1+sin(frameCount*6)*0.5),10*(1+sin(frameCount*6)*0.5),0,180);
      triangle(a*80+220-5*(1+sin(frameCount*6)*0.5),100,a*80+220+5*(1+sin(frameCount*6)*0.5),100,a*80+220,100-25*(1+sin(frameCount*6)*0.5));
      arc(a*80+220,640,10*(1+sin(frameCount*6)*0.5),10*(1+sin(frameCount*6)*0.5),0,180);
      triangle(a*80+220-5*(1+sin(frameCount*6)*0.5),640,a*80+220+5*(1+sin(frameCount*6)*0.5),640,a*80+220,640-25*(1+sin(frameCount*6)*0.5));
    }
  }
  if((currentJam===2)||(currentJam===8)){//Glitter
    fill(255);
    for(let a=0;a<18;a++){
      ellipse((frameCount*2)%40+a*40+180,120,5,5);
      ellipse(-(frameCount*2)%40+a*40+220,220,5,5);
      ellipse((frameCount*2)%40+a*40+180,320,5,5);
      ellipse(-(frameCount*2)%40+a*40+220,420,5,5);
      ellipse((frameCount*2)%40+a*40+180,520,5,5);
      ellipse(-(frameCount*2)%40+a*40+220,620,5,5);
    }
    push();
    translate(540,10);
    rotate(frameCount*2);
    image(graphics.minor[7],-120,-120,240,240);
    pop();
  }
  if((currentJam===3)||(currentJam===8)){//Rap
    stroke(125,150,125);
    fill(75,150,75);
    strokeWeight(5);
    rect(440,-20,200,70,10);
    noStroke();
    fill(0);
    ellipse(540+sin(frameCount*2)*60,15,50,50);
    fill(75,150,75);
    ellipse(540+sin(frameCount*2)*60,15,40,40);
    fill(0);
    ellipse(530+sin(frameCount*2)*65,10,10,10);
    ellipse(550+sin(frameCount*2)*65,10,10,10);
    fill(80);
    rect(390,-20,40,70,5);
    rect(650,-20,40,70,5);
    fill(40);
    ellipse(410,0,20,20);
    ellipse(410,30,20,20);
    ellipse(670,0,20,20);
    ellipse(670,30,20,20);
  }
  if((currentJam===4)||(currentJam===8)){//Arcade
    fill(255,100,200,50);
    for (let currentTile of tiles){
      if(currentTile.id%4==floor((frameCount%240)/60)){
        rect(currentTile.x+10, currentTile.y+10, 60, 80);
      }
    }
    fill(255,150,200,150);
    for(let a=0;a<9;a++){
      ellipse(a*80+220,110,40*(1+sin(frameCount)*0.1),40*(1+sin(frameCount)*0.1));
      ellipse(a*80+220,630,40*(1+sin(frameCount)*0.1),40*(1+sin(frameCount)*0.1));
    }
    for(let a=0;a<8;a++){
      ellipse(a*80+260,110,40*(1-sin(frameCount)*0.1),40*(1-sin(frameCount)*0.1));
      ellipse(a*80+260,630,40*(1-sin(frameCount)*0.1),40*(1-sin(frameCount)*0.1));
    }
  }
  if((currentJam===5)||(currentJam===8)){//Rock
    fill(255);
    for(let a=0;a<9;a++){
      push();
      translate(a*80+220,100);
      scale(1+sin(frameCount*6)*0.5);
      beginShape();
      vertex(0,0);
      vertex(-15,-15);
      vertex(-3,-10);
      vertex(0,-30);
      vertex(3,-10);
      vertex(15,-15);
      endShape();
      pop();
    }
  }
  if((currentJam===6)||(currentJam===8)){//Techie
    fill(100,255,100);
    for(let a=0;a<9;a++){
      rect(a*80+200,120-(1-pow((0.5+0.5*sin(frameCount*3+a*150)),1/3))*100,40,(1-pow((0.5+0.5*sin(frameCount*3+a*150)),1/3))*100);
    }
    for(let a=0;a<9;a++){
      rect(a*80+200,620-(1-pow((0.5+0.5*sin(frameCount*3+a*150-300)),1/3))*100,40,(1-pow((0.5+0.5*sin(frameCount*3+a*150-300)),1/3))*100);
    }
  }
  if(currentJam===7){//Boombox
    noFill();
    stroke(255,100,255,255-(frameCount%600)/2);
    strokeWeight(10);
    ellipse(540,-10,frameCount%600,frameCount%600);
  }
}

// Draws level objectives
function drawObjectives(){
  // Plants Lost
  if (currentLevel["type"].includes(8)){
    fill(255);
    textSize(25);
    text(`Plants Left: ${currentLevel["maxLostPlant"] - lostPlants}`, 250, 30);
  }
  //Draw Flower Line (If Level Has It)
  if (currentLevel["type"].includes(7) === true){
    fill(255,0,0);
    for(let a=0;a<20;a++){
      image(graphics.minor[a%7],currentLevel["flowerLine"]+((a*a)%4.3)*1.5-8.6,120+a*25,25,25)
    }
  }
  //Draw Zombie Line (I Zombie)
  if (currentLevel["type"].includes(14) === true){
    fill(240,0,0);
    for(let a=0;a<20;a++){
      ellipse(currentLevel["plantLine"]+((a*a)%4.3)*1.5-9.6,120+a*25,30,30)
    }
  }
  //Draw Fog (If Level Has It)
  if (currentLevel["type"].includes(5) === true){
    fill("rgba(0,0,0,0.3)");//Night Overlay
    rect(0,0,950,700);
    if (currentJam !== 8){//Not Ultimate Jam, Draw Fog
      image(graphics.minor[8],currentLevel["fogLine"]-30,50,800,600);
    }
  }
}

//Draw Conveyor Belt
function drawConveyor(){
  if (currentLevel["type"].includes(2) === true){
    noStroke()
    fill(40);
    rect(0,0,10,700);
    rect(120,0,10,700);
    fill(60);
    rect(10,0,110,700);
    fill(70);
    for(let a = 0; a < 25; a++){
      rect(10,10+a*30-(globalTimer)%30,110,8);
    }
  }
}

// Draws coins and suns
function drawUserStats(){
  //Draw Coins
  drawCoinBar();
  //Display Sun Values
  textAlign(CENTER,CENTER);
  noStroke();
  fill(255);
  textSize(36);
  if (!currentLevel["type"].includes(2)){
    text(sun, 65, 40);
  }
}

// Draws coin mini-menu
function drawCoinBar(){
  // Coin Rectangle
  fill(100);
  stroke(80);
  strokeWeight(5);
  rect(760,640,140,40,5);
  noStroke();
  // Display Coin
  translate(781,660)
  scale(1.1);// Start scaling
  noStroke()
  fill(225,this.fade)
  ellipse(0,0,30,30)
  stroke(150,this.fade)
  strokeWeight(4)
  noFill()
  arc(0,-5,12,10,90,270)
  arc(0,5,12,10,-90,90)
  line(0,-10,5,-10)
  line(0,10,-5,10)
  line(0,-13,0,13)
  scale(10/11);
  noStroke();
  translate(-781,-660);
  
  // Coin Text
  fill(225);
  textSize(19);
  textAlign(LEFT,CENTER);
  text(money, 803, 660);
  textAlign(CENTER,CENTER);
}

// Draw navigation buttons
function drawNavigation(){
  //Display Fast Forward Buttons
  strokeWeight(5);
  stroke(80);
  fill(100);
  rect(700,50,60,40,5);
  noStroke();
  fill(40);
  if (levelSpeed === 1.7){
    regTriangle(714,70,10,-30);
    regTriangle(730,70,10,-30);
    regTriangle(746,70,10,-30);
  }else if (levelSpeed === 1.35){
    regTriangle(722,70,10,-30);
    regTriangle(738,70,10,-30);
  }else{
    regTriangle(730,70,10,-30);
  }

  //Display Quit Button
  fill(100);
  stroke(80);
  strokeWeight(5);
  rect(800,30,60,40,5);
  noStroke();
  fill(255,255,255);
  textSize(20);
  text("Quit", 830, 50);
}

// Draws elements that constitutes background scene
function drawTiles(){
  //Draw Tiles
  for (let currentTile of tiles){
    if((currentLevel["type"].includes(13))&&(currentLevel.unsoddedLanes.includes(currentTile.y))){//Unsodded
      fill(100,60,20);
    }else if (currentTile.color === 0){//Light Blue
      fill(110,105,220);   
    }else{//Dark Blue
      fill(80,170,230);
    }
    rect(currentTile.x, currentTile.y, 80, 100);
    //Outline
    if((currentLevel["type"].includes(13))&&(currentLevel.unsoddedLanes.includes(currentTile.y))){//Unsodded
      fill(90,50,10);
    }else if (currentTile.color === 0){//Light Blue
      fill(100,95,210);   
    }else{//Dark Blue
      fill(70,160,220);
    }
    rect(currentTile.x+5, currentTile.y+5, 70, 90)
  }
}

// Draws background
function drawBackground(){
  //Draw Background
  background(155,160,170);
  fill(50,150,50)
  for(let a=0,la=16;a<la;a++){
    ellipse((a+0.5)/la*width,(4**a)%35,80+(3**a)%60)
    ellipse((a+0.5)/la*width,height+20-((4**a)*2+30)%35,80+((3**a)*2+25)%60)
  }
}

// Draws progress bar
function drawProgressBar(){
  //Display Level Progress and Flags OR Boss Bar
  if (currentLevel["type"].includes(10)){//Boss Bar
    stroke(80);
    fill(100);
    rect(350,60,310,30,5);
    noStroke();
    fill(200,30,30);
    rect(356,66,bossDamage/10000*297/currentLevel["waves"].length+currentWave*297/currentLevel["waves"].length,18,5);
    fill(20);
    for(let a=1;a<7;a++){
      rect(348+a*310/7,60,4,30);
    }
  }else{//Regular Bar
    stroke(80);
    fill(100);
    rect(350,60,310,30,5);
    noStroke();
    fill(200,30,30);
    rect(356,66,currentWave/currentLevel["waves"].length*288,18,5);
    for(let a = 1; a < currentLevel.flag.length + 1; a++){
      if(currentLevel.flag[a - 1]){//Remember that 0th wave is not counted
        if(currentWave >= a){//Flag Raised (Wave Passed)
          fill(200,120,40);
          rect(350+288/currentLevel.flag.length+(a-1)*288/currentLevel.flag.length-3,63,2,24);
          fill(240,40,40);
          rect(352+288/currentLevel.flag.length+(a-1)*288/currentLevel.flag.length-3,64,12,10);
        }else{
          fill(200,120,40);
          rect(350+288/currentLevel.flag.length+(a-1)*288/currentLevel.flag.length-3,73,2,24);
          fill(240,40,40);
          rect(352+288/currentLevel.flag.length+(a-1)*288/currentLevel.flag.length-3,74,12,10);
        }
      }
    }
  }
}

//Draw Plants
function drawPlants(){
  for (let currentPlant of allPlants){
    currentPlant.draw();
  }
}

//Draw Zombies
function drawZombies(){
  for (let currentZombie of allZombies){
    currentZombie.draw();
  }
}

//Draw Projectiles
function drawProjectiles(){
  for (let currentProjectile of allProjectiles){
    currentProjectile.draw();
  }
}

//Draw Lawnmowers
function drawLawnmowers(){
  for (let currentMower of lawnMowers){
    if (currentMower.active === true){
      currentMower.x += 3*levelSpeed;
    }
    noStroke(0);
    fill(80,160,160);
    rect(currentMower.x, currentMower.y+42, 36, 16);
    fill(60);
    ellipse(currentMower.x+10, currentMower.y+58,8,8);
    ellipse(currentMower.x+26, currentMower.y+58,8,8);
    ellipse(currentMower.x+18, currentMower.y+44, 20, 6);
    rect(currentMower.x-5, currentMower.y+40,2,12);
    quad(currentMower.x-3,currentMower.y+40,currentMower.x,currentMower.y+43,currentMower.x,currentMower.y+45,currentMower.x-3,currentMower.y+42);
    quad(currentMower.x-3,currentMower.y+50,currentMower.x,currentMower.y+53,currentMower.x,currentMower.y+55,currentMower.x-3,currentMower.y+52);
  }
}

//Draw Particles
function drawParticles(){
  for (let currentParticle of allParticles){
    currentParticle.draw();
    if(currentParticle.remove){
      allParticles.splice(allParticles.indexOf(currentParticle), 1);
      allEntities.splice(allEntities.indexOf(currentParticle), 1);
    }
  }
}

//Draw Seed Packets and Shovel
function drawSeedPackets(){
  for (let currentPacket of allPackets){
    currentPacket.draw();
  }
}

//Draw Sun and Coins
function drawSun(){
  for (let currentSun of allCollectibles){
    currentSun.draw();
  }
}

// Draws Boss
function drawBoss(){
  if (currentLevel["type"].includes(10)){
    fill(100);
    rect(660,120,240,500);
    fill(200);
    ellipse(780,370,160,160);
    translate(780,420);
    stroke(240);
    strokeWeight(4);
    line(-4,-30,-8,0);
    line(4,-30,8,0);
    line(-6,-45,-24,-39-sin(globalTimer*9)*3);
    line(-6,-51,-24,-57+sin(globalTimer*9)*3);
    noStroke();
    fill(240);
    ellipse(0,-47,18,42);
    fill(60);
    rect(-10,-45,20,3);
    fill(240,220,180);
    ellipse(0,-78,30,30);
    fill(0);
    ellipse(-4,-75,4,4);
    ellipse(-12,-75,4,4);
    stroke(40);
    strokeWeight(1);
    fill(255,50);
    ellipse(-4,-74,6,5);
    ellipse(-12,-74,6,5);
    line(-7,-74,-9,-74);
    translate(-780,-420);
  }
  noStroke();
}

