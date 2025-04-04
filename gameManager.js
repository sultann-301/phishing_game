// js/game/GameManager.js
export class GameManager {
    constructor(scene) {
      this.scene = scene;
      this.totalScore = 0;
  
      this.setupBoatAndBait();
      this.spawnFish();
    }
  
    setupBoatAndBait() {
      const { width, height } = this.scene.game.config;
      this.boat = this.scene.physics.add.sprite(width / 2, height / 6, 'boat').setImmovable(true);
      this.initialBaitY = this.boat.y + 30;
      this.bait = this.scene.physics.add.sprite(this.boat.x, this.initialBaitY, 'baitLink');
      this.bait.setCollideWorldBounds(true);
    }
  
    spawnFish() {
      const height = window.innerHeight;
      this.fishes = this.scene.physics.add.group();
      const sizeFactors = [0.8, 1, 1.2, 1.4, 1.6];
  
      for (let level = 1; level <= 3; level++) {
        for (let i = 0; i < 20; i++) {
          let x = Phaser.Math.Between(20, this.scene.game.config.width - 20);
          let y = Phaser.Math.Between(level * height / 4 + 10, (level + 1) * height / 4 - 10);
          let type = Phaser.Math.Between(1, 4);
          let scaleIndex = Phaser.Math.Between(0, 4);
          let fish = this.scene.physics.add.sprite(x, y, `cursorFish ${type}`)
            .setScale((type === 1 || type === 4) ? 0.06 * sizeFactors[scaleIndex] : 0.01 * sizeFactors[scaleIndex]);
  
          fish.setBounce(1);
          fish.setCollideWorldBounds(true);
          fish.depthLevel = level;
          fish.score = sizeFactors[scaleIndex] * 100 * level;
          fish.moveChance = Phaser.Math.FloatBetween(0, 1);
          fish.setVelocity(Phaser.Math.Between(-50, 50), 0);
          fish.isAttracted = false;
          this.fishes.add(fish);
        }
      }
    }
  
    resetBait() {
      this.bait.body.enable = false;
      this.scene.tweens.add({
        targets: this.bait,
        y: this.initialBaitY,
        ease: 'Linear',
        duration: 1000,
        onComplete: () => (this.bait.body.enable = true)
      });
  
      this.fishes.children.iterate(f => f.moveChance = Phaser.Math.FloatBetween(0, 1));
    }
  
    updateIdleFish() {
      const baitLevel = this.getDepthLevel(this.bait.y);
      this.fishes.children.iterate(fish => {
        if (this.bait.body.velocity.y !== 0 || fish.depthLevel !== baitLevel) {
          fish.setVelocity(Phaser.Math.Between(-50, 50), 0);
        }
      });
    }
  
    update() {
      if (this.bait.y < this.initialBaitY) {
        this.bait.setVelocityY(0);
        this.bait.y = this.initialBaitY;
      }
  
      if (this.bait.body.velocity.y !== 0 || !this.bait.body.enable) return;
  
      let baitLevel = this.getDepthLevel(this.bait.y);
      this.fishes.children.iterate(fish => {
        if (!fish.active || fish.depthLevel !== baitLevel) return;
  
        let threshold = 0.3 + (fish.depthLevel - 1) * 0.3;
        if (fish.moveChance > threshold) {
          let angle = Phaser.Math.Angle.Between(fish.x, fish.y, this.bait.x, this.bait.y);
          let wiggle = Math.sin(this.scene.time.now * 0.006 * 10) * 90;
          fish.setVelocity(50 * Math.cos(angle) + wiggle, 50 * Math.sin(angle));
          fish.isAttracted = true;
  
          if (Phaser.Math.Distance.Between(fish.x, fish.y, this.bait.x, this.bait.y) < 20) {
            this.totalScore += fish.score;
            this.scene.uiManager.updateScore(this.totalScore);
            fish.disableBody(true, true);
          }
        }
      });
    }
  
    getDepthLevel(y) {
      return Math.floor(y / (window.innerHeight / 4));
    }
  }
  