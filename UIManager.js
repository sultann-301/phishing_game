// js/ui/UIManager.js
export class UIManager {
    constructor(scene, gameManager) {
      this.scene = scene;
      this.gameManager = gameManager;
      this.perks = [false, false, false];
      this.fishButton = null;
      this.resetButton = null;
      this.tutButton = null
      this.shopButton = null;
  
      this.createUI();
      this.createModal();
    }
  
    createUI() {
      const { width, height } = this.scene.game.config;
  
      this.scoreText = this.scene.add.text(width / 2, 25, 'Bytes: 0', {
        fontSize: '30px',
        fill: '#00ff00'
      }).setOrigin(0.5, 0.5);
  
      this.fishButton = this.createButton(width / 2, height / 11, 'Phish',
        () => {
          this.gameManager.bait.body.setVelocityY(100);
          this.gameManager.updateIdleFish();
        },
        () => {
          this.gameManager.bait.body.setVelocityY(0);
          this.gameManager.updateIdleFish();
        }
      );
  
      this.resetButton = this.createButton(width * 9 / 10, height / 20, 'Reset',
        () => {
          this.gameManager.resetBait();
          this.gameManager.updateIdleFish();
        }
      );
  
      this.shopButton = this.createButton(width / 10, height / 20, 'Shop',
        () => {
          if (this.gameManager.bait.y === this.gameManager.initialBaitY) {
            this.openModal();
          }
        }
      );

      this.tutButton = this.createButton(width/10, height/9, "How to\n Play", () => {
        if (this.gameManager.bait.y === this.gameManager.initialBaitY) {
          this.createInstructionsModal();
        }
      });
    }
  
    createButton(x, y, label, onDown, onUp = () => {}) {
      const { width, height } = this.scene.game.config;
      const bg = this.scene.add.rectangle(x, y,width/5.5, height/20, 0x008000).setInteractive();
      const text = this.scene.add.text(x, y, label, { fontSize: `1rem`, color: '#ffffff' }).setOrigin(0.5);
      const container = this.scene.add.container(0, 0, [bg, text]);
      bg.on('pointerdown', onDown);
      bg.on('pointerup', onUp);
      return bg;
    }
  
    updateScore(score) {
      this.scoreText.setText(`Bytes: ${score}`);
    }


  
    createModal() {
      const { centerX, centerY } = this.scene.cameras.main;
      const { width, height } = this.scene.game.config;
  
      this.modalBackground = this.scene.add.graphics()
        .fillStyle(0x000000, 0.9)
        .fillRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
        .lineStyle(4, 0x00ff00)
        .strokeRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
        .setVisible(false).setDepth(10);
  
      this.modalTitle = this.scene.add.text(centerX, centerY - height / 4, 'SHOP', {
        fontSize: '64px', fill: '#ffffff'
      }).setOrigin(0.5).setVisible(false).setDepth(11);
  
      const options = ['Website Spoofing', 'Malicious Link Phishing', 'Spear Phishing'];
      this.modalOptions = [];
  
      options.forEach((text, i) => {
        let option = this.scene.add.text(
          centerX - width / 3,
          centerY - height / 10 + i * height / 6,
          `${text} (${(i + 1) * 1024} bytes)`,
          { fontSize: '24px', fill: '#00ff00' }
        ).setInteractive().setVisible(false).setDepth(11);
  
        option.on('pointerover', () => {
          option.setStyle({ fill: '#ff9900' })
        });
        option.on('pointerout', () => option.setStyle({ fill: '#00ff00' }));
  
        option.on('pointerdown', () => {
          if (this.gameManager.totalScore >= (i + 1) * 1024) {
            this.perks[i] = true;
          } else {
            const tweeny = this.scene.tweens.add({
              targets: option,
              duration: 500,
              repeat: 3,
              yoyo: true,
              onStart: () => option.setFill('#ff0000'),
              onComplete: () => option.setFill('#00ff00')
            });
            tweeny.play()
          }
        });
  
        this.modalOptions.push(option);
      });
  
      this.closeButton = this.scene.add.text(centerX + width / 3, centerY - height / 4, 'X', {
        fontSize: '48px', fill: '#ff0000'
      }).setOrigin(0.5).setInteractive().setVisible(false).setDepth(11);
  
      this.closeButton.on('pointerdown', () => this.closeModal());
    }

  
    openModal() {
      this.modalBackground.setVisible(true);
      this.modalTitle.setVisible(true);
      this.modalOptions.forEach(o => o.setVisible(true));
      this.closeButton.setVisible(true);
      this.scene.time.timeScale = 0;
      this.fishButton.disableInteractive();
      this.tutButton.disableInteractive();
    }
  
    closeModal() {
      this.modalBackground.setVisible(false);
      this.modalTitle.setVisible(false);
      this.modalOptions.forEach(o => o.setVisible(false));
      this.closeButton.setVisible(false);
      this.scene.time.timeScale = 1;
      this.fishButton.setInteractive();
      this.tutButton.setInteractive();
    }

    createInstructionsModal() {
      const { centerX, centerY } = this.scene.cameras.main;
      const { width, height } = this.scene.game.config;
    
      // Dark semi-transparent background
      this.instructionsBackground = this.scene.add.graphics()
        .fillStyle(0x000000, 0.9)
        .fillRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
        .lineStyle(4, 0x00ff00)
        .strokeRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
        .setDepth(10);
    
      // Title
      this.instructionsTitle = this.scene.add.text(centerX, centerY - height / 4, 'HOW TO PLAY', {
        fontSize: '48px',
        fill: '#ffffff'
      }).setOrigin(0.5).setDepth(11);
    
      // Instructions text block
      const instructionsText = 
        "🪝 Tap 'Phish' to drop your bait!\n\n" +
        "💰 Earn Bytes by catching fish.\n\n" +
        "🛍️ Use Bytes to unlock new phishing techniques.";
    
      this.instructionsBody = this.scene.add.text(
        centerX,
        centerY,
        instructionsText,
        {
          fontSize: '48px',
          fill: '#00ff00',
          align: 'center',
          wordWrap: { width: width * 0.6 }
        }
      ).setOrigin(0.5).setDepth(11);
    
      // Close button
      this.instructionsCloseButton = this.scene.add.text(centerX + width / 3, centerY - height / 4, 'X', {
        fontSize: '48px',
        fill: '#ff0000'
      }).setOrigin(0.5).setInteractive().setDepth(11);
    
      this.instructionsCloseButton.on('pointerdown', () => {
        this.instructionsBackground.setVisible(false);
        this.instructionsTitle.setVisible(false);
        this.instructionsBody.setVisible(false);
        this.instructionsCloseButton.setVisible(false);
        this.fishButton.setInteractive();
        this.tutButton.setInteractive();
        this.scene.time.timeScale = 1;
      });
    
      // Make visible & pause game
      this.instructionsBackground.setVisible(true);
      this.instructionsTitle.setVisible(true);
      this.instructionsBody.setVisible(true);
      this.instructionsCloseButton.setVisible(true);
      this.scene.time.timeScale = 0;
      this.fishButton.disableInteractive();
      this.tutButton.disableInteractive();
    }
    
  }
  