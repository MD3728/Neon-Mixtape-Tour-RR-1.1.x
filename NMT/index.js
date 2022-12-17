/* Main JS File */
//Version 1.1.0
//To Do:
//
//
//
//
//

//Changeable Stats
let seedSlots = 7;
let money = 0;//In Game Currency

//General Systems
let screen = "initial";
//let gameOverText = "";//Game over message determined by objective failure or brains eaten
let readyPlant = null;//ID Holder For Planting and Shoveling
let running = false;//Determines if level is running
let win = false;//Determines win

//Gameplay System
let idIndexer = 1;
let levelSpeed = 1;
let lawnMowers = [];
let tiles = [];
let selectedPackets = [];
let sun = 75;
let currentLevel = null;
let currentWave = 0;
let currentJam = 0;//Jams: 0: Normal, 1: Punk, 2: Pop, 3: Rap, 4: 8-bit, 5: Metal, 6: Techno, 7: Ballad, 8: Everything (except ballad)
let waveTimer = 0;//Time between waves
let sunTimer = 0;//Sun falling from the sky
let conveyorTimer = 0;//Time between conveyor seed packets
let globalTimer = 0;//Global timer for anything
let levelTimer = 0;
let bossDamage = 0;
let boomberryActive = false;
let boomboxActive = false;
let lostPlants = 0;//Number of plants lost (for Don't Lose Plants Levels)
let daveIndex = 0;//Current Index of Crazy Dave Dialogue

//Reward/Unlocking System
let unlockedPackets = [1,4,7,12,18,
/*1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26*/];
let unlockedLevels = [
"l1"/*,"l2","l3","l4","l5","l6","l7","l8","l9","l10",
"l11","l12","l13","l14","l15","l16","l17","l18","l19","l20",
"l21","l22","l23","l24","l25","l26","l27","l28","l29","l30",
"l31","l32","l33","l34","l35","l36","m7","m8","m9","m4"*/];
//Array of classes
let allEntities = [];
let allPlants = [];
let allZombies = [];
let allProjectiles = [];
let allCollectibles = [];
let allPackets = [];
let allParticles = [];

//Graphics
let graphics = {minor:[]};
let transition = {trigger:false,anim:0,screen:screen};

//Almanac System
let displayPlant;//For showing plant in almanac
let displayZombie;//For showing zombie in almanac
let displayZombies = [];//For showing zombies in seed select
let displayPlants=[]//for shop

//Current Plant Tiers (Default is all tier 1)
let plantTier = [];
for (let d = 0; d < 27; d++){
  plantTier.push(1);
}

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

//Hotkeys
function keyPressed(){
  if(keyCode==SHIFT){
    levelSpeed=(levelSpeed-0.5)%1.5+1
  }
}

/* Shortcut Methods */

//Create Plant Shortcut
function createPlant(type, tier, x, y){
  let plantData;
  for (let currentPlant of plantStat){//Find correct plant
    if (currentPlant.type === type){
      if (tier === 1){//Tier 1
        plantData = currentPlant["t1"];
        break;
      }else{//Tier 2
        plantData = currentPlant["t2"];
        break;
      }
    }
  }
  let newPlant = new Plant(type, x, y, plantData.sun, plantData.damage, plantData.health, plantData.eatable, 
    plantData.reload, plantData.projectile, plantData.splashDamage, tier, false, false);
  return newPlant;
}

//Create Zombie Shortcut
function createZombie(type, lane = 5){//Keep in mind that lane 0 -> 4 are lanes 1 -> 5, "lane" 5 points to a random lane
  let zombieInfo = zombieStat[type];
  let finalLane = lane;
  if (lane === 5){//Random Lane Assignment
    finalLane = Math.floor(Math.random()*5) + 1;
  }
  new Zombie(580+Math.floor(50*Math.random()), finalLane*100 + 20, finalLane, type, zombieInfo["health"], zombieInfo["shield"], 
  zombieInfo["degrade"], zombieInfo["speed"], zombieInfo["eatSpeed"], zombieInfo["altEatSpeed"], zombieInfo["jam"], 0);
}

//Finds reward from current level and returns final string
function determineReward(){
  let finalText = ``;
  //Give Rewards
  for (let currentReward of currentLevel.reward){
    switch (currentReward[0]){
      case 0://New Plant
        if (!unlockedPackets.includes(currentReward[1])){
          for (let currentPlant of plantStat){
            if (currentPlant.type === currentReward[1]){
              finalText +=`${currentPlant.name}\n`;
              break;
            }
          }
        }
        break;
      case 1://Money
        let totalMowers = 0;
        for (let laneMower of lawnMowers){
          if (!laneMower.active){
            totalMowers++;
          }
        }
        finalText += `${currentReward[1] + totalMowers*200} Coins\n`;
        break;
      case 2://New Level
        if (!unlockedLevels.includes(currentReward[1])){
          if (currentReward[1].includes("m")){
            finalText += `Minigame ${currentReward[1].substring(1)}\n`;
          }else{
            finalText +=`Level ${currentReward[1].substring(1)}\n`;
          }
        }
        break;
      default:
        finalText +=`Nothing\n`;
        break;
    }
  }
  return finalText;
}

//Start game from choose your seeds
function startGame(){
  transition.trigger = true;
  transition.screen = "level";
  if (currentLevel["type"].includes(4) === false){//Not Last Stand
    finalLevelSetup();
  }
}

/* Screen Entrances */

//Crazy Dave Entrance
function daveSetup(){
  transition.trigger = true;
  transition.screen = "daveSpeech";
  screen = "daveSpeech";
  daveIndex = 0;
  initialLevelSetup();
  if (currentLevel.type.includes(3)){//Locked and Loaded
    selectedPackets = currentLevel.givenPlants;
  }
}

//Crazy Dave Loop
function daveLoop(){
  drawStack();
  if (daveIndex >= currentLevel.daveSpeech.length){
    if (currentLevel.type.includes(10)){//Boss 
      selectedPackets = [];
      allPackets = [];
      finalLevelSetup();      
      transition.trigger = true;
      transition.screen = "level";
      screen = "level";
    }else if (currentLevel.type.includes(14)){//I Zombie
      transition.trigger = true;
      transition.screen = "level";
      finalLevelSetup();
      screen = "level";
    }else{//Normal
      chooseSeeds();
    }
  }
  stroke(220);
  fill(230);
  strokeWeight(10);
  rect(450,350,300,180,10);
  fill(0,0,0);
  noStroke();
  textSize(16);
  text(currentLevel.daveSpeech[min(currentLevel.daveSpeech.length-1,daveIndex)], 600, 420);
  textSize(12);
  text("Click to continue", 600, 510);
  translate(300,800);
  scale(6);
  stroke(120,80,40,this.fade);
  strokeWeight(4);
  line(-4,-30,-8,0);
  line(4,-30,8,0);
  line(-6,-48,-15,-24);
  line(6,-48,15,-24);
  noStroke();
  fill(90,60,30,this.fade);
  ellipse(0,-45,18,36);
  fill(150,100,50,this.fade);
  arc(5,-45,10,36,-90,90);
  arc(-5,-45,10,36,90,270);
  fill(240,220,180,this.fade);
  ellipse(0,-75,30,30);
  fill(0,this.fade);
  ellipse(4,-72,4,4);
  ellipse(12,-72,4,4);
  fill(210,this.fade);
  rect(-15,-91,30,13,3);
  rect(-24,-82,24,4);
  scale(1/6);
  translate(-300,800);
}

