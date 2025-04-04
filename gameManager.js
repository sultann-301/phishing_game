// js/game/GameManager.js
export class GameManager {
    constructor(scene) {
      this.scene = scene;
      this.totalScore = 0;
      this.goalScore = 7500;
      this.reelCount = 3;
      this.isGameOver = false;
      this.setupBoatAndBait();
      this.spawnFish();
      this.perks = [false,false,true];
      this.resets = 3;
    }


    setupBoatAndBait() {
      const { width, height } = this.scene.game.config;
      this.boat = this.scene.physics.add.sprite(width / 2, height / 6, 'boat').setImmovable(true);
      this.initialBaitY = this.boat.y + 30;
      this.bait = this.scene.physics.add.sprite(this.boat.x, this.initialBaitY, 'baitLink');
      this.bait.setCollideWorldBounds(true);
    }
  
    spawnFish() {
      const { width, height } = this.scene.game.config;
      this.fishes = this.scene.physics.add.group();
      const sizeFactors = [0.8, 1, 1.2, 1.4, 1.6];
  
      for (let level = 1; level <= 3; level++) {
        for (let i = 0; i < 20; i++) {
          let x = Phaser.Math.Between(20, this.scene.game.config.width - 20);
          let y = Phaser.Math.Between(level * height / 4 + 20, (level + 1) * height / 4 - 20);
          let type = Phaser.Math.Between(1, 4);
          
          let scaleIndex = Phaser.Math.Between(0, 4);
          let fish = this.scene.physics.add.sprite(x, y, `cursorFish ${type}`)
            .setScale((type === 1 || type === 4) ? 0.06 * sizeFactors[scaleIndex] : 0.01 * sizeFactors[scaleIndex]);
          fish.type = type;
          fish.setBounce(1);
          fish.setCollideWorldBounds(true);
          fish.body.onWorldBounds = true;
          fish.body.setBoundsRectangle(new Phaser.Geom.Rectangle(100, 100, 600, 1400));
          fish.depthLevel = level;
          fish.score = sizeFactors[scaleIndex] * 100 * level;
          fish.moveChance = Phaser.Math.FloatBetween(0, 1);
          fish.setVelocity(Phaser.Math.Between(-50, 50), 0);
          this.fishes.add(fish);
        }
      }
    }
  
    resetBait() {
      if (this.bait.y !== this.initialBaitY){
        this.bait.body.enable = false;
        this.scene.tweens.add({
          targets: this.bait,
          y: this.initialBaitY,
          ease: 'Linear',
          duration: 1000,
          onComplete: () => (this.bait.body.enable = true)
        });
        this.updateIdleFish();
        this.fishes.children.iterate(f => f.moveChance = (f.score === 1024 ? 1 : Phaser.Math.FloatBetween(0, 1)));
        this.reelCount -= 1
      }
    }
  
    updateIdleFish() {
      this.fishes.children.iterate(fish => {
        fish.setVelocity(Phaser.Math.Between(-50, 50), 0);
      });
    }
  
    update() {
      if (this.bait.y < this.initialBaitY) {
        this.bait.setVelocityY(0);
        this.bait.y = this.initialBaitY;
      }
  
      if (this.bait.body.velocity.y !== 0 || !this.bait.body.enable) return;
  
      let baitLevel = this.getDepthLevel(this.bait.y);
      if(this.perks[2])
      {
        this.applySpearPhish(baitLevel);
      } else
      {
        this.fishes.children.iterate(fish => {
          if (!fish.active || fish.depthLevel !== baitLevel) return;
          
          let threshold = 0.3 + (fish.depthLevel - 1) * 0.3;
          if (fish.moveChance > threshold && this.bait.body.velocity.y === 0) {
            let angle = Phaser.Math.Angle.Between(fish.x, fish.y, this.bait.x, this.bait.y);
            let wiggle = Math.sin(this.scene.time.now * 0.006 * 10) * 90;
            fish.setVelocity(50 * Math.cos(angle) + wiggle, 50 * Math.sin(angle));
            fish.isAttracted = true;
    
            if (Phaser.Math.Distance.Between(fish.x, fish.y, this.bait.x, this.bait.y) < 20) {
              this.totalScore += fish.score;
              this.scene.uiManager.updateScore(this.totalScore, fish.score);
              fish.disableBody(true, true);
              this.applySpawnPhishes(fish);
              const emitter = this.scene.add.particles(fish.x, fish.y, 'spark', {
                scale: fish.score == 1024 ? 0.04 : 0.03,
                angle: { min: 0, max: 360 },
                speed: fish.score == 1024 ? 400 : 200,
                lifespan:fish.score == 1024 ? 800 : 100,
                tint: fish.score == 1024 ? 0xFFD700 : 0xffffff , // 💛 Gold if 1024, white otherwise
                quantity: fish.score == 1024 ? 100 : 10
              });
  
              this.scene.time.delayedCall(400, () => {
                emitter.stop();
            });
            }
          }
        });
        if(((this.reelCount == 0 && this.totalScore < this.goalScore) || (this.totalScore >= this.goalScore))){

        }
      }
      
      
    }


    applyProbBoost()
    {
      if(this.perks[0])
      {
        this.fishes.iterate(fish => fish.moveChance += 0.15);
        this.perks[0] = !this.perks[0];
      }
    }

    applySpawnPhishes(fish)
    {
      if(this.perks[1]){
        const {x,y} = fish;

      const { width, height } = this.scene.game.config;
      for( let i = 0; i < 8; i++)
      {
        let minY = fish.depthLevel * height / 4 + 10
        let maxY = (fish.depthLevel+1)  * height / 4 + 10
        let spawnRangeX = Phaser.Math.Between(x-70, x+70);
        let spawnRangeY = Phaser.Math.Between(Math.max(minY, y-50), Math.min(maxY, y+50));
        let NewFish = this.scene.physics.add.sprite(spawnRangeX, spawnRangeY, `cursorFish ${fish.type}`)
        NewFish.scaleX = fish.scaleX;
        NewFish.scaleY = fish.scaleY;
        NewFish.setBounce(1);
        NewFish.setCollideWorldBounds(true);
        NewFish.depthLevel = fish.depthLevel;
        NewFish.score = fish.score;
        NewFish.moveChance = 1;
        NewFish.setVelocity(Phaser.Math.Between(-50, 50), 0);
        NewFish.setTint('0xaaffaa');
        this.fishes.add(NewFish);


      }
      this.perks[1] = !this.perks[1];


      }
      
    }

    applySpearPhish()
    {
      const { width, height } = this.scene.game.config;

      if(this.perks[2]){
        let x = Phaser.Math.Between(20, this.scene.game.config.width - 20);
        let y = Phaser.Math.Between(3 * height / 4 + 10, (3 + 1) * height / 4 - 10);
        let type = Phaser.Math.Between(1, 4);
    
        
        let fish = this.scene.physics.add.sprite(x, y, `cursorFish ${type}`)
          .setScale((type === 1 || type === 4) ? 0.06 * 2 : 0.01 * 2);
        fish.type = type;
        fish.setBounce(1);
        fish.setCollideWorldBounds(true);
        fish.depthLevel = 3;
        fish.score = 1024;
        fish.moveChance = 1;
        fish.setVelocity(Phaser.Math.Between(-50, 50), 0);
        fish.setTint("0xd4af37");
        this.fishes.add(fish);

        this.perks[2] = !this.perks[2];
      } 
  

    }
  
    getDepthLevel(y) {
      return Math.floor(y / (window.innerHeight / 4));
    }
  }
  