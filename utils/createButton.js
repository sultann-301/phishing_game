export function createButton(scene, x, y, text, callback, callback2) {
    let buttonWidth = 140;
    let buttonHeight = 40;
  
    let buttonBg = scene.add.rectangle(x, y, buttonWidth, buttonHeight, 0x008000)
      .setOrigin(0.5, 0.5)
      .setInteractive();
  
    let buttonText = scene.add.text(x, y, text, {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5, 0.5);
  
    let buttonContainer = scene.add.container(0, 0, [buttonBg, buttonText]);
  
    buttonBg.on('pointerdown', callback);
    buttonBg.on('pointerup', callback2);
  
    return buttonContainer;
  }
  