//Initiate choose your seeds screen
function chooseSeeds(){
  if (currentLevel["type"].includes(3) === true){//Locked and Loaded
    selectedPackets = currentLevel["givenPlants"];
    transition.trigger=true;
    transition.screen="chooseSeeds";
  }else if (currentLevel["type"].includes(2) === true){//Conveyor
    selectedPackets = [];
    transition.trigger=true;
    transition.screen="chooseSeeds";
  }else{//Normal and Other Level Types
    transition.trigger=true;
    transition.screen="chooseSeeds";
    selectedPackets = [];
  }
}

//Loop for Choose Your Seeds
function chooseSeedLoop(){
  //General Looks
  background('rgba(0,0,0,0.2)');
  fill(255,255,255);
  noStroke()
  textSize(30);
  text("Choose Your Plants", width/2, 50);
  textSize(20);
  //Display Zombies In level
  for (let displayingZombie of displayZombies){
    displayingZombie.draw();
  }
  //All Seed Packets
  for (let a = 1; a < 27; a++){
    let buttonX = ((a-1)%5)*150+150;
    let buttonY = floor((a-1)/5)*60+100;
    stroke(200);
    strokeWeight(4);
    fill(180,200,180);
    rect(buttonX, buttonY, 120, 40,3);
    if (((currentLevel["type"].includes(4) === true)&&((a <= 3)||(a === 17)))//Last Stand Ban Sun Producers and Red Stinger AND Ignore Seed Select
    ||(currentLevel.type.includes(2))||(currentLevel.type.includes(3))||(!unlockedPackets.includes(a))){//And Unlocking System
      noStroke();
      fill(0,100);
      rect(buttonX, buttonY, 120, 40,3);
    }
    noStroke();
    fill(0);
    textSize(12);
    text(plantStat[a-1].name, buttonX + 60, buttonY + 20);
  }
  //Start Button
  stroke(200);
  strokeWeight(4);
  fill(180,200,180);
  rect(15,400, 100, 40, 3);
  fill(0);
  noStroke();
  textSize(12);
  text('Start', 65,420);
  if (!((currentLevel.type.includes(2))||(currentLevel.type.includes(3)))){//Prevent Seed Select (Locked and Loaded AND Conveyor)
    textSize(25);
    text(selectedPackets.length+'/'+seedSlots,55,40);
    for (let currentPacket in selectedPackets){//Selected Seed Packets
      stroke(200);
      strokeWeight(3);
      fill(180,200,180);
      rect(15, currentPacket*40+68, 80, 80/3,2);
      noStroke();
      fill(0);
      textSize(8);
      text(plantStat[selectedPackets[currentPacket]-1].name, 55, currentPacket*40 + 68+40/3);
    }
  }
  //Quit Button
  fill(100);
  stroke(80);
  strokeWeight(5);
  rect(800,30,60,40,5);
  noStroke();
  fill(255,255,255);
  textSize(20);
  text("Quit", 830, 50);
}

//Loop for last stand preparation
function prepareDefense(){
  for (let currentPacket of allPackets){//Get Seed Packets to Correct Position, Set Recharge to Nothing
    currentPacket.recharge = 0;
    currentPacket.move();
  }
  //Clean up dead (shoveled) plant
  for (let c = 0; c < allPlants.length; c++){
    if (allPlants[c].health <= 0){
      for (let currentTile of tiles){
        if (currentTile.plantID === allPlants[c].id){
          currentTile.occupied = false;
          currentTile.plantID = null;
          break;
        }
      }
      allEntities.splice(allEntities.indexOf(allPlants[c]),1);
      allPlants.splice(c,1);
      c--;
    }
  }
  drawStack();
}

/* Starter Methods */

