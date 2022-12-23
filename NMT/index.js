/* Main JS File */
//Version 1.1.0

//Changeable Stats
let seedSlots = 5;//Number of Seed Slots
let money = 0;//In Game Currency

//General Systems
let screen = "initial";
let readyPlant = null;//ID Holder For Planting and Shoveling
let running = false;//Determines if level is running
let win = false;//Determines Win

//Gameplay System
let idIndexer = 1;//Index Object ID
let levelSpeed = 1;//Level Speed (1, 1.5, 2)
let selectedPackets = [];//Chosen Seed Packets
let sun = 75;//Sun in Level
let currentLevel = null;//Holds Current Level Object
let currentWave = 0;//Current Wave
let currentJam = 0;//Jams: 0: Normal, 1: Punk, 2: Pop, 3: Rap, 4: 8-bit, 5: Metal, 6: Techno, 7: Ballad, 8: Everything (except ballad)
let waveTimer = 0;//Time between waves
let sunTimer = 0;//Sun falling from the sky
let conveyorTimer = 0;//Time between conveyor seed packets
let globalTimer = 0;//Global timer for anything
let bossDamage = 0;//Damage Done To Boss
let boomberryActive = false;//Determines if Boomberry Effect is Active
let boomboxActive = false;//Determines if Boombox Effect is Active
let lostPlants = 0;//Number of Plants Lost(for Don't Lose Plants Levels)
let daveIndex = 0;//Current Index of Crazy Dave Dialogue
let rentSlot = false;//Determines if Seed Slot is Being Rented

//Reward/Unlocking System
let unlockedPackets = [1,4,7,12,18
//,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29
];
let unlockedLevels = [
"l1",
//"l2","l3","l4","l5","l6","l7","l8","l9","l10",
//"l11","l12","l13","l14","l15","l16","l17","l18","l19","l20",
//"l21","l22","l23","l24","l25","l26","l27","l28","l29","l30",
//"l31","l32","l33","l34","l35","l36","m1","m2","m3","m4","m5","m6","m7","m8","m9"
];

//Array of classes
let allEntities = [];
let allPlants = [];
let allZombies = [];
let allProjectiles = [];
let allCollectibles = [];
let allPackets = [];
let allParticles = [];
let lawnMowers = [];
let tiles = [];

//Graphics
let graphics = {minor:[]};
let transition = {trigger:false,anim:0,screen:screen};

//Almanac System
let displayPlant;//For showing plant in almanac
let displayZombie;//For showing zombie in almanac
let displayZombies = [];//For showing zombies in seed select
let displayPlants = [];//For shop

//Current Plant Tiers (Default is all tier 1)
let plantTier = [];
for (let d = 0; d < 30; d++){
  plantTier.push(1);
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

//Create Zombie Shortcut (Primarily for Zomboss)
function createZombie(type, lane = 5){//Keep in mind that lane 0 -> 4 are lanes 1 -> 5, "lane" 5 points to a random lane
  let zombieInfo = zombieStat[type];
  let finalLane = lane;
  if (lane === 5){//Random Lane Assignment
    finalLane = Math.floor(Math.random()*5) + 1;
  }
  new Zombie(580 + Math.floor(50*Math.random()), finalLane*100 + 20, finalLane, type, 
  zombieInfo["health"], zombieInfo["shield"], zombieInfo["degrade"], zombieInfo["speed"], 
  zombieInfo["eatSpeed"], zombieInfo["altSpeed"], zombieInfo["altEatSpeed"], zombieInfo["jam"], 0);
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

// General Methods

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
  //Despawning
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

//Spawns Zombies in wave
function spawnWave(){
  let currentWaveData = currentLevel["waves"][currentWave];
  let waveLength = currentWaveData.length;
  if ((boomberryActive === false)&&(boomboxActive === false)){//Make sure boomberry is not in effect
    currentJam = currentLevel["jams"][currentWave];
  }
  for (let a = 0; a < waveLength; a++){
    let currentZombie = currentWaveData[a];//Zombie [Type,Lane,Column (Optional)]
    let zombieColumn = currentZombie.length === 2 ? 9 : currentZombie[2];
    let zombieXVariation = zombieColumn === 9 ? random(50) : 0;
    let zombieRow = currentZombie[1];
    let zombieTypeData = zombieStat[currentZombie[0]];//Data from zombieStat array
    //Determine lane and column
    if (zombieRow === 5){
      zombieRow = ceil(random(5));
    }else{
      zombieRow = currentZombie[1] + 1;
    }
    new Zombie(zombieColumn*80 + 230 + zombieXVariation, zombieRow*100 + 20, zombieRow, currentZombie[0], zombieTypeData["health"], 
    zombieTypeData["shield"], zombieTypeData["degrade"], zombieTypeData["speed"], zombieTypeData["eatSpeed"], 
    zombieTypeData["altSpeed"], zombieTypeData["altEatSpeed"], zombieTypeData["jam"], currentWave + 1);
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
        zombieTypeData["speed"], zombieTypeData["eatSpeed"], zombieTypeData["altSpeed"], zombieTypeData["altEatSpeed"], zombieTypeData["jam"], -1, 0);
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

//Save Current Game Data (Current Level Data Not Included)
function saveData(){
  localStorage.setItem("money",`${money}`);
  localStorage.setItem("unlockedPlants", unlockedPackets.join(","));
  localStorage.setItem("unlockedLevels", unlockedLevels.join(","));
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
  displayZombie = new Zombie(width/2-15,height/2,0,0,9999,9999,0,0,0,0,0,0,0);
  displayZombie.fade = 255;
  displayZombie.health = 99999;
  displayZombie.size = 2.4;
  displayPlants=[];
  useless=[3,8,9,13,21,24,27];//Shop Plants
  for(a=0;a<7;a++){
    displayPlants.push(new Plant(useless[a], width/2-320+(a%4)*200+floor(a/4)*100,250+floor(a/4)*200, 0,0,99999, 
    0, 0, 0, 0, 0))
  }
  allPlants = [];
  allZombies = [];
  allEntities = [];
  //Set and Read Save Data
  money = localStorage.getItem("money");
  if (money === null){//If Save Data Does Not Exist
    money = 0;
    unlockedPackets = [1,4,7,12,18];
    unlockedLevels = ["l1"];
    saveData();
  }
  money = parseInt(localStorage.getItem("money"));
  unlockedPackets = localStorage.getItem("unlockedPlants").split(",");
  for (let currentPacket in unlockedPackets){
    unlockedPackets[currentPacket] = parseInt(unlockedPackets[currentPacket]);
  }
  unlockedLevels = localStorage.getItem("unlockedLevels").split(",");
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
      rect(width/2-60,570,120,50,10);
      fill(0);
      textSize(20);
      text('Start',width/2,425);
      text('Minigames',width/2,485);
      text('Save',width/2,595);
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
      text('$'+money, 805, 635);
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


