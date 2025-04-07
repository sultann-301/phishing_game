export class GameManager {
  constructor(scene) {
    this.scene = scene;
    this.totalScore = 0;
    this.goalScore = 8200;
    this.reelCount = 5;
    this.isGameOver = false;
    this.setupBoatAndBait();
    this.spawnFish();
    this.perks = [false, false, false];
    this.resets = 3;
    this.trace = this.scene.add.graphics({
      lineStyle: { width: 2, color: 0xffff04 },
    });
  }

  setupBoatAndBait() {
    const { width, height } = this.scene.game.config;
    const adjuster = Math.max(1, (width * 1.1) / height);
    const adjuster2 = Math.min(1, (width / height) * 1.1);
    const boatWidth = width / (5 * adjuster2);

    const startPoint = new Phaser.Math.Vector2(
      width / 2 - boatWidth / 2,
      height / 6 - 15 / adjuster
    );
    const controlPoint1 = new Phaser.Math.Vector2(
      width / 2,
      height / 6 + 40 * adjuster
    );
    const endPoint = new Phaser.Math.Vector2(
      width / 2 + boatWidth / 2,
      height / 6 - 15 / adjuster
    );

    const boatSprite = this.scene.add.graphics({
      fillStyle: { color: 0x355da4 },
      lineStyle: { width: 5, color: 0xffff04 },
    });

    this.curve = new Phaser.Curves.QuadraticBezier(
      startPoint,
      controlPoint1,
      endPoint
    );

    boatSprite.beginPath();
    boatSprite.moveTo(startPoint); // Top left
    boatSprite.lineTo(endPoint); // Top right
    const curvePoints = this.curve.getPoints(30); // Higher = smoother

    // Move to first point
    boatSprite.moveTo(curvePoints[0].x, curvePoints[0].y);

    // Draw the curve manually
    for (let i = 1; i < curvePoints.length; i++) {
      boatSprite.lineTo(curvePoints[i].x, curvePoints[i].y);
    }

    boatSprite.closePath();
    boatSprite.strokePath();
    boatSprite.fillPath();

    boatSprite.generateTexture("boatShape", 60, 40);

    this.boat = this.scene.physics.add.sprite(
      width / 2,
      height / 6,
      "boatShape"
    );

    this.initialBaitY = this.boat.y + 20 * adjuster;
    this.bait = this.scene.physics.add.sprite(
      this.boat.x,
      this.initialBaitY,
      "hook1"
    );
    this.bait.setScale(0.03);
    this.bait.setCollideWorldBounds(true);
    this.boat.setDepth(2);
    this.bait.setDepth(2);

    this.scene.tweens.add({
      targets: [this.bait],
      x: "+=10",
      ease: "Sine.easeOutIn",
      duration: 1000,
      repeat: -1,
      yoyo: true,
    });
  }

  spawnFish() {
    const { width, height } = this.scene.game.config;
    this.fishes = this.scene.physics.add.group();
    const sizeFactors = [0.8, 1, 1.2, 1.4, 1.6];

    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 20; i++) {
        let x = Phaser.Math.Between(20, this.scene.game.config.width - 20);
        let y = Phaser.Math.Between(
          (level * height) / 4 + 15 + 20 * (height / 800),
          ((level + 1) * height) / 4 - 30
        );
        let type = Phaser.Math.Between(1, 4);

        let scaleIndex = Phaser.Math.Between(0, 4);
        let fish = this.scene.physics.add
          .sprite(x, y, `cursorFish ${type}`)
          .setScale(
            type === 1 || type === 4
              ? 0.06 * sizeFactors[scaleIndex]
              : 0.01 * sizeFactors[scaleIndex]
          );
        fish.type = type;
        fish.setBounce(1);
        fish.setDepth(5);
        fish.setCollideWorldBounds(true);
        fish.body.onWorldBounds = true;
        fish.body.setBoundsRectangle(
          new Phaser.Geom.Rectangle(100, 100, 600, 1400)
        );
        fish.depthLevel = level;
        fish.score = sizeFactors[scaleIndex] * 100 * level;
        fish.moveChance = Phaser.Math.FloatBetween(0, 1);
        fish.setVelocity(Phaser.Math.Between(-50, 50), 0);
        this.fishes.add(fish);
      }
    }
  }

  resetBait(resetButton) {
    if (this.bait.y !== this.initialBaitY) {
      this.bait.body.enable = false;
      this.scene.tweens.add({
        targets: this.bait,
        y: this.initialBaitY,
        ease: "Linear",
        duration: 750,
        onStart: () => {
          resetButton.list[0].disableInteractive();
          resetButton.list[1].disableInteractive();
        },
        onComplete: () => {
          this.bait.body.enable = true;
          resetButton.list[0].setInteractive();
          resetButton.list[1].setInteractive();
        },
      });
      this.updateIdleFish();
      this.fishes.children.iterate(
        (f) =>
          (f.moveChance =
            f.score === 1024 * 4 ? 1 : Phaser.Math.FloatBetween(0, 1))
      );
      this.reelCount -= 1;
    }
  }

  updateIdleFish() {
    this.fishes.children.iterate((fish) => {
      fish.setVelocity(Phaser.Math.Between(-50, 50), 0);
    });
  }

  repopulate() {
    const { width, height } = this.scene.game.config;
    const sizeFactors = [0.8, 1, 1.2, 1.4, 1.6];

    for (let level = 1; level <= 3; level++) {
      let lvlCount = this.fishes
        .getChildren()
        .filter((fish) => fish.depthLevel == level && fish.active).length;
      console.log(lvlCount);

      if (lvlCount <= 15) {
        for (let i = 0; i < 3; i++) {
          let x = Phaser.Math.Between(20, this.scene.game.config.width - 20);
          let y = Phaser.Math.Between(
            (level * height) / 4 + 15 + 20 * (height / 800),
            ((level + 1) * height) / 4 - 30
          );
          let type = Phaser.Math.Between(1, 4);

          let scaleIndex = Phaser.Math.Between(0, 4);
          let fish = this.scene.physics.add
            .sprite(x, y, `cursorFish ${type}`)
            .setScale(
              type === 1 || type === 4
                ? 0.06 * sizeFactors[scaleIndex]
                : 0.01 * sizeFactors[scaleIndex]
            );
          fish.type = type;
          fish.setBounce(1);
          fish.setDepth(5);
          fish.setCollideWorldBounds(true);
          fish.body.onWorldBounds = true;
          fish.body.setBoundsRectangle(
            new Phaser.Geom.Rectangle(100, 100, 600, 1400)
          );
          fish.depthLevel = level;
          fish.score = sizeFactors[scaleIndex] * 100 * level;
          fish.moveChance = Phaser.Math.FloatBetween(0, 1);
          fish.setVelocity(Phaser.Math.Between(-50, 50), 0);
          const emitter = this.scene.add.particles(
            fish.x,
            fish.y,
            "water_particle",
            {
              scale: 0.08,
              angle: { min: 0, max: 360 },
              speed: 50,
              lifespan: 300,
              tint: 0xffff04,
              quantity: 20,
            }
          );
          this.scene.time.delayedCall(400, () => {
            emitter.stop();
          });
          this.fishes.add(fish);
        }
      }
    }
  }

  update() {
    const { width, height } = this.scene.game.config;
    const adjuster = width > height ? 1 : -0.8;
    if (this.bait.y < this.initialBaitY) {
      this.bait.setVelocityY(0);
      this.bait.y = this.initialBaitY;
    }
    this.trace.clear();
    this.applyProbBoost();

    // Draw line from last position to current position
    this.trace
      .lineBetween(
        this.boat.x,
        this.boat.y + 10 * adjuster,
        this.bait.x,
        this.bait.y - this.bait.displayHeight / 4
      )
      .setDepth(2);

    if (this.bait.body.velocity.y !== 0 || !this.bait.body.enable) return;

    let baitLevel = this.getDepthLevel(this.bait.y);
    if (this.perks[2]) {
      this.applySpearPhish(baitLevel);
    } else {
      this.fishes.children.iterate((fish) => {
        if (!fish.active || fish.depthLevel !== baitLevel) return;

        let threshold = 0.3 + (fish.depthLevel - 1) * 0.3;
        if (fish.moveChance > threshold && this.bait.body.velocity.y === 0) {
          let angle = Phaser.Math.Angle.Between(
            fish.x,
            fish.y,
            this.bait.x,
            this.bait.y
          );
          let wiggle = Math.sin(this.scene.time.now * 0.006 * 10) * 90;
          fish.setVelocity(50 * Math.cos(angle) + wiggle, 50 * Math.sin(angle));
          const emitter = this.scene.add.particles(
            fish.x,
            fish.y,
            "water_particle",
            {
              scale:
                fish.score == 1024 * 4
                  ? { start: 1.1, end: 0 }
                  : { start: 0.75, end: 0 },
              angle: { min: 0, max: 180 },
              speed: 100,
              lifespan: fish.score == 1024 * 4 ? 400 : 80,
              tint: fish.score == 1024 * 4 ? 0xffd700 : 0xffffff, // 💛 Gold if 1024, white otherwise
              quantity: fish.score == 1024 * 4 ? 5 : 2,
            }
          );

          this.scene.time.delayedCall(600, () => {
            emitter.stop();
          });

          if (
            Phaser.Math.Distance.Between(
              fish.x,
              fish.y,
              this.bait.x,
              this.bait.y
            ) < 20
          ) {
            this.totalScore += fish.score;
            this.scene.uiManager.updateScore(this.totalScore, fish.score);
            fish.disableBody(true, true);
            this.applySpawnPhishes(fish);
            const emitter = this.scene.add.particles(fish.x, fish.y, "spark", {
              scale: fish.score == 1024 * 4 ? 0.04 : 0.03,
              angle: { min: 0, max: 360 },
              speed: fish.score == 1024 * 4 ? 400 : 200,
              lifespan: fish.score == 1024 * 4 ? 800 : 100,
              tint: fish.score == 1024 * 4 ? 0xffd700 : 0xffff04, // 💛 Gold if 1024, white otherwise
              quantity: fish.score == 1024 * 4 ? 100 : 10,
            });
            this.scene.time.delayedCall(400, () => {
              emitter.stop();
            });
          }
        }
      });
    }
  }

  applyProbBoost() {
    if (this.perks[0]) {
      this.fishes.children.iterate((fish) => (fish.moveChance += 0.2));
      this.perks[0] = !this.perks[0];
    }
  }

  applySpawnPhishes(fish) {
    if (this.perks[1]) {
      const { x, y } = fish;

      const { width, height } = this.scene.game.config;
      for (let i = 0; i < 8; i++) {
        let minY = (fish.depthLevel * height) / 4 + 10;
        let maxY = ((fish.depthLevel + 1) * height) / 4 + 10;
        let spawnRangeX = Phaser.Math.Between(x - 70, x + 70);
        let spawnRangeY = Phaser.Math.Between(
          Math.max(minY, y - 50),
          Math.min(maxY, y + 50)
        );
        let NewFish = this.scene.physics.add.sprite(
          spawnRangeX,
          spawnRangeY,
          `cursorFish ${fish.type}`
        );
        NewFish.scaleX = fish.scaleX;
        NewFish.scaleY = fish.scaleY;
        NewFish.setBounce(1);
        NewFish.setCollideWorldBounds(true);
        NewFish.depthLevel = fish.depthLevel;
        NewFish.score = fish.score;
        NewFish.moveChance = 1;
        NewFish.setVelocity(Phaser.Math.Between(-50, 50), 0);
        NewFish.setTint("0xaaffaa");
        this.fishes.add(NewFish);
      }
      this.perks[1] = !this.perks[1];
    }
  }

  applySpearPhish() {
    const { width, height } = this.scene.game.config;

    if (this.perks[2]) {
      let x = Phaser.Math.Between(200, this.scene.game.config.width - 200);
      let y = Phaser.Math.Between(
        (3 * height) / 4 + 15 + 20 * (height / 800),
        ((3 + 1) * height) / 4 - 30
      );
      let type = Phaser.Math.Between(1, 4);
      let fish = this.scene.physics.add
        .sprite(x, y, `cursorFish ${type}`)
        .setScale(type === 1 || type === 4 ? 0.06 * 2.5 : 0.01 * 2.5);
      fish.type = type;
      fish.setBounce(1);
      fish.setCollideWorldBounds(true);
      fish.depthLevel = 3;
      fish.score = 1024 * 4;
      fish.moveChance = 1;
      fish.setVelocity(Phaser.Math.Between(-50, 50), 0);
      fish.setTint("0xd4af37");
      fish.setDepth(5);
      this.fishes.add(fish);
      this.perks[2] = !this.perks[2];
    }
  }

  getDepthLevel(y) {
    return Math.floor(y / (window.innerHeight / 4));
  }
}
