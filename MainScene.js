// js/MainScene.js
import { GameManager } from './gameManager.js';
import { UIManager } from './UIManager.js';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // Load assets
    this.load.image('boat', 'https://via.placeholder.com/80x30?text=Boat');
    this.load.image('baitLink', 'https://via.placeholder.com/40x15?text=Link');
    for (let i = 1; i <= 4; i++) {
      this.load.image(`cursorFish ${i}`, `./cursor${i}.png`);
    }
    this.load.image('spark', './sparks.png')
  }

  create() {
    // Instantiate managers
    this.gameManager = new GameManager(this);
    this.uiManager = new UIManager(this, this.gameManager);

    

    // Draw depth lines
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xffffff);
    this.depthLines = [window.innerHeight/4, window.innerHeight/2, (window.innerHeight*3)/4];
    this.depthLines.forEach(y => {
      graphics.moveTo(0, y);
      graphics.lineTo(this.game.config.width, y);
      graphics.strokePath();
    });

    // Setup recurring updates
    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => this.gameManager.updateIdleFish(),
    });
  }

  update() {
    this.gameManager.update();
  }
}
