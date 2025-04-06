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


    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
    graphics.fillStyle(0xaefcff, 1);
    graphics.fillCircle(32, 32, 32);
  
    graphics.generateTexture('bubble', 64, 64);


    this.textures.generate('bubble2', {
      data: [
        '...........',
        '....555....',
        '...5...5...',
        '..5.444.5..',
        '.5.4...4.5.',
        '.5.4...4.5.',
        '.5.4...4.5.',
        '..5.444.5..',
        '...5...5...',
        '....555....',
        '...........',
    ],
    pixelWidth: 3, // smaller pixels for more detail
    palette: {
        '4': '#ffffff',   // highlight
        '5': '#aefcee',   // bubble base
        '.': 0x00000000   // transparent
    }
  });

  this.textures.generate('water_particle', {
    data: [
      '...........',
      '....555....',
      '...5...5...',
      '..5.444.5..',
      '.5.4...4.5.',
      '.5.4...4.5.',
      '.5.4...4.5.',
      '..5.444.5..',
      '...5...5...',
      '....555....',
      '...........',
  ],
  pixelWidth: 1, // smaller pixels for more detail
  palette: {
      '4': '#ffffff',   // highlight
      '5': '#aefcee',   // bubble base
      '.': 0x00000000   // transparent
  }
});
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
    const adjuster = Math.min(1, window.innerHeight/window.innerWidth * 1.2)
    

    // Define the colors for each section
    const opacities = [0,0.35,0.5,0.65];

    // Define the vertical positions for the lines
    this.depthLines = [
      window.innerHeight / 4 + 5,   // First line at 1/4 height
      window.innerHeight / 2 + 5,   // Second line at 1/2 height
      (window.innerHeight * 3) / 4 + 5 // Third line at 3/4 height
    ];
    this.chances = ["High", "Medium", "Low"];
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
      console.log(window.innerHeight)
      this.add.text(
        window.innerWidth/2,
        this.depthLines[index] + 20 * (window.innerHeight / 800),
        `Lure chance: ${this.chances[index]}`,
        { fontSize: `${4 * adjuster}vmin`, 
                fill: '#ffff04', 
               
                



      }).setOrigin(0.5).setAlpha(0.4).setDepth(8);
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
    const emitterManager = this.add.particles(window.innerWidth/2, window.innerHeight/2, 'bubble2', {
      x: { min: -window.innerWidth, max: window.innerWidth },
      y: {min: window.innerHeight/2, max: window.innerHeight/12},
      lifespan: 4000,
      speedY: { min: -50, max: -100 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.2, end: 0.6 },
      alpha: { start: 1, end: 0 },
      tint: [0xffffff, 0xddddd, 0xeeeee],
      frequency: 500,
      quantity: 6,
      blendMode: 'ADD'
  });


  }

  update() {
    this.gameManager.update();
  }
}
