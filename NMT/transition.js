/* Screen Entrances for Levels */
// Runs in order from top to bottom (roughly)

// Imporant Info
// 1. Screens are listed in order of appearance (eg. daveSetup -> daveLoop -> etc.)
// 2. index.js or draw.js contains majority of calls to these functions

//Crazy Dave Entrance
function daveSetup() {
  transition.trigger = true;
  transition.screen = "daveSpeech";
  screen = "daveSpeech";
  clickCooldown = 20;//Prevent dialogue skipping
  daveIndex = 0;
  basicLevelSetup();
  if (currentLevel.type.includes(3)) {//Locked and Loaded
    selectedPackets = currentLevel.givenPlants;
  }
}

//Crazy Dave Loop
function daveLoop() {
  clickCooldown--;
  backgroundDrawStack();
  background('rgba(0,0,0,0.2)');
  if (daveIndex >= currentLevel.daveSpeech.length) {
    if (currentLevel.type.includes(10)) {//Boss 
      selectedPackets = [];
      allPackets = [];
      advancedLevelSetup();
      transition.trigger = true;
      transition.screen = "level";
      screen = "level";
    } else if (currentLevel.type.includes(14)) {//I Zombie
      transition.trigger = true;
      transition.screen = "level";
      advancedLevelSetup();
      screen = "level";
    } else {//Normal
      initiateChooseSeeds();
    }
  }
  stroke(220);
  fill(230);
  strokeWeight(10);
  rect(450, 350, 300, 180, 10);
  fill(0, 0, 0);
  noStroke();
  textSize(16);
  text(currentLevel.daveSpeech[min(currentLevel.daveSpeech.length - 1, daveIndex)], 600, 420);
  textSize(12);
  text("Click to Continue", 600, 510);
  translate(300, 800);
  scale(6);
  stroke(120, 80, 40, this.fade);
  strokeWeight(4);
  line(-4, -30, -8, 0);
  line(4, -30, 8, 0);
  line(-6, -48, -15, -24);
  line(6, -48, 15, -24);
  noStroke();
  fill(90, 60, 30, this.fade);
  ellipse(0, -45, 18, 36);
  fill(150, 100, 50, this.fade);
  arc(5, -45, 10, 36, -90, 90);
  arc(-5, -45, 10, 36, 90, 270);
  fill(240, 220, 180, this.fade);
  ellipse(0, -75, 30, 30);
  fill(0, this.fade);
  ellipse(4, -72, 4, 4);
  ellipse(12, -72, 4, 4);
  fill(210, this.fade);
  rect(-15, -91, 30, 13, 3);
  rect(-24, -82, 24, 4);
  scale(1 / 6);
  translate(-300, 800);
}

