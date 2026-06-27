import { EmbedBuilder } from 'discord.js'
import { generateCard } from '../utils/joinCard'

const CHANNEL_ID = '1520365739817697392'

export default {
    enable: true,
    once: false,
    async execute(member) {
        const totalMembers = member.guild.memberCount;
        const channel = member.guild.channels.cache.get(CHANNEL_ID)
        const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
        if (!channel) return

        try {
            const attachment = await generateCard(member, 'ยินดีต้อนรับสู่ Server')
            const embed = new EmbedBuilder()
                .setColor('#2596be')
                .setTitle("🐮 ยินดีต้อนรับสู่ Captaincow's Resident")
                .setDescription(`สมาชิกใหม่ -> ${member}\nจำนวนสมาชิกปัจจุบัน -> ${totalMembers}\nแนะนำตนเองได้ที่ - [กดตรงนี้](https://discord.com/channels/997523369337561170/1517582344926662729) `)
                .setImage('attachment://card-image.png')
                .setThumbnail(avatarURL)
                .setTimestamp()

            await channel.send({ 
                content: `สวัสดีครับคุณ <@${member.id}>!`, 
                embeds: [embed], 
                files: [attachment] 
            });

        } catch (e) {
            console.log('Cant send embed', e)
        }
    }
}