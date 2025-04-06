// js/MainScene.js
import { GameManager } from './gameManager.js';
import { UIManager } from './UIManager.js';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // Load assets
    this.load.image('hook1', './hook1f.png');
    this.load.image('hook2', './hook2f.png');
    this.load.image('hook3', './hook3f.png');
    this.load.image('hook4', './hook4f.png');
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
    // const graphics = this.add.graphics();
    // graphics.lineStyle(3, 0xffff04);
    // this.depthLines = [window.innerHeight/4, window.innerHeight/2, (window.innerHeight*3)/4];
    // this.depthLines.forEach(y => {
    //   graphics.moveTo(0, y);
    //   graphics.lineTo(this.game.config.width, y);
    //   graphics.strokePath();
    // });

    const graphics = this.add.graphics();
    

    // Define the colors for each section
    const opacities = [0,0.35,0.5,0.65];

    // Define the vertical positions for the lines
    this.depthLines = [
      window.innerHeight / 4,   // First line at 1/4 height
      window.innerHeight / 2,   // Second line at 1/2 height
      (window.innerHeight * 3) / 4 // Third line at 3/4 height
    ];

    // Loop through each section and draw colored rectangles
    this.depthLines.forEach((y, index) => {
      // Set the color for each section
      graphics.fillStyle(0x000000, opacities[index]); // Set opacity based on the section index
     
      
      // If it's the first section, draw it from the top of the screen to the first line
      if (index === 0) {
        graphics.fillRect(0, 0, this.game.config.width, y); // First section (top to first line)
      }
      // If it's the second section, draw it between the first and second line
      else if (index === 1) {
        graphics.fillRect(0, this.depthLines[0], this.game.config.width, y - this.depthLines[0]); // Second section
      }
      // If it's the third section, draw it between the second and third line
      else if (index === 2) {
        graphics.fillRect(0, this.depthLines[1], this.game.config.width, y - this.depthLines[1]); // Third section
      }
      graphics.lineStyle(2, 0xffff04);
      graphics.moveTo(0, y);
      graphics.lineTo(this.game.config.width, y);
      graphics.strokePath();
    });

    // Draw the bottom section (between the third line and the bottom of the screen)
    graphics.fillStyle(0x000000, opacities[3]); // Set color for the last section (yellow)
    graphics.fillRect(0, this.depthLines[2], this.game.config.width, window.innerHeight - this.depthLines[2]); // Bottom section
    

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
