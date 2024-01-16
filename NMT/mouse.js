// Mouse Event Handlers

//Mouse down
document.addEventListener("mousedown", function (e) {
  switch (screen) {
    case "chooseSeeds"://Choose Your Seeds & Zombie Display Screen
      for (let currentPacket of allPackets) {
        if (pointBox(mouseX, mouseY, currentPacket.x, currentPacket.y, 120, 60)) {
          // Removing Packets
          let gotRemoved = false;
          for (let cSelectPacket of allPackets) {
            if ((cSelectPacket.type === currentPacket.type) && (cSelectPacket !== currentPacket) && (currentPacket.disabled === false)) {
              allPackets.splice(allPackets.indexOf(currentPacket), 1);
              selectedPackets.splice(selectedPackets.indexOf(currentPacket), 1);
              cSelectPacket.disabled = false;
              gotRemoved = true;
              break;
            }
          }
          if (gotRemoved) { break; }

          // Selecting Packets
          if (currentPacket.disabled === false) {//Not Disabled
            if ((selectedPackets.length < seedSlots || selectedPackets.length <= seedSlots && rentSlot) && (unlockedPackets.includes(currentPacket.type)) && (!gotRemoved)) {//Add Packet
              currentPacket.disabled = true;
              selectedPackets.push(new SeedPacket(currentPacket.type, currentPacket.name, currentPacket.sun, currentPacket.tier,
                0, 0, currentPacket.moving, currentPacket.spawnZombie, 0, 0, false));
              break;
            }
          }
        }
      }
      for (let currentPacket in selectedPackets) {//Update Status of Selected Packets
        selectedPackets[currentPacket].x = 30;
        selectedPackets[currentPacket].y = 70 + 70 * currentPacket;
      }
      break;
    case "level": case "prepareDefense"://Level (Gameplay) Screen
      //Planting initial process
      for (let currentPacket of allPackets) {
        if (pointBox(mouseX, mouseY, currentPacket.x, currentPacket.y, 120, 60) && (currentPacket.recharge === 0) && (sun >= currentPacket.sun)) {//If packet clicked on
          if (readyPlant !== null) {//Clear already selected plant
            readyPlant.selected = false;
          }
          readyPlant = currentPacket;
          currentPacket.selected = true;
          break;
        }
      }
      break;
    default:
      break;
  }
});