//Get Game To Crazy Dave Screen (Or Equivalent)
function initialLevelSetup(){
  //Create Level Zombie Display
  let zombiesInLevel = [];
  for (let nextWave of currentLevel.waves){
    for (let nextZombie of nextWave){
      if (!zombiesInLevel.includes(nextZombie[0])){
        zombiesInLevel.push(nextZombie[0]);
      }
    }
  }
  //Randomize Array Order (Knuth Shuffle)
  let currentIndex = zombiesInLevel.length,  randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0){
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [zombiesInLevel[currentIndex], zombiesInLevel[randomIndex]] = [zombiesInLevel[randomIndex], zombiesInLevel[currentIndex]];
  }
  displayZombies = [];
  for(let a = 0, la = zombiesInLevel.length; a < la; a++){
    displayZombies.push(new Zombie(75+a*40,550-(a%2)*60,0,zombiesInLevel[a],9999,9999,0,0,0,0,0,0));
    displayZombies[displayZombies.length-1].fade = 255;
  }
  //Reset Variables and Arrays
  waveTimer = 0;
  sunTimer = 180;
  globalTimer = 5;
  conveyorTimer = 1000;//Instantly Spawn Plant In COnveyor Level
  running = true;
  boomberryActive = false;
  boomboxActive = false;
  win = false;
  currentWave = 0;
  currentJam = 0;
  levelSpeed = 1;
  if (currentLevel["type"].includes(5) === true){//Night Time Sun Bonus 
    sun = 100;
  }else if (currentLevel["type"].includes(14) === true){//I Zombie
    sun = 150;
  }else{//Regular Level
    sun = 75;
  }
  if (currentLevel["startingSun"]){//If starting sun specified OR Last Stand Level
    sun = currentLevel["startingSun"];
  }
  lostPlants = 0;
  allPackets = [];
  allPlants = [];
  allZombies = [];
  allCollectibles = [];
  allEntities = [];
  allProjectiles = [];
  if (currentLevel["type"].includes(14)){//I Zombie
    lawnMowers = [];
    currentJam = currentLevel.jams[0];
  }else{//Normal
    lawnMowers = [
      {x:140, y: 140, active: false},
      {x:140, y: 240, active: false},
      {x:140, y: 340, active: false},
      {x:140, y: 440, active: false},
      {x:140, y: 540, active: false}
    ];
  }
  //Reset Tiles
  tiles = [];
  for (let a = 0; a < 45; a++){
    tiles.push({x: Math.floor(a%9)*80 + 180,
      y: Math.floor(a/9)*100 + 120,
      occupied: false,
      plantID: null,
      color: a%2,
    id:a});
  }
  //Set Up Boss
  if (currentLevel["type"].includes(10) === true){
    bossDamage = 0;
    //Spawn Zombies to take damage for boss
    new Zombie(665, 120, 1, 24, 10000000, 0, [], 0, 0, 0, -1, 0, 0);
    new Zombie(665, 220, 2, 24, 10000000, 0, [], 0, 0, 0, -1, 0, 0);
    new Zombie(665, 320, 3, 24, 10000000, 0, [], 0, 0, 0, -1, 0, 0);
    new Zombie(665, 420, 4, 24, 10000000, 0, [], 0, 0, 0, -1, 0, 0);
    new Zombie(665, 520, 5, 24, 10000000, 0, [], 0, 0, 0, -1, 0, 0);
  }
  //Create Endangered Plants
  if (currentLevel["type"].includes(6) === true){
    for (let nextPlant of currentLevel["endangeredPlant"]){//Format is [plant type, tier, tile number]
      for (let currentTileNumber in tiles){//Find correct tile
        if (parseInt(currentTileNumber) + 1 === nextPlant[2]){//Tile number is 1 -> 45
          let currentTile = tiles[currentTileNumber];
          let newPlant = createPlant(nextPlant[0], nextPlant[1], currentTile.x + 10, currentTile.y + 10);
          newPlant.endangered = true;
          currentTile.occupied = true;
          currentTile.plantID = newPlant.id;
          break;
        }
      }
    }
  }
  //Create I Zombie Plants
  if (currentLevel["type"].includes(14) === true){
    let finalLayout = [];
    let uninitializedLayout = currentLevel["startingRandomPlants"];
    let randomizedLayout = [];
    //Create Array of Plants
    for (let b = 0; b < uninitializedLayout.length; b++){
      for (let c = 0; c < uninitializedLayout[b][2]; c++){
        randomizedLayout.push([uninitializedLayout[b][0],uninitializedLayout[b][1]]);
      }
    }
    //Randomize Array Order (Knuth Shuffle)
    let currentIndex = randomizedLayout.length,  randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0){
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [randomizedLayout[currentIndex], randomizedLayout[randomIndex]] = [randomizedLayout[randomIndex], randomizedLayout[currentIndex]];
    }
    //Format Plants
    let boardWidth = (currentLevel.plantLine-180)/80;
    for (let a = 0; a < boardWidth*5; a++){
      finalLayout.push([randomizedLayout[a][0], randomizedLayout[a][1], (Math.floor(a/boardWidth))*9 + a%boardWidth + 1]);
    }
    //Add (Create) Plants To Tiles
    for (let nextPlant of finalLayout){//Format of "nextPlant" is [plant type, tier, tile number]
      for (let currentTileNumber in tiles){//Find correct tile
        if (parseInt(currentTileNumber) + 1 === nextPlant[2]){//Tile number is 1 -> 45
          let currentTile = tiles[currentTileNumber];
          currentTile.occupied = true;
          let newPlant = createPlant(nextPlant[0], nextPlant[1], currentTile.x + 10, currentTile.y + 10);
          currentTile.plantID = newPlant.id;
          break;
        }
      }
    }
  }
  //Create Seed Packets
  if (currentLevel["type"].includes(3) === true){//Locked and Loaded
    if (currentLevel["type"].includes(14)){//I Zombie
      for (let currentPacket of currentLevel.givenPlants){
        for (let currentZombieNum in zombieStat){//Find correct plant
          let currentZombie = zombieStat[currentZombieNum];
          if (currentZombie["type"] === currentPacket[0]){//Find type
            let newPacket = new SeedPacket(currentPacket[0], currentZombie.name, currentZombie.sun, 1, 0, 0, false, true);
            newPacket.move();
          }
        }
      }
    }else{//Normal
      for (let currentPacket of currentLevel.givenPlants){
        for (let currentPlantNum in plantStat){//Find correct plant
          let currentPlant = plantStat[currentPlantNum];
          if (currentPlant["type"] === currentPacket[0]){//Find type
            if (currentPacket[1] === 1){//Tier 1
              let tier1Stat = currentPlant["t1"];
              let newPacket = new SeedPacket(currentPacket[0], currentPlant["name"], tier1Stat["sun"], 1, tier1Stat["recharge"], tier1Stat["startingRecharge"]);//Tier 1
              newPacket.move();
            }else{//Tier 2
              let tier2Stat = currentPlant["t2"];
              let newPacket = new SeedPacket(currentPacket[0], currentPlant["name"], tier2Stat["sun"], 2, tier2Stat["recharge"], tier2Stat["startingRecharge"]);//Tier 2
              newPacket.move();
            }
          }
        }
      }
    }
  }
}

//Function to call when starting level AFTER Crazy Dave
function finalLevelSetup(){
  if (!currentLevel["type"].includes(2)){//Other Level Types With Choose Your Seeds But No Conveyor
    for (let a in selectedPackets){
      let packetID = selectedPackets[a];
      for (let currentPlantNum in plantStat){//Find correct plant
        let currentPlant = plantStat[currentPlantNum];
        if (currentPlant["type"] === packetID){
          if (plantTier[packetID - 1] === 1){//Tier 1
            let tier1Stat = currentPlant["t1"];
            new SeedPacket(packetID, currentPlant["name"], tier1Stat["sun"], 1, tier1Stat["recharge"], tier1Stat["startingRecharge"]);//Tier 1
          }else{//Tier 2
            let tier2Stat = currentPlant["t2"];
            new SeedPacket(packetID, currentPlant["name"], tier2Stat["sun"], 2, tier2Stat["recharge"], tier2Stat["startingRecharge"]);//Tier 2
          }
        }
      }
    }
  }
  if (!currentLevel["type"].includes(14)){//Create shovel if not I Zombie
    new SeedPacket("shovel", "Shovel", 0, 0, 0, 0);
  }
}

