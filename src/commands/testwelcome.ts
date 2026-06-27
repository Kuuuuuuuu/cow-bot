import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';

export default {
    enable: true,
    data: new SlashCommandBuilder()
        .setName('testwelcome')
        .setDescription('Simulate in-out command'),
        
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;

        interaction.client.emit('guildMemberAdd', member);
        
        await interaction.reply({ 
            content: 'Test Complete', 
            flags: ['Ephemeral'] as const 
        });
    }
}