//Mouse released
document.addEventListener("mouseup", function (e) {
  //Title Screen
  switch (screen) {
    case "initial"://Title Screen
      if (pointBox(mouseX, mouseY, width * 0.3 - 50, 400 - 50, 100, 100)) {
        transition.trigger = true;
        transition.screen = "regularLevelSelect";
      } else if (pointBox(mouseX, mouseY, width * 0.5 - 50, 400 - 50, 100, 100)) {
        transition.trigger = true;
        transition.screen = "minigameSelect";
      } else if (pointBox(mouseX, mouseY, width * 0.7 - 50, 400 - 50, 100, 100)) {
        saveData();
        alert("Data Saved");
      }
      break;
    case "daveSpeech"://Crazy Dave Screen
      if (clickCooldown <= 0) {
        //Dialogue Box
        if (pointBox(mouseX, mouseY, 450, 350, 300, 180)) {
          daveIndex++;
        }
        //Quit Button Hitbox
        if (pointBox(mouseX, mouseY, 800, 30, 60, 40)) {
          transition.trigger = true;
          transition.screen = "initial";
        }
        clickCooldown = 10;
      }
      break;
    case "chooseSeeds"://Choose Your Seeds & Zombie Display Screen
      //Start Game Button
      if (pointBox(mouseX, mouseY, 30, 640, 100, 40)) {
        if (currentLevel["type"].includes(4)) {//Last Stand Preparation Phase
          advancedLevelSetup();
          transition.trigger = true;
          transition.screen = "prepareDefense";
        } else {
          transitionToLevel();
        }
      }
      //Quit Button
      if (pointBox(mouseX, mouseY, 800, 30, 60, 40)) {
        transition.trigger = true;
        transition.screen = "regularLevelSelect";
      }
      //Rent Slot Button
      if (pointBox(mouseX, mouseY, 115, 20, 100, 40) && (!rentSlot) && (money >= 2500)) {
        money -= 2500;
        rentSlot = true;
      }
      break;
    case "prepareDefense"://Last Stand Preparation Screen
      if (pointBox(mouseX, mouseY, 190, 30, 80, 40)) {//Start Button
        for (let currentPacket of allPackets) {//Reset Recharge
          currentPacket.recharge = currentPacket.startingRecharge;
        }
        transitionToLevel();
      };
    case "level"://Level (Gameplay) Screen
      // Planting
      if ((readyPlant !== null)) {
        if (currentLevel["type"].includes(14)) {//I Zombie
          let tileFound = null;
          //Find tile to place zombie on
          for (let currentTile of tiles) {
            if ((pointBox(mouseX, mouseY, currentTile.x + 1, currentTile.y + 1, 78, 98)) && (currentTile.x >= currentLevel["plantLine"])) {
              tileFound = currentTile;
              break;
            }
          }
          if (tileFound) {//Spawn Zombie
            sun -= readyPlant.sun;
            let zombieData = zombieStat[readyPlant.type];
            new Zombie(tileFound.x + 25, tileFound.y, Math.floor((tileFound.y - 120) / 100) + 1, readyPlant.type, zombieData.health, zombieData.shield,
            zombieData.degrade, zombieData.speed, zombieData.eatSpeed, zombieData.altSpeed, zombieData.altEatSpeed, zombieData.jam, -1);
            readyPlant.selected = false;
            readyPlant = null;
          }
        }else{//Planting Process and Shoveling (Regular)
          if (readyPlant.type === "shovel") {//Shoveling
            for (let currentTile of tiles) {// 5 -> 75, 10 -> 90
              if (pointBox(mouseX, mouseY, currentTile.x+5, currentTile.y+10, 70, 80) && (currentTile.occupied)) {
                //Make sure to not plant on boss or unsodded lane
                currentTile.occupied = false;
                for (let currentPlant of allPlants) {//Find Correct Plant and Not Endangered
                  if ((currentPlant.id === currentTile.plantID) && (!currentPlant.endangered)) {
                    currentPlant.health = 0;
                    if ((currentLevel["type"].includes(4) === true) && (screen === "prepareDefense")) {//Last Stand Preparation       
                      sun += currentPlant.sunCost;
                    } else {
                      sun += currentPlant.refund;
                    }
                    break;
                  }
                }
              }
            }
            readyPlant.selected = false;
            readyPlant = null;
          } else {//Planting
            let unsoddedLanes = currentLevel.type.includes(13) ? currentLevel.unsoddedLanes : [];// Get unsodded lanes (or blank)
            let overPlantLimit = currentLevel.type.includes(9) ? (allPlants.length >= currentLevel.maxPlantLimit) : false;// Get over plant limit (or false)
            for (let currentTile of tiles) {
              if (pointBox(mouseX, mouseY, currentTile.x, currentTile.y, 80, 100) && (currentTile.occupied === false) &&
                !((currentLevel["type"].includes(10)) && (currentTile.x >= 660)) && !(overPlantLimit) && !(unsoddedLanes.includes(currentTile.y))) {
                //Make sure to not plant on boss or unsodded lane or plant limit
                currentTile.occupied = true;
                sun -= readyPlant.sun;
                let newPlant = createPlant(readyPlant.type, readyPlant.tier, currentTile.x + 10, currentTile.y + 10);
                currentTile.plantID = newPlant.id;
                readyPlant.recharge = readyPlant.maxRecharge;//Assign plant to tile
                if (readyPlant.moving === true) {//Conveyor Packets
                  allPackets.splice(allPackets.indexOf(readyPlant), 1);
                  allEntities.splice(allEntities.indexOf(readyPlant), 1);
                }
                readyPlant.selected = false;
                readyPlant = null;
                break;
              }
            }
          }
        }
      }
      //Shoot Coconut Cannon
      for (let currentPlant of allPlants) {
        if ((pointBox(mouseX, mouseY, currentPlant.x, currentPlant.y, 60, 80)) && (currentPlant.type === 25) && (currentPlant.reload <= 0)) {
          new Projectile(currentPlant.x + 40, currentPlant.y + 15, currentPlant.lane, currentPlant.projectileType,
            currentPlant.damage, 3, currentPlant.tier, currentPlant.splashDamage);
          currentPlant.reload = currentPlant.maxReload;
          break;
        }
      }
      //Win Button
      if (win === true) {
        if (pointBox(mouseX, mouseY, 350, 20, 200, 120)) {//Reward button hitbox
          for (let currentReward of currentLevel.reward) {
            switch (currentReward[0]) {
              case 0://New Plant
                if (!unlockedPackets.includes(currentReward[1])) {
                  unlockedPackets.push(currentReward[1]);
                }
                break;
              case 1://Money
                money += currentReward[1];
                break;
              case 2://New Level
                if (!unlockedLevels.includes(currentReward[1])) {
                  unlockedLevels.push(currentReward[1]);
                }
                break;
              default:
                money += 500;
                break;
            }
          }
          for (let laneMower of lawnMowers) {//Lawnmower Money
            if (!laneMower.active) {
              money += 200;
            }
          }
          transition.trigger = true;
          transition.screen = "initial";
          screen = "initial";
        }
      }
      if (pointBox(mouseX, mouseY, 700, 50, 60, 40)) {//Fast foward button hitbox
        levelSpeed = (levelSpeed === 1) ? levelSpeed = 1.35 : (levelSpeed === 1.35) ? levelSpeed = 1.7 : levelSpeed = 1; // Change level speed
      }
      if (pointBox(mouseX, mouseY, 800, 30, 60, 40)) {//Quit Button Hitbox
        transition.trigger = true;
        transition.screen = "initial";
      }
      break;
    case "gameOver"://Game Over Screen
      if (pointBox(mouseX, mouseY, width / 2 - 60, height - 150, 120, 60)) {//Exit button hitbox
        transition.trigger = true;
        transition.screen = "regularLevelSelect";
      }
      break;
    case "regularLevelSelect"://Adventure Level Select
      if (pointBox(mouseX, mouseY, 100, height - 75, 50, 50)) {
        transition.trigger = true;
        transition.screen = "almanac";
      }
      if (pointBox(mouseX, mouseY, 175, height - 75, 50, 50)) {
        transition.trigger = true;
        transition.screen = "shop";
      }
      if (pointBox(mouseX, mouseY, 25, height - 75, 50, 50)) {
        transition.trigger = true;
        transition.screen = "initial";
      }
      break;
    case "minigameSelect"://Minigame Level Select
      if (pointBox(mouseX, mouseY, 100, height - 75, 50, 50)) {
        transition.trigger = true;
        transition.screen = "almanac";
      }
      if (pointBox(mouseX, mouseY, 175, height - 75, 50, 50)) {
        transition.trigger = true;
        transition.screen = "shop";
      }
      if (pointBox(mouseX, mouseY, 25, height - 75, 50, 50)) {
        transition.trigger = true;
        transition.screen = "initial";
      }
      break;
    case "almanac"://General Almanac Screen
      if (pointBox(mouseX, mouseY, width / 2 - 125, height / 2 - 50, 100, 100)) {
        transition.trigger = true; transition.screen = 'almanacPlant';
      } else if (pointBox(mouseX, mouseY, width / 2 + 25, height / 2 - 50, 100, 100)) {
        transition.trigger = true; transition.screen = 'almanacZombie';
      }
      if (pointBox(mouseX, mouseY, 25, height - 75, 50, 50)) {
        transition.trigger = true; transition.screen = 'initial';
      }
      break;
    case "almanacPlant"://Plant Almanac
      if (pointBox(mouseX, mouseY, width / 2 - 25, 420 - 25, 50, 50)) {//Tiering System
        if (money >= 1000) {
          if (parseInt(plantTier[displayPlant.type - 1]) === 1) {
            plantTier[displayPlant.type - 1] = 2;
          } else {
            plantTier[displayPlant.type - 1] = 1;
          }
          money -= 1000;
        }
      }
      if (pointBox(mouseX, mouseY, 100 - 25, 360 - 25, 50, 50) && (displayPlant.type > 1)) {
        displayPlant.type--;
      }
      if (pointBox(mouseX, mouseY, width - 100 - 25, 360 - 25, 50, 50) && (displayPlant.type < 29)) {
        displayPlant.type++;
      }
      if (pointBox(mouseX, mouseY, 25, height - 75, 50, 50)) {
        transition.trigger = true;
        transition.screen = 'almanac';
      }
      break;
    case "almanacZombie"://Zombie Almanac
      if (pointBox(mouseX, mouseY, 100 - 25, 360 - 25, 50, 50) && (displayZombie.type > 0)) {
        displayZombie.type--;
        if (displayZombie.type === 24) {
          displayZombie.type = 23;
        }
      }
      if (pointBox(mouseX, mouseY, width - 100 - 25, 360 - 25, 50, 50) && (displayZombie.type < zombieStat.length - 1)) {
        displayZombie.type++;
        if (displayZombie.type === 24) {
          displayZombie.type = 25;
        }
      }
      if (pointBox(mouseX, mouseY, 25, height - 75, 100, 50)) {
        transition.trigger = true;
        transition.screen = 'almanac';
      }
      break;
    case "shop"://Shop
      if (pointBox(mouseX, mouseY, 25, height - 75, 50, 50)) {
        transition.trigger = true;
        transition.screen = 'initial';
      }
      for (let a = 0; a < displayPlants.length; a++) {
        if (pointBox(mouseX, mouseY, displayPlants[a].x - 20, displayPlants[a].y - 20, 100, 100) && money >= 10000 && !unlockedPackets.includes(displayPlants[a].type)) {
          money -= 10000;
          unlockedPackets.push(displayPlants[a].type);
        }
      }
      break;
    default:
      console.log("Screen Does Not Exist");
      break;
  }
});

