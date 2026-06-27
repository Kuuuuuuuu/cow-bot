import { AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path'

registerFont(path.join(__dirname, '../assets/fonts/Itim-Regular.ttf'), { family: 'TH-Custom' });

export async function generateCard(member, titleText) {
    const canvas = createCanvas(700, 250)
    const ctx = canvas.getContext('2d')

    try {
        const bgPath = path.join(__dirname, '../assets/images/beach_bg.png')
        const background = await loadImage(bgPath)
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    } catch (e) {
        console.log(`Load image failed ${e}`)
        ctx.fillStyle = '#2c2f33'
        ctx.fillRect(0, 0, canvas.width, canvas.height) // when load image failed
    }

    // draw
    ctx.font = '28px "TH-Custom"'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(titleText, 220, 90)

    ctx.font = 'bold 36px "TH-Custom"'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(member.user.username, 220, 150)

    ctx.save(); // Draw pfp
    
    const x = 55;        
    const y = 65;       
    const width = 120;   
    const height = 120;  
    const radius = 20;   

    // Rounded Square
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    ctx.clip();

    const avatarURL = member.user.displayAvatarURL({ extension: 'jpg', size: 256 });
    const avatar = await loadImage(avatarURL);
    ctx.drawImage(avatar, 55, 65, 120, 120);
    ctx.restore()

    return new AttachmentBuilder(canvas.toBuffer(), { name: 'card-image.png'} )

}

