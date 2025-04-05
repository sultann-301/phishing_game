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
          this.resetButton.list[1].setText(` Resets \n   ${this.gameManager.reelCount}`)
          this.gameManager.updateIdleFish();
        }
      );
  
      this.shopButton = this.createButton(width / 10, height / 20, 'Shop',
        () => {
          console.log(this.gameManager.bait.y + ' ' + this.gameManager.initialBaitY)
          if (this.gameManager.bait.y === this.gameManager.initialBaitY || this.gameManager.bait.body.velocity.y < 0) {
            this.openModal();
          }
        }
      );

      this.tutButton = this.createButton(width/10, height/7, "How to play", () => {
        if (this.gameManager.bait.y === this.gameManager.initialBaitY) {
          this.createInstructionsModal();
        }
      });
    }
  
    createButton(x, y, label, onDown, onUp = () => {}) {
      const { width, height } = this.scene.game.config;
      const fontRatio = Math.min(width, height)
      const bg = this.scene.add.rectangle(x, y,width/5.5, height/20 + 20, 0x008000).setInteractive();
      const text = this.scene.add.text(x, y, label, { fontSize: `${fontRatio * 0.035}px`, color: '#ffffff',  wordWrap: {width: width/5.5}})
      .setOrigin(0.5);
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
      const fontRatio = Math.min(width, height)
  
      this.modalBackground = this.scene.add.graphics()
        .fillStyle(0x000000, 0.9)
        .fillRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
        .lineStyle(4, 0x00ff00)
        .strokeRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
        .setVisible(false).setDepth(10);
  
      this.modalTitle = this.scene.add.text(centerX, centerY - height / 4 - 20, 'SHOP', {
        fontSize: '7em', fill: '#ffffff'
      }).setOrigin(0.5).setVisible(false).setDepth(11);
  
      const options = ['Website Spoofing', 'Malicious Link Phishing', 'Spear Phishing'];
      const details = ['The creation of a fake website that imitates a legitimate one to trick users into entering sensitive information. The fake website usually has a URL nearly identical to the site being imitated making it difficult to spot.\n\n(This boost will increase the probability of fish getting lured to your bait)', 
                        'A deceptive tactic where attackers send emails or messages with dangerous links that lead to fraudulent sites or trigger malware downloads. If done correctly, it could harm many people as they share the malicious message with each other.\n\n(This boost will make the first fish you catch spawn 8 identical fish nearby which you are guaranteed to catch)',
                        ' A targeted phishing attack that uses personalized information to deceive specific individuals into revealing confidential data or credentials. It could be of grave consequences if the person targetted is an executive in an important company (e.g CEO).\n\n(This boost will spawn a golden fish having 1024 BYTES in the botton layer which is guaranteed to be caught)']
      this.modalOptions = [];
      this.modalDetails = [];
  
      options.forEach((text, i) => {
        let option = this.scene.add.text(
          centerX,
          centerY - height / 6 + i * height / 6,
          `${text} (${(i + 1) * 1024} bytes)`,
          { fontSize: `${fontRatio * 0.035}px`, 
            fill: '#00ff00', 
            wordWrap: {
            width: width * 0.6
            } 
          }
        ).setInteractive().setVisible(false).setDepth(11).setOrigin(0.5);

        let detail = this.scene.add.text(
          centerX - width / 3,
          centerY - height / 8 + i * height / 6,
          `${details[i]}\n`,
          { fontSize: `${fontRatio * 0.018}px`, 
            fill: '#e7e304', 
            wordWrap: {
            width: width * 0.6
            } 
          }
        ).setInteractive().setVisible(false).setDepth(11).setOrigin(-0.03,0);
  
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
            this.updateScore(this.gameManager.totalScore, 0);
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
  
      this.closeButton = this.scene.add.text(centerX + width / 3 - 20, centerY - height / 4 - 20, 'X', {
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
      const fontRatio = Math.min(width, height)
    
      // Dark semi-transparent background
      this.instructionsBackground = this.scene.add.graphics()
        .fillStyle(0x000000, 0.9)
        .fillRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
        .lineStyle(4, 0x00ff00)
        .strokeRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
        .setDepth(10);
    
      // Title
      this.instructionsTitle = this.scene.add.text(centerX, centerY - height / 4 + 15, 'Tips', {
        fontSize: '6em',
        fill: '#ffffff'
      }).setOrigin(0.5).setDepth(11);
    
      // Instructions text block
      const instructionsText = 
      "\n\n\n\n🪝 Tap 'Phish' to drop your bait!\n\n" +
      "💰 Earn Bytes by catching fish.\n\n" +
      "🛍️ Use Bytes to unlock new phishing techniques.\n\n" +
      "🌊 The deeper you go, the more aware the fish are.\n\n" +
      "🔁 Only 3 resets, so choose where you want to phish wisely.\n\n" +
      `🏆 You need ${this.gameManager.goalScore} Bytes to win. Good luck!`;
    
      this.instructionsBody = this.scene.add.text(
        centerX,
        centerY,
        instructionsText,
        {
          fontSize: `${fontRatio * 0.035}px`,
          fill: '#00ff00',
          align: 'center',
          wordWrap: { width: width * 0.6 }
        }
      ).setOrigin(0.5).setDepth(11);
    
      // Close button
      this.instructionsCloseButton = this.scene.add.text(centerX + width / 3 - 20, centerY - height / 4 + 15, 'X', {
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
  