//Get Game To Crazy Dave Screen (Or Equivalent)
function basicLevelSetup() {
  //Determine Number of Seed Slots
  seedSlots = unlockedPackets.length > 7 ? 7 : unlockedPackets.length;
  //Create Level Zombie Display
  let zombiesInLevel = [];
  for (let nextWave of currentLevel.waves) {
    for (let nextZombie of nextWave) {
      if (!zombiesInLevel.includes(nextZombie[0])) {
        zombiesInLevel.push(nextZombie[0]);
      }
    }
  }
  //Randomize Array Order (Knuth Shuffle)
  let currentIndex = zombiesInLevel.length, randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [zombiesInLevel[currentIndex], zombiesInLevel[randomIndex]] = [zombiesInLevel[randomIndex], zombiesInLevel[currentIndex]];
  }
  displayZombies = []; //Create Display Zombies
  for (let a = 0, la = zombiesInLevel.length; a < la; a++) {
    displayZombies.push(new Zombie(190 + a * 40, 590 - (a % 2) * 60, 0, zombiesInLevel[a], 9999, 9999, 0, 0, 0, 0, 0, -1, -1));
    displayZombies[displayZombies.length - 1].fade = 255;
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
  rentSlot = false;
  if (currentLevel["type"].includes(5) === true) {//Night Time Sun Bonus 
    sun = 100;
  } else if (currentLevel["type"].includes(14) === true) {//I Zombie
    sun = 150;
  } else {//Regular Level
    sun = 75;
  }
  if (currentLevel["startingSun"]) {//If starting sun specified OR Last Stand Level
    sun = currentLevel["startingSun"];
  }
  lostPlants = 0;
  allPackets = [];
  allPlants = [];
  allZombies = [];
  allCollectibles = [];
  allEntities = [];
  allProjectiles = [];
  if (currentLevel["type"].includes(14)) {//I Zombie
    lawnMowers = [];
    currentJam = currentLevel.jams[0];
  } else {//Normal
    lawnMowers = [
      { x: 140, y: 140, active: false },
      { x: 140, y: 240, active: false },
      { x: 140, y: 340, active: false },
      { x: 140, y: 440, active: false },
      { x: 140, y: 540, active: false }
    ];
  }
  //Reset Tiles
  tiles = [];
  for (let a = 0; a < 45; a++) {
    tiles.push({
      x: Math.floor(a % 9) * 80 + 180,
      y: Math.floor(a / 9) * 100 + 120,
      occupied: false,
      plantID: null,
      color: a % 2,
      id: a
    });
  }
  //Set Up Boss
  if (currentLevel["type"].includes(10) === true) {
    bossDamage = 0;
    //Spawn Zombies to take damage for boss
    new Zombie(665, 120, 1, 24, 10000000, 0, [], 0, 0, 0, 0, -1, 0, 0);
    new Zombie(665, 220, 2, 24, 10000000, 0, [], 0, 0, 0, 0, -1, 0, 0);
    new Zombie(665, 320, 3, 24, 10000000, 0, [], 0, 0, 0, 0, -1, 0, 0);
    new Zombie(665, 420, 4, 24, 10000000, 0, [], 0, 0, 0, 0, -1, 0, 0);
    new Zombie(665, 520, 5, 24, 10000000, 0, [], 0, 0, 0, 0, -1, 0, 0);
  }
  //Create Endangered Plants
  if (currentLevel["type"].includes(6) === true) {
    for (let nextPlant of currentLevel["endangeredPlant"]) {//Format is [plant type, tier, tile number]
      for (let currentTileNumber in tiles) {//Find correct tile
        if (parseInt(currentTileNumber) + 1 === nextPlant[2]) {//Tile number is 1 -> 45
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
  if (currentLevel["type"].includes(14) === true) {
    let finalLayout = [];
    let uninitializedLayout = currentLevel["startingRandomPlants"];
    let randomizedLayout = [];
    //Create Array of Plants
    for (let b = 0; b < uninitializedLayout.length; b++) {
      for (let c = 0; c < uninitializedLayout[b][2]; c++) {
        randomizedLayout.push([uninitializedLayout[b][0], uninitializedLayout[b][1]]);
      }
    }
    //Randomize Array Order (Knuth Shuffle)
    let currentIndex = randomizedLayout.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [randomizedLayout[currentIndex], randomizedLayout[randomIndex]] = [randomizedLayout[randomIndex], randomizedLayout[currentIndex]];
    }
    //Format Plants
    let boardWidth = (currentLevel.plantLine - 180) / 80;
    for (let a = 0; a < boardWidth * 5; a++) {
      finalLayout.push([randomizedLayout[a][0], randomizedLayout[a][1], (Math.floor(a / boardWidth)) * 9 + a % boardWidth + 1]);
    }
    //Add (Create) Plants To Tiles
    for (let nextPlant of finalLayout) {//Format of "nextPlant" is [plant type, tier, tile number]
      for (let currentTileNumber in tiles) {//Find correct tile
        if (parseInt(currentTileNumber) + 1 === nextPlant[2]) {//Tile number is 1 -> 45
          let currentTile = tiles[currentTileNumber];
          currentTile.occupied = true;
          let newPlant = createPlant(nextPlant[0], nextPlant[1], currentTile.x + 10, currentTile.y + 10);
          currentTile.plantID = newPlant.id;
          break;
        }
      }
    }
  }
  //Create CYS (Choose Your Seeds) Seed Packets
  if (currentLevel["type"].includes(3) === true) {//Locked and Loaded
    if (currentLevel["type"].includes(14)) {//I Zombie
      for (let currentPacket of currentLevel.givenPlants) {
        for (let currentZombieNum in zombieStat) {//Find correct zombie
          let currentZombie = zombieStat[currentZombieNum];
          if (currentZombie["type"] === currentPacket[0]) {//Find type
            let newPacket = new SeedPacket(currentPacket[0], currentZombie.name, currentZombie.sun, 1, 0, 0, false, true);
            newPacket.move();
          }
        }
      }
    } else {//Normal Locked and Loaded

    }
  }
}

//Initiate choose your seeds screen
function initiateChooseSeeds() {
  allPackets = [];
  if (currentLevel["type"].includes(3) === true) {//Locked and Loaded (Show Seed Packets)
    for (let currentPacket of currentLevel.givenPlants) {
      let newPacket = createSeedPacket(currentPacket[0], -1000, -1000, currentPacket[1]);
      newPacket.move();
    }
  }
  for (let a = 0, plantLength = plantStat.length; a < plantLength; a++) {
    let buttonX = ((a) % 5) * 140 + 180;
    let buttonY = floor((a) / 5) * 70 + 100;
    let newPacket = createSeedPacket(a + 1, buttonX, buttonY);
    newPacket.recharge = 0;
  }
  // Move onto next screen
  selectedPackets = [];
  transition.trigger = true;
  transition.screen = "chooseSeeds";
}

//Loop for Choose Your Seeds
function chooseSeedLoop() {
  backgroundDrawStack();
  //General Looks
  background('rgba(0,0,0,0.2)');
  fill(255);
  noStroke();
  textSize(30);
  text("Choose Your Plants", width / 2, 50);
  textSize(20);
  if ((!currentLevel.type.includes(14)) && (!currentLevel.type.includes(2))) {
    text(`Starting Sun: ${sun}`, width / 2, 80);
  }
  //Display Zombies In level
  for (let displayingZombie of displayZombies) {
    displayingZombie.draw();
  }
  // Draw Seed Packets
  drawSeedPackets();
  //Start Button
  stroke(200);
  strokeWeight(4);
  fill(180, 200, 180);
  rect(30, 640, 100, 40, 3);
  if (!((currentLevel.type.includes(2)) || (currentLevel.type.includes(3)))) {
    rect(115, 20, 100, 40, 3);
  }
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  text('Start', 80, 660);
  // Money
  if (!((currentLevel.type.includes(2)) || (currentLevel.type.includes(3)))) {//Prevent Seed Select (Locked and Loaded AND Conveyor)
    textSize(13)
    if (rentSlot) {
      text('Rented', 165, 40);
    } else {
      text('Rent Slot\n2500 Coins', 165, 40);
    }
    // Slot Used Number
    fill(255);
    textSize(30);
    if (rentSlot) {
      text(selectedPackets.length + '/' + (seedSlots + 1), 55, 40);
    } else {
      text(selectedPackets.length + '/' + seedSlots, 55, 40);
    }
  }
  //Quit Button
  fill(100);
  stroke(80);
  strokeWeight(5);
  rect(800, 30, 60, 40, 5);
  noStroke();
  fill(255, 255, 255);
  textSize(20);
  text("Quit", 830, 50);
  drawCoinBar();
}

// Start game from choose your seeds
function transitionToLevel() {
  transition.trigger = true;
  transition.screen = "level";
  screen = "level";
  if (currentLevel["type"].includes(4) === false) {//Not Last Stand
    advancedLevelSetup();
  }
}

//Function to call when starting level AFTER Crazy Dave
function advancedLevelSetup() {
  //Get Rid of Seed Packets from Choose Your Seeds
  if (!currentLevel.type.includes(14)) {//I Zombie Exception due to no Choose Your Seeds Screen
    allPackets = [];
  }
  //Create Seed Packets
  if ((currentLevel["type"].includes(3)) && (!currentLevel.type.includes(14))) {//Locked and Loaded
    for (let currentPacket of currentLevel.givenPlants) {
      createSeedPacket(currentPacket[0], -1000, -1000, currentPacket[1]);//Create Seed Packets
    }
  }
  //Other Level Types With Choose Your Seeds But No Conveyor (Excluding Locked and Loaded)
  if (!((currentLevel["type"].includes(2)) || (currentLevel.type.includes(14)) || (currentLevel.type.includes(3)))) {
    for (let cPacket of selectedPackets) {
      createSeedPacket(cPacket.type); //Create Seed Packets
    }
  }
  if (!currentLevel["type"].includes(14)) {//Create Shovel if not I Zombie
    new SeedPacket("shovel", "Shovel", 0, 0, 0, 0);
  }
}

// Loop for last stand preparation
function prepareDefense() {
  for (let currentPacket of allPackets) {//Get Seed Packets to Correct Position, Set Recharge to Nothing
    currentPacket.recharge = 0;
    currentPacket.move();
  }
  //Clean up dead (shoveled) plant
  for (let c = 0; c < allPlants.length; c++) {
    if (allPlants[c].health <= 0) {
      for (let currentTile of tiles) {
        if (currentTile.plantID === allPlants[c].id) {
          currentTile.occupied = false;
          currentTile.plantID = null;
          break;
        }
      }
      allEntities.splice(allEntities.indexOf(allPlants[c]), 1);
      allPlants.splice(c, 1);
      c--;
    }
  }
  drawStack();
}

// Create Seed Packets
// Be Careful: Plants index from 1, not 0
function createSeedPacket(plantIndex, startingX = 0, startingY = 0, tier = 0) {
  let currentPlant = plantStat[plantIndex - 1];//Plant Types start at 1, but array starts at 0
  let newSeed;
  let determineTier = tier === 0 ? parseInt(plantTier[plantIndex - 1]) : tier;// Tier is specified (eg. Locked and Loaded)
  if (determineTier === 1) {//Tier 1
    let tier1Stat = currentPlant["t1"];
    newSeed = new SeedPacket(plantIndex, currentPlant["name"], tier1Stat["sun"], 1, tier1Stat["recharge"], tier1Stat["startingRecharge"], false, false, startingX, startingY);//Tier 1
  } else {//Tier 2
    let tier2Stat = currentPlant["t2"];
    newSeed = new SeedPacket(plantIndex, currentPlant["name"], tier2Stat["sun"], 2, tier2Stat["recharge"], tier2Stat["startingRecharge"], false, false, startingX, startingY);//Tier 2 
  }
  // Set Disabled Packets
  if (((currentLevel["type"].includes(2)) || (currentLevel["type"].includes(3))) && (screen !== "level")) {//Conveyor OR Locked and Loaded
    newSeed.disabled = true;
  } else if ((currentLevel["type"].includes(4) === true) && (!currentLevel.type.includes(15))) {//Last Stand but Not Survival Endless
    if ((plantIndex <= 3) || (plantIndex === 17)) {//Ban Sun Producers and Red Stinger
      newSeed.disabled = true;
    }
  }
  return newSeed;
}

