// js/ui/UIManager.js
export class UIManager {
    constructor(scene, gameManager) {
      this.scene = scene;
      this.gameManager = gameManager;
      this.fishButton = null;
      this.resetButton = null;
      this.tutButton = null
      this.shopButton = null;
      this.endModalElems = [];
      this.createUI();
      this.createModal();
    }
  
    createUI() {
      const { width, height } = this.scene.game.config;
      const adjuster = Math.max(1, height/width)
      this.createGameOverScreen();

      this.scoreText = this.scene.add.text(width / 2, (25 / (adjuster !== 1 ? (550/height) : 1.35)) / adjuster, `Bytes:${this.gameManager.totalScore}`, {
        fontSize: '5vmin',
        fontFamily:"JoyStix",
        fill: '#ffff04',
        fontFamily:"Joystix",
      }).setOrigin(0.5, 0.5);
  
      this.fishButton = this.createButton(width / 2, height / 10.5, 'Phish',
        () => {
          if(this.gameManager.bait.y.toFixed(2) <= height / 4)
            {
              this.shopButton.list[0].setAlpha(0.5);
              this.tutButton.list[0].setAlpha(0.5);
              this.fishButton.list[1].setText('Phishing..');
              this.gameManager.bait.body.setVelocityY(200); //problem in touch screen;
            }   
          this.gameManager.updateIdleFish();
        },
        () => {
          this.gameManager.bait.body.setVelocityY(0);
          this.fishButton.list[1].setText('Phish');
          this.gameManager.updateIdleFish();
          if(this.gameManager.bait.y.toFixed(2) > height / 4) this.fishButton.list[0].setAlpha(0.5);
          this.tweenyweeny2 = this.scene.tweens.add({
            targets: this.resetButton,
            scaleY : 1.08,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        }, true
      );
  
      this.resetButton = this.createButton(width *  0.85, height / 17, `Reels\n  ${this.gameManager.reelCount}`,
        () => {            
            if(this.gameManager.bait.y.toFixed(2) != this.gameManager.initialBaitY.toFixed(2))
            {
                this.shopButton.list[0].setAlpha(1);
                this.tutButton.list[0].setAlpha(1);
                this.fishButton.list[0].setAlpha(1);
                this.gameManager.resetBait(this.resetButton);
                this.resetButton.list[1].setText(`Reels\n  ${this.gameManager.reelCount}`)
                this.gameManager.updateIdleFish();
                this.tweenyweeny2.stop()
            }
        }
      );

      this.shopButton = this.createButton(width * 0.15, height / 17, 'Shop',
        () => {
          if (this.gameManager.bait.y.toFixed(2) == this.gameManager.initialBaitY.toFixed(2) || this.gameManager.bait.body.velocity.y < 0) {
            this.openModal();
          }
        }
      );

      this.centerX = width * 0.15
      this.centerY = height/6
      this.tutButton = this.createButton(width * 0.15, height/6, "Rules", () => {
        if (this.gameManager.bait.y.toFixed(2) == this.gameManager.initialBaitY.toFixed(2)) {
          this.createInstructionsModal();
          this.tweenyweeny.stop()
          this.shopButton.list[0].setAlpha(1);
          this.fishButton.list[0].setAlpha(1);
          this.resetButton.list[0].setAlpha(1);
          this.fishButton.list[0].setInteractive();
          this.shopButton.list[0].setInteractive();
          this.resetButton.list[0].setInteractive();
          this.fishButton.list[1].setInteractive();
          this.shopButton.list[1].setInteractive();
          this.resetButton.list[1].setInteractive();
        }
      });

      this.shopButton.list[0].setAlpha(0.5);
      this.fishButton.list[0].setAlpha(0.5);
      this.resetButton.list[0].setAlpha(0.5);
      this.fishButton.list[0].disableInteractive();
      this.shopButton.list[0].disableInteractive();
      this.resetButton.list[0].disableInteractive();
      this.fishButton.list[1].disableInteractive();
      this.shopButton.list[1].disableInteractive();
      this.resetButton.list[1].disableInteractive();

     this.tweenyweeny = this.scene.tweens.add({
        targets: this.tutButton,
        scaleY : 1.06,

        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

      this.scene.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
          const {reelCount, totalScore, goalScore} = this.gameManager;
          if(((reelCount <= 0 && totalScore < goalScore) || (totalScore >= goalScore))){
  
              this.endScoreText.setText( `Your Score: ${totalScore} bytes`);
              this.endGameText.setText(totalScore >= goalScore ? 'You Won :)' : 'You Lost :(');
              this.endModalElems.forEach(elem => elem.setVisible(true));
              this.shopButton.list[0].setAlpha(0.5);
              this.tutButton.list[0].setAlpha(0.5);
              this.fishButton.list[0].setAlpha(0.5);
              this.resetButton.list[0].setAlpha(0.5);
              this.fishButton.list[0].disableInteractive();
              this.tutButton.list[0].disableInteractive();
              this.shopButton.list[0].disableInteractive();
              this.resetButton.list[0].disableInteractive();
              this.fishButton.list[1].disableInteractive();
              this.tutButton.list[1].disableInteractive();
              this.shopButton.list[1].disableInteractive();
              this.resetButton.list[1].disableInteractive();
          }
        }
       })
    }

  
    createButton(x, y, label, onDown, onUp = () => {}, phish = false) {
      const { width, height } = this.scene.game.config;
      const fontRatio = Math.min(width, height)
      const adjuster = Math.min(1, width/height * 1.1)
      const adjuster2 = Math.min(1, height/width * 1.5)
      const bg = this.scene.add.rectangle(x, y,phish ? width / (5 * adjuster) : width/5.5, phish ? (height*adjuster/20 + 20) :  (height*adjuster/20 + 20)/adjuster2 + 9, 0x355da4, 1).setInteractive();
      const outline = this.scene.add.graphics();
        outline.lineStyle(3, 0xffff04); // White outline, 2px thick
        outline.strokeRect(
        bg.x - bg.width / 2 -1.5,
        bg.y - bg.height / 2 -1.5,
        bg.width +3,
        bg.height +3
        );
        
      const text = this.scene.add.text(x, y, label, { fontSize: `${fontRatio * 0.035}px`, fontFamily:"JoyStix", color: '#ffff04',  wordWrap: {width: width/5.5}})
      .setOrigin(0.5);
      const container = this.scene.add.container(0, 0, [bg, text, outline]);
      
      text.setInteractive();
      bg.on('pointerdown', onDown);
      bg.on('pointerup', onUp);
      text.on('pointerdown', onDown); 
      text.on('pointerup', onUp); 
      return container;
    }
  
    updateScore(score, increase) {
      this.scoreText.setText(`Bytes:${score}`);
      const { height, width } = this.scene.game.config;
      const adjuster = Math.max(1, height/width)
      if (increase > 0){
        const effectText = this.scene.add.text(
          this.scoreText.x + width/8, // adjust right of score
          this.scoreText.y + 10,
          `+${increase}`,
          {
            fontFamily:"JoyStix",
            fontSize: '5vmin',
            fill: increase == 4096 ? '#d4af37' : '#ffff04',
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
      const adjuster = Math.min(1, height/width * 1.2)
  
      this.modalBackground = this.scene.add.graphics()
        .fillStyle(0x000000, 0.9)
        .fillRect(centerX - width * 3 / 8 - 20, centerY - height / 3, width * 3 / 4 + 40, height * 2 / 2.5)
        .lineStyle(4, 0xffff04)
        .strokeRect(centerX - width * 3 / 8 - 20, centerY - height / 3, width * 3 / 4 + 40, height * 2 / 2.5)
        .setVisible(false).setDepth(10);
      this.modalTitle = this.scene.add.text(centerX, centerY - height / 4 - 20, 'SHOP', {
        fontSize: '7vmin', fontFamily:"JoyStix", fill: '#ffffff'
      }).setOrigin(0.5).setVisible(false).setDepth(11);
  
      const options = ['Website Spoofing', 'Malicious Link Phishing', 'Spear Phishing'];
      const details = ['The creation of a fake website that imitates a legitimate one to trick users into entering sensitive information. \n\n(This boost will increase the probability of fish getting lured to your bait)', 
                        'A deceptive tactic where attackers send emails or messages with dangerous links that lead to fraudulent sites or trigger malware downloads. \n\n(This boost will make the first fish you catch spawn 8 identical fish nearby which you are guaranteed to catch)',
                        ' A targeted phishing attack that uses personalized information to deceive specific individuals (usually company executives) into revealing confidential data. \n\n(This boost will spawn a golden fish having 4096 BYTES in the bottom layer which is guaranteed to be caught.)']
      this.modalOptions = [];
      this.modalDetails = [];
  
      options.forEach((text, i) => {
        let option = this.scene.add.text(
          centerX,
          centerY - height / 6 + i * height / 5.2,
          `${text} (${(i + 1) * 1024} bytes)`,
          { fontSize: `${fontRatio * 0.035}px`, 
            fill: '#00ff00', 
            fontFamily: "JoyStix",
            wordWrap: {
            width: width * 0.8
            } 
          }
        ).setInteractive().setVisible(false).setDepth(11).setOrigin(0.5);

        let detail = this.scene.add.text(
          centerX - width / 3,
          centerY - height / 7.5 + i * height / 5.35,
          `${details[i]}\n`,
          { fontSize: `${2.4 * adjuster}vmin`, 
          fontFamily:"JoyStix",
            fill: '#e7e304', 
            wordWrap: {
            width: width * 0.67
            } 
          }
        ).setInteractive().setVisible(false).setDepth(11).setOrigin(-0.03,0);
  
        option.on('pointerover', () => {
            if (this.gameManager.totalScore >= (i + 1) * 1024 && !this.gameManager.perks.reduce((a, b) => a || b))
            {
                option.setStyle({ fill: '#ff9900' })
            } else {
                option.setStyle({ fill: '#ff0000' })
            }
        });
        option.on('pointerout', () => option.setStyle({ fill: '#00ff00' }));
  
        option.on('pointerdown', () => {
          if (this.gameManager.totalScore >= (i + 1) * 1024 && !this.gameManager.perks.reduce((a, b) => a || b)) {
                this.gameManager.totalScore -= (i + 1) * 1024
                this.updateScore(this.gameManager.totalScore, 0);
                this.gameManager.perks[i] = true;
                const effectText = this.scene.add.text(option.x, option.y,
                    `+1 ${text}`,
                    {
                      fontSize:  `${fontRatio * 0.035}px`,
                      fontFamily:"JoyStix",
                      fill: '#00ff00',
                      fontStyle: 'bold'
                    }
                  ).setOrigin(0.5).setDepth(100); // float above
            
                  this.scene.tweens.add({
                    targets: effectText,
                    y: effectText.y - 40,
                    alpha: 0,
                    duration: 3000,
                    ease: 'Cubic.easeOut',
                    onComplete: () => {
                      effectText.destroy();
                    }
                  });
              this.gameManager.bait.setTexture(`hook${i+2}`);

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
        fontSize: '48px', fontFamily:"JoyStix", fill: '#ff0000'
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
      // this.fishButton.list[0].setAlpha(0.5);
      // this.tutButton.list[0].setAlpha(0.5);
      this.fishButton.list[1].disableInteractive();
      this.tutButton.list[1].disableInteractive();
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
      // this.fishButton.list[0].setAlpha(1);
      // this.tutButton.list[0].setAlpha(1);
      this.fishButton.list[1].setInteractive();
      this.tutButton.list[1].setInteractive();
    }

    createInstructionsModal() {
      const { centerX, centerY } = this.scene.cameras.main;
      const { width, height } = this.scene.game.config;
      const fontRatio = Math.min(width, height)
      const adjuster = Math.max(1, height/width)
    
      // Dark semi-transparent background
      this.instructionsBackground = this.scene.add.graphics()
        .fillStyle(0x000000, 0.9)
        .fillRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 2.7)
        .lineStyle(4, 0xffff04)
        .strokeRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 2.7)
        .setDepth(10);
    
      // Title
      this.instructionsTitle = this.scene.add.text(centerX, centerY - height / 3.4  , 'Rules', {
        fontSize: '9vmin',
        fontFamily:"JoyStix",
        fill: '#ffffff'
      }).setOrigin(0.5).setDepth(11);

      // Instructions text block
      const instructionsText = 
      "\n\n\n\n🪝 Tap & Hold to 'Phish' &  drop your bait!\n\n" +
      "💰 Earn Bytes by catching fish!\n\n" +
      "🛍️ Use Bytes to unlock new phishing techniques (boosts)!\n\n" +
      "🔒 Only one boost is allowed per reel!\n\n" +
      "🌊 Use the Reel Button to bring your bait back!\n\n" +
      "🔁 Only 3 reels, so choose where you want to phish wisely!\n\n" +
      `🏆 You need ${this.gameManager.goalScore} Bytes to win. Good luck!`;
    
      this.instructionsBody = this.scene.add.text(
        centerX,
        centerY,
        instructionsText,
        {
          fontSize: `${fontRatio * 0.03}px`,
          fontFamily:"JoyStix",
          fill: '#ffff04',
          align: 'center',
          wordWrap: { width: width * 0.6 }
        }
      ).setOrigin(0.5).setDepth(11);
    
      // Close button
      this.instructionsCloseButton = this.scene.add.text(centerX + width / 3 - 20, centerY - height / 3.4 , 'X', {
        fontSize: '48px',
        fontFamily:"JoyStix",
        fill: '#ff0000'
      }).setOrigin(0.5).setInteractive().setDepth(11);
    
      this.instructionsCloseButton.on('pointerdown', () => {
        this.instructionsBackground.setVisible(false);
        this.instructionsTitle.setVisible(false);
        this.instructionsBody.setVisible(false);
        this.instructionsCloseButton.setVisible(false);
        this.fishButton.list[0].setInteractive();
        this.shopButton.list[0].setInteractive();
        // this.fishButton.list[0].setAlpha(1);
        // this.shopButton.list[0].setAlpha(1);
        this.fishButton.list[1].setInteractive();
        this.shopButton.list[1].setInteractive();
        this.scene.time.timeScale = 1;
      });
    
      // Make visible & pause game
      this.instructionsBackground.setVisible(true);
      this.instructionsTitle.setVisible(true);
      this.instructionsBody.setVisible(true);
      this.instructionsCloseButton.setVisible(true);
      this.scene.time.timeScale = 0;

    }

    
    createGameOverScreen()
    {
            const { centerX, centerY } = this.scene.cameras.main;
            const {reelCount, totalScore, goalScore} = this.gameManager;
            const { width, height } = this.scene.game.config;
            const fontRatio = Math.min(width, height)
        
            this.modalBackground = this.scene.add.graphics()
              .fillStyle(0x000000, 0.9)
              .fillRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
              .lineStyle(4, 0xffff04)
              .strokeRect(centerX - width * 3 / 8, centerY - height / 3, width * 3 / 4, height * 2 / 3)
              .setVisible(false).setDepth(11);
        
            this.modalTitle = this.scene.add.text(centerX, centerY - height / 4 - 20, 'GAME OVER', {
              fontSize: `${fontRatio * 0.08}px`, fontFamily:"JoyStix", fill: '#ffff04'
            }).setOrigin(0.5).setVisible(false).setDepth(11);

            this.endGameText = this.scene.add.text(
              centerX,
              centerY - height / 10,
              totalScore >= goalScore ? 'You Won :)' : 'You Lost :(',
              { fontSize: `${fontRatio * 0.05}px`, 
                fontFamily:"JoyStix",
                fill: '#ffff04', 
                wordWrap: {
                width: width * 0.6
                } 
              }
            ).setVisible(false).setDepth(15).setOrigin(0.5);
  
           this.endScoreText =  this.scene.add.text(
              centerX,
              centerY + height / 15,
              `Your Score: ${totalScore} bytes`,
              { fontSize: `${Math.floor(fontRatio * 0.035)}px`, 
                fontFamily:"JoyStix",
                fill: '#ffff04', 
                wordWrap: {
                width: width * 0.6
                } 
              }
            ).setInteractive().setVisible(false).setDepth(15).setOrigin(0.5).on('pointerdown', () => {window.location.reload()});
  
            this.againButton = this.scene.add.text(
              centerX,
              centerY + height / 7,
              `Play Again`,
              { fontSize: `${Math.floor(fontRatio * 0.035)}px`, 
                fill: '#ffff04', 
                fontFamily:"JoyStix",
                wordWrap: {
                width: width * 0.6
                } 
              }
            ).setInteractive().setVisible(false).setDepth(15).setOrigin(0.5).on('pointerdown', () => {window.location.reload()})
            
            this.againButton.on('pointerover', () => this.againButton.setStyle({ fill: '#00ff00'}))
            this.againButton.on('pointerout', () => this.againButton.setStyle({ fill: '#ffff04'}))

            this.endModalElems.push(this.modalBackground, this.modalTitle, this.endGameText, this.againButton,this.endScoreText);
          
    }
    
  }
  