//General Collision
function collision(){
  //Zombie Collision
  for (let currentZombie of allZombies){
    currentZombie.collision();
  }
  //Plant Collision
  for (let currentPlant of allPlants){
    currentPlant.collision();
  }
  //Clean up dead zombie
  for (let b = 0; b < allZombies.length; b++){
    let currentZombie = allZombies[b];
    if ((currentZombie.health <= 0)||(currentZombie.x < -100)){
      if ((currentZombie.type === 12)&&(currentZombie.inJam())){//Stunner Zombie
        for (let currentPlant of allPlants){
          if ((currentPlant.x + 70 > currentZombie.x - 90)&&(currentPlant.x < currentZombie.x + 150)
          &&(currentPlant.lane >= currentZombie.lane - 1)&&(currentPlant.lane <= currentZombie.lane + 1)){//3x3 Stun Range
            currentPlant.stunTimer = 300;
          }
        }
      }
      let randomValue = Math.floor(Math.random()*100);
      if (randomValue <= 1){//Gold Coin (2%)
        new Collectible(currentZombie.x, currentZombie.y + 30, 3, 100, 1);
      }else if (randomValue <= 8){//Silver Coin (7%)
        new Collectible(currentZombie.x, currentZombie.y + 30, 2, 10, 1);
      }
      allEntities.splice(allEntities.indexOf(currentZombie),1);
      allZombies.splice(b,1);
      b--;
    }
  }
  //Clean up dead plant
  for (let c = 0; c < allPlants.length; c++){
    if (allPlants[c].health <= 0){
      lostPlants++;
      if (allPlants[c].endangered === true){//Endangered Plant Lose Level
        running = false;
        transition.trigger=true;
        transition.screen="gameOver";
      }
      if (allPlants[c].type === 13){//Explode-O-Nut Explosion
        new Particle(0,allPlants[c].x+30,allPlants[c].y+30);
        for (let currentZombie of allZombies){
          if ((currentZombie.x + 30 > allPlants[c].x - 90)&&(currentZombie.x < allPlants[c].x + 150)
          &&(currentZombie.lane >= allPlants[c].lane - 1)&&(currentZombie.lane <= allPlants[c].lane + 1)){//Hurt zombies in 3x3
            currentZombie.determineDamage(allPlants[c].damage);
          }
        }
      }
      if (((allPlants[c].type === 1)||(allPlants[c].type === 2))&&(currentLevel.type.includes(14))){//I Zombie Sunflowers
        new Collectible(allPlants[c].x, allPlants[c].y - 15, 1, 50, 1, false);
        new Collectible(allPlants[c].x + 50, allPlants[c].y - 15, 1, 50, 1, false);
        new Collectible(allPlants[c].x , allPlants[c].y + 35, 1, 50, 1, false);
        new Collectible(allPlants[c].x + 50, allPlants[c].y + 35, 1, 50, 1, false);
      }
      for (let currentTile of tiles){
        if (currentTile.plantID === allPlants[c].id){
          currentTile.occupied = false;
          currentTile.plantID = null;
          break;
        }
      }
      allEntities.splice(allEntities.indexOf(allPlants[c]),1);
      allPlants.splice(c,1);
      c--;
    }
  }
  //Clean up expired collectible
  for (let d = 0; d < allCollectibles.length; d++){
    if (allCollectibles[d].timer <= 0){
      allCollectibles[d].trigger = true;
    }
  }
  //Clean up projectiles
  for (let e = 0; e < allProjectiles.length; e++){
    if ((allProjectiles[e].x > 1000)||(allProjectiles[e].x < -50)||(allProjectiles[e].used === true)){
      allEntities.splice(allEntities.indexOf(allProjectiles[e]),1);
      allProjectiles.splice(e, 1);
      e--;
    }
  }
}

//Draw
function drawStack(){
  //Draw Background
  background(155,160,170);
  levelTimer += levelSpeed;
  //Display Sun Values
  noStroke();
  fill(0,0,0);
  textSize(24);
  //Draw Sun and Coin Amount
  if (!currentLevel["type"].includes(2)){
    text(sun, 65, 40);
  }
  translate(830,635)
  scale(0.6)
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
  scale(5/3)
  translate(-830,-635)
  noStroke()
  fill(0)
  textSize(15);
  textAlign(LEFT,CENTER)
  text(money, 845, 635);
  textAlign(CENTER,CENTER)
  //No Plants Lost
  if (currentLevel["type"].includes(8)){
    textSize(14);
    text(`Plants Left: ${currentLevel["maxLostPlant"] - lostPlants}`, 250, 30);
  }
  //Draw Tiles
  for (let currentTile of tiles){
    if((currentLevel["type"].includes(13))&&(currentTile.y===420)){//Unsodded
      fill(100,60,20);
    }else if (currentTile.color === 0){//Light Blue
      fill(110,105,220);   
    }else{//Dark Blue
      fill(80,170,230);
    }
    rect(currentTile.x, currentTile.y, 80, 100);
    //Outline
    if((currentLevel["type"].includes(13))&&(currentTile.y===420)){//Unsodded
      fill(90,50,10);
    }else if (currentTile.color === 0){//Light Blue
      fill(100,95,210);   
    }else{//Dark Blue
      fill(70,160,220);
    }
    rect(currentTile.x+5, currentTile.y+5, 70, 90)
  }
  //Draw Flower Line (If Level Has It)
  if (currentLevel["type"].includes(7) === true){
    fill(255,0,0);
    for(let a=0;a<20;a++){
      image(graphics.minor[a%7],currentLevel["flowerLine"]+((a*a)%4.3)*4-8.6,120+a*25,25,25)
    }
  }
  //Draw Zombie Line (I Zombie)
  if (currentLevel["type"].includes(14) === true){
    fill(255,0,0);
    for(let a=0;a<20;a++){
      ellipse(currentLevel["plantLine"]+((a*a)%4.3)*4-18.6,120+a*25,30,30)
    }
  }
  //Draw Boss
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
  //Draw Plants
  for (let currentPlant of allPlants){
    currentPlant.draw();
  }
  //Draw Zombies
  for (let currentZombie of allZombies){
    currentZombie.draw();
  }
  //Draw Projectiles
  for (let currentProjectile of allProjectiles){
    currentProjectile.draw();
  }
  //Draw Lawnmowers
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
  //Draw Particles
  for (let currentWhatever of allParticles){
    currentWhatever.draw();
    if(currentWhatever.remove){
      allParticles.splice(allParticles.indexOf(currentWhatever), 1);
      allEntities.splice(allEntities.indexOf(currentWhatever), 1);
    }
  }
  //Draw Conveyor
  if (currentLevel["type"].includes(2) === true){
    fill(40);
    rect(0,0,10,650);
    rect(120,0,10,650);
    fill(60);
    rect(10,0,110,650);
    fill(70);
    for(let a=0;a<24;a++){
      rect(10,10+a*30-(levelTimer)%30,110,8);
    }
  }
  //Draw Fog (If Level Has It)
  if (currentLevel["type"].includes(5) === true){
    fill("rgba(0,0,0,0.3)");//Night Overlay
    rect(0,0,900,650);
    if (currentJam !== 8){//Not Ultimate Jam, Draw Fog
      image(graphics.minor[8],currentLevel["fogLine"]-30,50,800,600);
    }
  }
  //Display Fast Forward Buttons
  strokeWeight(5);
  stroke(80);
  fill(100);
  rect(700,50,60,40,5);
  noStroke();
  fill(40);
  if (levelSpeed === 2){
    regTriangle(714,70,10,-30);
    regTriangle(730,70,10,-30);
    regTriangle(746,70,10,-30);
  }else if (levelSpeed === 1.5){
    regTriangle(722,70,10,-30);
    regTriangle(738,70,10,-30);
  }else{
    regTriangle(730,70,10,-30);
  }
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
  //Display Quit Button
  fill(100);
  stroke(80);
  strokeWeight(5);
  rect(800,30,60,40,5);
  noStroke();
  fill(255,255,255);
  textSize(20);
  text("Quit", 830, 50);
  //Draw Seed Packets and Shovel
  for (let currentPacket of allPackets){
    currentPacket.draw();
  }
  //Draw Sun
  for (let currentCollectible of allCollectibles){
    currentCollectible.draw();
  }
}

