// js/ui/UIManager.js
export class UIManager {
    constructor(scene, gameManager) {
      this.scene = scene;
      this.gameManager = gameManager;
      this.fishButton = null;
      this.resetButton = null;
      this.tutButton = null
      this.shopButton = null;

  
      this.createUI();
      this.createModal();
    }
  
    createUI() {
      const { width, height } = this.scene.game.config;


      
  
      this.scoreText = this.scene.add.text(width / 2, 25, 'Bytes:0', {
        fontSize: '2rem',
        fill: '#00ff00'
      }).setOrigin(0.5, 0.5);
  
      this.fishButton = this.createButton(width / 2, height / 11, 'Phish',
        () => {
          if(this.gameManager.bait.y === this.gameManager.initialBaitY) this.gameManager.bait.body.setVelocityY(100); //problem in touch screens
          this.gameManager.updateIdleFish();
        },
        () => {
          this.gameManager.bait.body.setVelocityY(0);
          this.gameManager.updateIdleFish();
        }
      );
  
      this.resetButton = this.createButton(width * 9 / 10, height / 20, ` Resets \n   ${this.gameManager.reelCount}`,
        () => {
          this.gameManager.resetBait();
          console.log(this.gameManager.reelCount)

          this.resetButton.list[1].setText(` Resets \n   ${this.gameManager.reelCount}`)
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

      this.tutButton = this.createButton(width/10, height/9, "How to\n play", () => {
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
      return container;
    }
  
    updateScore(score, increase) {
      this.scoreText.setText(`Bytes:${score}`);
      const { width } = this.scene.game.config;

      if (increase > 0){
        const effectText = this.scene.add.text(
          this.scoreText.x + 100, // adjust right of score
          this.scoreText.y,
          `+${increase}`,
          {
            fontSize: '1rem',
            fill: increase == 1024 ? '#d4af37' : '#00ff00',
            fontStyle: 'bold'
          }
        ).setOrigin(0, 0.5).setDepth(100); // float above
  
        this.scene.tweens.add({
          targets: effectText,
          y: effectText.y - 20,
          alpha: 0,
          duration: 1000,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            effectText.destroy();
          }
        });
      }
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
        fontSize: '6em', fill: '#ffffff'
      }).setOrigin(0.5).setVisible(false).setDepth(11);
  
      const options = ['Website Spoofing', 'Malicious Link Phishing', 'Spear Phishing'];
      const details = ['The creation of a fake website that imitates a legitimate one to trick users into entering sensitive \ninformation.', 
                        'A deceptive tactic where attackers send emails or messages with dangerous links that lead to \nfraudulent sites or trigger malware downloads',
                        ' A targeted phishing attack that uses personalized information to deceive specific individuals \ninto revealing confidential data or credentials.']
      this.modalOptions = [];
      this.modalDetails = [];
  
      options.forEach((text, i) => {
        let option = this.scene.add.text(
          centerX - width / 3,
          centerY - height / 10 + i * height / 6,
          `${text}\n (${(i + 1) * 1024} bytes)`,
          { fontSize: '2em', fill: '#00ff00',  }
        ).setInteractive().setVisible(false).setDepth(11);

        let detail = this.scene.add.text(
          centerX - width / 3,
          centerY - height / 20 + i * height / 6,
          `${details[i]}\n`,
          { fontSize: '1.5em', fill: '#00ff00' }
        ).setInteractive().setVisible(false).setDepth(11);
  
        option.on('pointerover', () => {
            if (this.gameManager.totalScore >= (i + 1) * 1024)
            {
                option.setStyle({ fill: '#ff9900' })
            } else {
                option.setStyle({ fill: '#ff0000' })
            }
        });
        option.on('pointerout', () => option.setStyle({ fill: '#00ff00' }));
  
        option.on('pointerdown', () => {
          if (this.gameManager.totalScore >= (i + 1) * 1024) {
            this.gameManager.totalScore -= (i + 1) * 1024
            this.gameManager.perks[i] = true;
          } else {
            this.scene.tweens.add({
              targets: option,
              duration: 50,
              x: option.x +10,
              repeat: 3,
              yoyo: true,
              ease: "Sine.easeInOut",
              onStart: () => {
                option.disableInteractive();
            },
            onComplete: () => {
                option.setInteractive();
                option.setStyle({ fill: '#00ff00' })
            }
            });
          }
        });
  
        this.modalOptions.push(option);
        this.modalDetails.push(detail);
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
      this.modalDetails.forEach(d => d.setVisible(true));
      this.closeButton.setVisible(true);
      this.scene.time.timeScale = 0;
      this.fishButton.list[0].disableInteractive();
      this.tutButton.list[0].disableInteractive();
    }
  
    closeModal() {
      this.modalBackground.setVisible(false);
      this.modalTitle.setVisible(false);
      this.modalOptions.forEach(o => o.setVisible(false));
      this.modalDetails.forEach(d => d.setVisible(false));
      this.closeButton.setVisible(false);
      this.scene.time.timeScale = 1;
      this.fishButton.list[0].setInteractive();
      this.tutButton.list[0].setInteractive();
    }

    createInstructionsModal() {
      const { centerX, centerY } = this.scene.cameras.main;
      const { width, height } = this.scene.game.config;
    
      // Dark semi-transparent background
      this.instructionsBackground = this.scene.add.graphics()
        .fillStyle(0x000000, 0.9)
        .fillRect(centerX - width * 3 / 8, centerY - height / 2.5, width * 3 / 4, height * 2 / 2.5)
        .lineStyle(4, 0x00ff00)
        .strokeRect(centerX - width * 3 / 8, centerY - height / 2.5, width * 3 / 4, height * 2 / 2.5)
        .setDepth(10);
    
      // Title
      this.instructionsTitle = this.scene.add.text(centerX, centerY - height / 3 + 15, 'HOW TO \n PLAY', {
        fontSize: '6em',
        fill: '#ffffff'
      }).setOrigin(0.5).setDepth(11);
    
      // Instructions text block
      const instructionsText = 
        "\n\n\n\n🪝 Tap 'Phish' to drop your bait!\n\n\n\n" +
        "💰 Earn Bytes by catching fish.\n\n\n\n" +
        "🛍️ Use Bytes to unlock new phishing techniques.";
    
      this.instructionsBody = this.scene.add.text(
        centerX,
        centerY,
        instructionsText,
        {
          fontSize: '3em',
          fill: '#00ff00',
          align: 'center',
          wordWrap: { width: width * 0.6 }
        }
      ).setOrigin(0.5).setDepth(11);
    
      // Close button
      this.instructionsCloseButton = this.scene.add.text(centerX + width / 3, centerY - height / 3 + 15, 'X', {
        fontSize: '48px',
        fill: '#ff0000'
      }).setOrigin(0.5).setInteractive().setDepth(11);
    
      this.instructionsCloseButton.on('pointerdown', () => {
        this.instructionsBackground.setVisible(false);
        this.instructionsTitle.setVisible(false);
        this.instructionsBody.setVisible(false);
        this.instructionsCloseButton.setVisible(false);
        this.fishButton.list[0].setInteractive();
        this.shopButton.list[0].setInteractive();
        this.scene.time.timeScale = 1;
      });
    
      // Make visible & pause game
      this.instructionsBackground.setVisible(true);
      this.instructionsTitle.setVisible(true);
      this.instructionsBody.setVisible(true);
      this.instructionsCloseButton.setVisible(true);
      this.scene.time.timeScale = 0;
      this.fishButton.list[0].disableInteractive();
      this.shopButton.list[0].disableInteractive();
    }
    
  }
  