//Spawns Zombies in wave
function spawnWave(){
  let currentWaveData = currentLevel["waves"][currentWave];
  let waveLength = currentWaveData.length;
  if ((boomberryActive === false)&&(boomboxActive === false)){//Make sure boomberry is not in effect
  currentJam = currentLevel["jams"][currentWave];
  }
  for (let a = 0; a < waveLength; a++){
    let currentZombie = currentWaveData[a];//Zombie [Type,Lane,Column (Optional)]
    let spawnDelay = null;
    let zombieColumn = null;
    let zombieRow = currentZombie[1];
    let zombieTypeData = zombieStat[currentZombie[0]];//Data from zombieStat array
    if (currentZombie.length === 2){
      spawnDelay = random(90);
      zombieColumn = 9;
    }else{
      if (currentZombie[2] === 9){
        spawnDelay = floor(random()*240);
        zombieColumn = 9;
      }else{//Ambush
        zombieColumn = currentZombie[2];
        spawnDelay = 0;
      }
    }
    //Determine lane and column
    if (zombieRow === 5){
      zombieRow = ceil(random()*5);
    }else{
      zombieRow = currentZombie[1] + 1;
    }
    new Zombie(zombieColumn*80 + 220, zombieRow*100 + 20, zombieRow,currentZombie[0], zombieTypeData["health"], zombieTypeData["shield"], zombieTypeData["degrade"], zombieTypeData["speed"], zombieTypeData["eatSpeed"], zombieTypeData["altEatSpeed"],zombieTypeData["jam"],currentWave + 1,spawnDelay);
  }
}

//Level Mainloop
function levelMainloop(){
  if (running === true){
    if ((currentLevel.type.includes(10))&&(!win)){//Boss Mechanics
      //Show Proper Jam
      if ((boomberryActive === false)&&(boomboxActive === false)){//Make sure boomberry/boombox is not in effect
        currentJam = currentLevel["jams"][currentWave];
      }
      //Boss Moves
      if (Math.floor(Math.floor((globalTimer/2))%240) === 0){
        globalTimer += 2;
        if ((Math.floor(Math.random()*4) === 0)&&(allPlants.length !== 0)){//Missile Attack (25% Chance)
          //Find Random Plants
          let randomIndexes = [];
          let randomPlants = [];
          let totalHit;//Number of Missiles Fired
          if (currentWave <= 3){
            totalHit = 2;
          }else if (currentWave <= 6){
            totalHit = 3;
          }else{
            totalHit = 4;
          }
          while (((randomIndexes.length < totalHit)&&(allPlants.length >= totalHit))||((randomIndexes.length < allPlants.length)&&(allPlants.length < totalHit))){
            let randomIndex = Math.floor(Math.random()*allPlants.length);
            if (!randomIndexes.includes(randomIndex)){
              randomPlants.push(allPlants[randomIndex]);
              randomIndexes.push(randomIndex);
            }
          }
          //Find target tile
          for (let destroyPlant of randomPlants){
            destroyPlant.health -= 2001;
            new Particle(4, destroyPlant.x+30, destroyPlant.y+30);
          }
        }else{//Spawn Zombie
          switch (currentJam){
            case 1://Phase 4 (Punk)
              if (Math.floor(Math.random()*2) === 0){//Normal Zombies
                for (let a = 0; a < 6; a++){
                  let zombieType = Math.floor(Math.random()*2) + 1;//Spawn Conehead or Buckethead
                  createZombie(zombieType);
                }
              }else{//Themed Zombies
                for (let a = 0; a < 5; a++){
                  let zombieType = Math.floor(Math.random()*2) + 9;//Spawn Punk or Banger
                  createZombie(zombieType);
                }
              }
              break;
            case 2://Phase 1 (Pop)
              if (Math.floor(Math.random()*2) === 0){//Normal Zombies
                for (let a = 0; a < 5; a++){
                  let zombieType = Math.floor(Math.random()*2);
                  createZombie(zombieType);//Spawn Regular or Conehead
                }
              }else{//Themed Zombies
                for (let a = 0; a < 3; a++){
                  let zombieType = 11 + Math.floor(Math.random()*2);
                  createZombie(zombieType);//Spawn Glitter or Sparkly
                }
              }
              break;
            case 3://Phase 5 (Rap)
              let randomSpawn = Math.floor(Math.random()*3);
              if (randomSpawn === 0){//Normal Zombies
                for (let a = 0; a < 8; a++){
                  let zombieType = Math.floor(Math.random()*2) + 1;
                  createZombie(zombieType);//Spawn Conehead or Buckethead
                }
              }else if (randomSpawn === 1){//Themed Zombies
                for (let a = 0; a < 4; a++){
                  createZombie(13);//Spawn MC
                }
              }else{//Themed Zombies 2
                for (let a = 0; a < 5; a++){
                  createZombie(14); //Spawn Breakdancer
                }
              }
              break;
            case 4://Phase 6 (Arcade)
              if (Math.floor(Math.random()*2) === 0){//Normal Zombies
                for (let a = 0; a < 20; a++){
                  let zombieType = Math.floor(Math.random()*2) + 16;
                  createZombie(zombieType);//Spawn 8-bit Normal or 8-bit Conehead
                }
              }else{//Themed Zombies
                for (let a = 0; a < 4; a++){
                  createZombie(15);//Spawn Arcade
                }
              }
              break;
            case 5://Phase 3 (Rock)
              if (Math.floor(Math.random()*2) === 0){//Normal Zombies
                for (let a = 0; a < 4; a++){
                  let zombieType = Math.floor(Math.random()*2) + 5;
                  createZombie(zombieType);//Spawn Discohead or Holohead
                }
              }else{//Themed Zombies
                for (let a = 0; a < 6; a++){
                  let zombieType = Math.floor(Math.random()*2) + 19;
                  createZombie(zombieType);//Spawn Shadow or Imp
                }
              }
              break;
            case 6://Phase 2 (Techno)
              if (Math.floor(Math.random()*2) === 0){//Normal Zombies
                for (let a = 0; a < 3; a++){
                  let zombieType = Math.floor(Math.random()*2) + 4;
                  createZombie(zombieType);//Spawn Discohead or Holohead
                }
              }else{//Themed Zombies
                for (let a = 0; a < 4; a++){
                  let zombieType = Math.floor(Math.random()*2) + 21;
                  createZombie(zombieType);//Spawn Gadgeter or Techie
                }
              }
              break;
            case 8://Phase 7 (Ultimate)
              if (Math.floor(Math.random()*2) === 0){//Normal Zombies
                for (let a = 0; a < 8; a++){
                  let zombieType = Math.floor(Math.random()*18);
                  createZombie(zombieType);//Spawn Anything
                }
              }else{//Spawn Garg and Newspaper
                createZombie(7);
                createZombie(18);
              }
              break;
            default://During Boomberry
              for (let a = 0; a < 3; a++){
                let zombieType = Math.floor(Math.random()*4) + 5;
                createZombie(zombieType);//Spawn Discohead/Holohead/Newspaper/Football
              }
              break;
          }
        }
      }
      //Advance Phase
      if (bossDamage >= 10000){
        bossDamage = 0;
        currentWave++;
      }
      //Win Condition
      if (currentWave >= 7){
        win = true;
        for (let currentZombie of allZombies){
          currentZombie.health = 0;
        }
      }
    }else{//Not Boss
      waveTimer += levelSpeed;
    }
    sunTimer -= levelSpeed;
    conveyorTimer += levelSpeed;
    globalTimer += levelSpeed;
    //Collect Collectibles (Sun and Coins)
    if (mouseIsPressed === true){
      for (let a = 0; a < allCollectibles.length; a++){
        let currentCollectible = allCollectibles[a];
        if ((pointBox(mouseX, mouseY, currentCollectible.x - 25, currentCollectible.y - 25, 50, 50))&&(mouseY < currentCollectible.y + 25)&&(!allCollectibles[a].trigger)){
          if (currentCollectible.type === 1){//Sun
            sun += currentCollectible.value;
          }else{//Coin
            money += currentCollectible.value;
          }
          allCollectibles[a].trigger = true;
        }
        if(allCollectibles[a].remove){//Delete Collectible
          allEntities.splice(allEntities.indexOf(currentCollectible),1);
          allCollectibles.splice(a,1);
          a--;
        }
      }
    }
    //Determine Win (I Zombie does not require all zombie deaths)
    if (((currentWave >= currentLevel["waves"].length)&&(allZombies.length === 0))||((currentLevel.type.includes(14))&&(currentWave >= currentLevel["waves"].length))){
      win = true;
    }
    //Falling Sun (Not for conveyor or night level or last stand or I Zombie)
    if ((sunTimer <= 0)&&(currentLevel["type"].includes(2) === false)&&(currentLevel["type"].includes(4) === false)&&(!currentLevel["type"].includes(5))&&(!currentLevel["type"].includes(14))){
      sunTimer = 420 + currentWave*30;
      new Collectible(200 + floor(random()*550), -40, 1, 50, 1, true);
    }
    //Create Conveyor Packets
    if ((currentLevel["type"].includes(2) === true)&&(((currentWave <= currentLevel["waves"].length)&&(currentLevel["type"].includes(10) === false))||((currentWave < currentLevel["waves"].length)&&(currentLevel["type"].includes(10))))){
      let currentWaveConveyorProbability = currentLevel["conveyorProbability"][currentWave][1];
      if ((conveyorTimer >= currentLevel["conveyorProbability"][currentWave][0])&&(allPackets.length < 11)){//If greater than time between packets and conveyor not full
        let randomNumber = floor(random()*100);
        let startingPoint = 0;
        let seedData = null;
        for (let nextProb of currentWaveConveyorProbability){
          if ((randomNumber >= startingPoint)&&(randomNumber < startingPoint + nextProb[2])){//Find proper range
            seedData = nextProb;
            break;
          }
          startingPoint += nextProb[2];
        }
        //Find corresponding plant
        for (let currentPlant of plantStat){
          if (currentPlant.type === seedData[0]){
            let newPacket;
            if (seedData[1] === 1){//Tier 1
              newPacket = new SeedPacket(seedData[0], currentPlant["name"], 0, 1, 0, 0, true);
            }else{//Tier 2
              newPacket = new SeedPacket(seedData[0], currentPlant["name"], 0, 2, 0, 0, true);
            }
            newPacket.x = 5;
            newPacket.y = 655;
          }
        }
        conveyorTimer = 0;
      }
    }
    //Spawn New Wave
    if ((!currentLevel["type"].includes(10))&&(!currentLevel["type"].includes(14))){
      let spawnNextWave = false;
      let totalWaveHealth = 0;
      let currentWaveHealth = 0;
      if ((currentWave !== 0)&&(currentWave < currentLevel["waves"].length)){
        if (allZombies.length === 0){//No Zombies
          spawnNextWave = true;
        }else{
          //Determine Total Wave Health
          for (let a = 0; a < currentLevel["waves"][currentWave - 1].length; a++){
            let currentZombie = currentLevel["waves"][currentWave - 1][a];
            totalWaveHealth += zombieStat[currentZombie[0]]["health"];
          }
          //Determine Current Health
          for (let currentZombie of allZombies){
            if (currentZombie.waveSpawn === currentWave){
              currentWaveHealth += currentZombie.health;
            }
          }
          if ((currentWaveHealth/totalWaveHealth < 0.25)){//75% Spawning Rule
            spawnNextWave = true;
          }
        }
      }
      if ((waveTimer > currentLevel["waveDelay"][currentWave])||(spawnNextWave === true)){
        spawnWave();
        waveTimer = 0;
        currentWave++;
      }
    }
    //Clear Glitter Effect and Spawn Arcade and Regenerate Shield (General Zombie Reset)
    for (let currentZombie of allZombies){
      currentZombie.protected = false;
      //Pink Paramount Invincibility
      if ((currentLevel["type"].includes(12))&&(globalTimer%1200 > 800)){
        currentZombie.protected = true;
      }
      if ((currentZombie.type === 15)&&(currentZombie.reload <= 0)&&((currentJam === 4)||(currentJam === 8))){//Arcade Zombie Spawn
        currentZombie.reload = 720;
        let zombieTypeData = null;
        let zombieType = null;
        if (floor(random()*2) === 0){//Normal 8-bit
          zombieType = 16;
        }else{//Conehead 8-bit
          zombieType = 17;
        }
        zombieTypeData = zombieStat[zombieType];
        new Zombie(currentZombie.x - 40, currentZombie.y, currentZombie.lane, zombieType, zombieTypeData["health"], zombieTypeData["shield"], zombieTypeData["degrade"], 
        zombieTypeData["speed"], zombieTypeData["eatSpeed"], zombieTypeData["altEatSpeed"], zombieTypeData["jam"], -1, 0);
      }
      if ((currentZombie.type === 21)&&((currentJam === 6)||(currentJam === 8))){//Techie Shield Regen
        if ((currentZombie.shieldHealth < 600)&&(currentZombie.reload <= 0)){//Shield not at full health and not regenerating
          currentZombie.reload = 900;//Wait 15 seconds to regenerate         
        }
        if ((currentZombie.shieldHealth < 600)&&(currentZombie.reload > 1)&&(currentZombie.reload < 10)){//Regenerate when timer runs out
          currentZombie.shieldHealth = 600;
          currentZombie.reload = 0;       
        }
      }
    }
    //Move
    for (let currentZombie of allZombies){//Pre move zombies for glitter effect to take place
      currentZombie.move();
    }
    for (let currentEntity of allEntities){
      if (!currentEntity.isZombie){
        currentEntity.move();
      }
    }
    collision();
    drawStack();
    //Determine game over for Don't Lose X Plants Levels
    if (currentLevel["type"].includes(8)){
      if (lostPlants > currentLevel["maxLostPlant"]){
        running = false;
        transition.trigger=true;
        transition.screen="gameOver";
      }
    }
    //Determine game over for I Zombie
    if ((currentLevel.type.includes(14))&&(!win)&&(allCollectibles.length === 0)){
      let zombieAlive = false;
      for (let currentZombie of allZombies){
        if (currentZombie.x > 50){
          zombieAlive = true;
        }
      }
      if ((sun < 50)&&(!zombieAlive)&&(!win)){
        running = false;
        transition.trigger=true;
        transition.screen="gameOver";
      }
    }
    //Win Button
    if (win === true){
      noStroke();
      fill(80);
      rect(350, 20, 200, 120, 10);
      fill(0);
      textSize(20);
      let finalReward = determineReward();
      text(`You Got:\n${finalReward}`,450,95);
    }
  }
}

//Setup 
function setup(){
  createCanvas(900,650);
  textAlign(CENTER,CENTER);
  textWrap(WORD);
  textFont('monospace',20);
  angleMode(DEGREES);
  setupGraphics();
  //Create Almanac Data
  displayPlant = new Plant(1, width/2-30,height/2-100, 0,0,99999, 
    0, 0, 0, 0, 0);
  displayPlant.size = 2;
  displayZombie = new Zombie(width/2-15,height/2,0,0,9999,9999,0,0,0,0,0,0);
  displayZombie.fade = 255;
  displayZombie.health = 99999;
  displayZombie.size = 2.4;
  displayPlants=[]
  useless=[3,8,9,21,24]
  for(a=0;a<5;a++){
    displayPlants.push(new Plant(useless[a], width/2-30-200+(a%3)*200+floor(a/3)*100,250+floor(a/3)*200, 0,0,99999, 
    0, 0, 0, 0, 0))
  }
  allPlants = [];
  allZombies = [];
  allEntities = [];
}

//Draw/Mainloop
function draw(){
  clear();
  switch (screen){
    case "initial"://Title Screen 
      background(0);
      noStroke();
      fill(200);
      textSize(80);
      text('NMT',width/2,200);
      textSize(20);
      text('MD/DP Production',width/2,250);
      fill(120);
      rect(width/2-60,400,120,50,10);
      rect(width/2-60,460,120,50,10);
      fill(0);
      textSize(20);
      text('Start',width/2,425);
      text('Minigames',width/2,485);
      break;
    case "regularLevelSelect"://Levels 1-36 Selection
      background(0,0,0);
      fill(230,230,230);
      textSize(25);
      text("Level Select", 450, 60);
      noStroke();
      for (let a = 1; a < 37; a++){//Level Button Select
        let levelName = "l" + a.toString();
        let levelUnlocked = unlockedLevels.includes(levelName);
        //Level Button
        if (levelUnlocked){
          if((a+floor((a-1)/6))%2 === 0){
            fill(110,105,220);
          }else{
            fill(80,170,230);
          }
        }else{
          fill(110);
        }
        let buttonX = ((a-1)%6)*80+225;
        let buttonY = floor((a-1)/6)*80+100;
        rect(buttonX, buttonY, 50, 50,3);
        fill(0);
        text(a, buttonX + 25, buttonY + 25);
        if (pointBox(mouseX, mouseY, buttonX, buttonY, 50, 50)&&(mouseIsPressed === true)&&(levelUnlocked)){
          currentLevel = levels["l" + a.toString()];
          if (currentLevel.daveSpeech.length !== 0){//There is Dialogue
            daveSetup();
          }else if ((currentLevel.type.includes(10))||(currentLevel.type.includes(14))){//Boss or I Zombie
            initialLevelSetup();
            finalLevelSetup();
            transition.trigger = true;
            transition.screen = "level";
          }else{//Normal
            initialLevelSetup();
            chooseSeeds();
          }
          break;
        }
      }
      //Almanac Button 
      fill(180);
      rect(760,20,120,40,3);
      rect(310,570,120,40,3);
      rect(470,570,120,40,3);
      fill(0);
      textSize(20);
      text('Almanac',370,590);
      text('Shop',530,590);
      text('Back',820,40);
      break;
    case "minigameSelect"://Minigames
      background(0,0,0);
      fill(230,230,230);
      textSize(25);
      text("Minigames", 450, 60);
      noStroke();
      for (let a = 1; a < 10; a++){//Minigame Select
        let levelName = "m" + a.toString();
        let levelUnlocked = unlockedLevels.includes(levelName);
        //Level Button
        if (levelUnlocked){
          if(a%2 === 0){
            fill(110,105,220);   
          }else{
            fill(80,170,230);
          }
        }else{
          fill(110);
        }
        let buttonX = ((a-1)%3)*80+345;
        let buttonY = floor((a-1)/3)*80+180;
        rect(buttonX, buttonY, 50, 50,3);
        fill(0);
        text(a, buttonX + 25, buttonY + 25);
        //Make sure level is unlocked
        if ((pointBox(mouseX, mouseY, buttonX, buttonY, 50, 50))&&(mouseIsPressed === true)&&(levelUnlocked)){
          currentLevel = levels[levelName];
          if (currentLevel.daveSpeech.length !== 0){//There is Dialogue
            daveSetup();
          }else if ((currentLevel.type.includes(10))||(currentLevel.type.includes(14))){//Boss or I Zombie
            initialLevelSetup();
            finalLevelSetup();
            transition.trigger=true;
            transition.screen="level";
          }else{//Normal
            initialLevelSetup();
            chooseSeeds();
          }
          break;
        }
      }
      fill(180);
      rect(760,20,120,40,3);
      rect(310,570,120,40,3);
      rect(470,570,120,40,3);
      fill(0);
      textSize(20);
      text('Almanac',370,590);
      text('Shop',530,590);
      text('Back',820,40);
      break;
    case "daveSpeech"://Crazy Dave
      daveLoop();
      break;
    case "chooseSeeds"://Choose Your Seeds
      chooseSeedLoop();
      break;
    case "prepareDefense"://Last Stand Preparation
      prepareDefense();
      //Button to start level
      fill(100);
      stroke(80);
      strokeWeight(5);
      rect(190,30,80,40,5);
      noStroke();
      fill(255,255,255);
      textSize(20);
      text("Start", 230, 50);
      break;
    case "level"://Regular Gameplay
      levelMainloop();
      break;
    case "gameOver"://Game Over Screen
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
      break;
    case "almanac"://General Almanac Screen
      //Basic Interface
      background(0);
      noStroke();
      fill(180);
      rect(width/4-50,height/2-50,100,100,5);//Left
      rect(width*3/4-50,height/2-50,100,100,5);//Right
      rect(50,50,100,50,5);
      fill(255);
      textSize(40);
      text('Almanac',width/2,height/4);
      fill(0);
      textSize(20);
      text('Plants',width/4,height/2);
      text('Zombies',width*3/4,height/2);
      textSize(16);
      text('Back',100,75);  
      break;
    case "almanacPlant"://Plant Almanac
      genText=['',''];
      background(150);
      displayPlant.draw();
      noStroke();
      fill(110);
      rect(width/2-70,350,140,50,5);
      rect(50,350,100,50,5);
      rect(width-150,350,100,50,5);
      rect(50,50,100,50,5);
      fill(0);
      textSize(60);
      text(plantStat[displayPlant.type-1].name,width/2,100);
      textSize(20);
      text(plantStat[displayPlant.type-1].description,width/2,585);
      text('Tier 1',width/3,360);
      text('Tier 2',width*2/3,360);
      textAlign(CENTER,TOP);
      genText[0]+='\nSun: '+plantStat[displayPlant.type-1].t1.sun;
      genText[1]+='\nSun: '+plantStat[displayPlant.type-1].t2.sun;
      if(plantStat[displayPlant.type-1].t1.recharge>0){
        genText[0]+='\nRecharge: '+plantStat[displayPlant.type-1].t1.recharge/60;
      }
      if(plantStat[displayPlant.type-1].t2.recharge>0){
        genText[1]+='\nRecharge: '+plantStat[displayPlant.type-1].t2.recharge/60;
      }
      if(plantStat[displayPlant.type-1].t1.recharge!=plantStat[displayPlant.type-1].t1.startRecharge){
        genText[0]+='\nStarting Recharge: '+ plantStat[displayPlant.type-1].t1.startingRecharge/60;
      }
      if(plantStat[displayPlant.type-1].t2.recharge!=plantStat[displayPlant.type-1].t2.startRecharge){
        genText[1]+='\nStarting Recharge: '+ plantStat[displayPlant.type-1].t2.startingRecharge/60;
      }
      if(plantStat[displayPlant.type-1].t1.health<10000){
        genText[0]+='\nHealth: '+plantStat[displayPlant.type-1].t1.health;
      }
      if(plantStat[displayPlant.type-1].t2.health<10000){
        genText[1]+='\nHealth: '+plantStat[displayPlant.type-1].t2.health;
      }
      if(plantStat[displayPlant.type-1].t1.damage>0){
        genText[0]+='\nDamage: '+plantStat[displayPlant.type-1].t1.damage;
      }
      if(plantStat[displayPlant.type-1].t2.damage>0){
        genText[1]+='\nDamage: '+plantStat[displayPlant.type-1].t2.damage;
      }
      if(plantStat[displayPlant.type-1].t1.splashDamage>0){
        genText[0]+='\nSplash Damage: '+plantStat[displayPlant.type-1].t1.splashDamage;
      }
      if(plantStat[displayPlant.type-1].t2.splashDamage>0){
        genText[1]+='\nSplash Damage: '+plantStat[displayPlant.type-1].t2.splashDamage;
      }
      if(plantStat[displayPlant.type-1].t1.reload>0){
        genText[0]+='\nReload: '+ round(plantStat[displayPlant.type-1].t1.reload/60);
      }
      if(plantStat[displayPlant.type-1].t2.reload>0){
        genText[1]+='\nReload: '+ round(plantStat[displayPlant.type-1].t2.reload/60);
      }
      textSize(16);
      text(genText[0],width/3,400);
      text(genText[1],width*2/3,400);
      text(`Current Tier: ${plantTier[displayPlant.type-1]}`,width/2,330);
      textAlign(CENTER,CENTER);
      text('Change Tier\n1000 Coins',width/2,375);
      text('Previous', 100, 375);
      text('Next', width-100, 375);
      text('Back',100,75);
      translate(830,635);
      scale(0.6);
      fill(225,this.fade);
      ellipse(0,0,30,30);
      stroke(150,this.fade);
      strokeWeight(4);
      noFill();
      arc(0,-5,12,10,90,270);
      arc(0,5,12,10,-90,90);
      line(0,-10,5,-10);
      line(0,10,-5,10);
      line(0,-13,0,13);
      scale(5/3);
      translate(-830,-635);
      noStroke();
      fill(0);
      textSize(15);
      textAlign(LEFT,CENTER);
      text(money, 845, 635);
      textAlign(CENTER,CENTER);
      break;
    case "almanacZombie"://Zombie Almanac
      genText=['',''];
      background(150);
      displayZombie.draw();
      noStroke();
      fill(110);
      rect(50,350,100,50,5);
      rect(width-150,350,100,50,5);
      rect(50,50,100,50,5);
      fill(0);
      textSize(60);
      text(zombieStat[displayZombie.type].name,width/2, 100);
      textSize(20);
      text(zombieStat[displayZombie.type].description,width/2, 550);
      textAlign(CENTER,TOP);
      if(zombieStat[displayZombie.type].health>0){
        genText[0]+='\nHealth: '+ zombieStat[displayZombie.type].health;
      }
      if(zombieStat[displayZombie.type].shield>0){
        genText[0]+='\nShield: '+ zombieStat[displayZombie.type].shield;
      }
      if(zombieStat[displayZombie.type].speed>0){
        genText[0]+='\nSpeed: '+ zombieStat[displayZombie.type].speed;
      }
      if(zombieStat[displayZombie.type].eatSpeed>0){
        genText[0]+='\nEat Speed: '+ zombieStat[displayZombie.type].eatSpeed;
      }
      if((zombieStat[displayZombie.type].altEatSpeed > 0)&&(zombieStat[displayZombie.type].altEatSpeed !== zombieStat[displayZombie.type].eatSpeed)){
        genText[0]+='\nAlternate Eat Speed: '+ zombieStat[displayZombie.type].altEatSpeed;
      }
      textSize(16);
      text(genText[0], width/2,400);
      textAlign(CENTER,CENTER);
      text('Previous',100,375);
      text('Next',width-100,375);
      text('Back',100,75);  
      break;
    case "shop"://Shop
      background(150);
      noStroke();
      fill(80)
      for(let a=0;a<displayPlants.length;a++){
        rect(displayPlants[a].x-20,displayPlants[a].y-20,100,100,5)
      }
      for(let a=0;a<displayPlants.length;a++){
        displayPlants[a].draw();
      }
      noStroke();
      fill(80)
      fill(110);
      rect(50,50,100,50,5);
      fill(0);
      textSize(40)
      text('Costs 10000 Each',width/2,100)
      textSize(20);
      for(let a=0;a<displayPlants.length;a++){
        text(plantStat[displayPlants[a].type-1].name,displayPlants[a].x+30,displayPlants[a].y-60);
      }
      textSize(16);
      text('Back',100,75);
      translate(830,635);
      scale(0.6);
      fill(225,this.fade);
      ellipse(0,0,30,30);
      stroke(150,this.fade);
      strokeWeight(4);
      noFill();
      arc(0,-5,12,10,90,270);
      arc(0,5,12,10,-90,90);
      line(0,-10,5,-10);
      line(0,10,-5,10);
      line(0,-13,0,13);
      scale(5/3);
      translate(-830,-635);
      noStroke();
      fill(0);
      textSize(15);
      textAlign(LEFT,CENTER);
      text(money, 845, 635);
      textAlign(CENTER,CENTER);
      break;
    default:
      console.log("This Screen Does Not Exist");
  }
  displayTransition(transition);
}


