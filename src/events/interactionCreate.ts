import config from '../config';
import client from '../index';
import {
   ActionRowBuilder,
   Colors,
   EmbedBuilder,
   GuildMember,
   Interaction,
   MessageFlags,
   ModalBuilder,
   TextChannel,
   TextInputBuilder,
   TextInputStyle,
} from 'discord.js';

let verifyLogChannel: TextChannel;

async function sendVerifyLog(user: Interaction['user'], name: string, age: number) {
   if (!verifyLogChannel) {
      const channel = await client.channels.fetch(config.verifyLogChannelId);

      if (channel?.isTextBased()) {
         verifyLogChannel = channel as TextChannel;
      }
   }

   if (!verifyLogChannel) {
      return;
   }

   await verifyLogChannel.send({
      embeds: [
         new EmbedBuilder()
            .setTitle('มีคนแนะนำตัวเองแล้ว!')
            .setThumbnail(user.displayAvatarURL())
            .addFields(
               {name: 'ชื่อเล่น', value: name, inline: true},
               {name: 'อายุ', value: age.toString(), inline: true},
               {name: 'Discord', value: user.toString()},
            )
            .setFooter({text: `ID: ${user.id}`})
            .setTimestamp()
            .setColor(Colors.Green),
      ],
   });
}

export default {
   enable: true,
   once: false,

   async execute(interaction: Interaction) {
      if (!interaction.inGuild()) {
         return;
      }

      const member = interaction.member as GuildMember;

      if (interaction.isChatInputCommand()) {
         const command = client.commands.get(interaction.commandName);

         if (!command?.enable) {
            return;
         }

         try {
            await command.execute(interaction);
         } catch (error) {
            console.error(error);
         }
      } else if (interaction.isButton()) {
         switch (interaction.customId) {
            case 'register': {
               await interaction.showModal(
                  new ModalBuilder()
                     .setCustomId('register_modal')
                     .setTitle('แนะนำตัวเอง')
                     .addComponents(
                        new ActionRowBuilder<TextInputBuilder>().addComponents(
                           new TextInputBuilder()
                              .setCustomId('register_name')
                              .setLabel('ชื่อเล่น')
                              .setStyle(TextInputStyle.Short)
                              .setMinLength(2)
                              .setMaxLength(20)
                              .setPlaceholder('วัว')
                              .setRequired(true),
                        ),
                        new ActionRowBuilder<TextInputBuilder>().addComponents(
                           new TextInputBuilder()
                              .setCustomId('register_age')
                              .setLabel('อายุ')
                              .setStyle(TextInputStyle.Short)
                              .setMinLength(1)
                              .setMaxLength(2)
                              .setPlaceholder('67')
                              .setRequired(true),
                        ),
                     ),
               );
               break;
            }
            // no default
         }
      } else if (interaction.isModalSubmit()) {
         switch (interaction.customId) {
            case 'register_modal': {
               const name = interaction.fields.getTextInputValue('register_name');
               const age = Number(interaction.fields.getTextInputValue('register_age'));

               if (!Number.isInteger(age)) {
                  await interaction.reply({
                     content: 'กรุณากรอกอายุเป็นตัวเลข',
                     flags: MessageFlags.Ephemeral,
                  });
                  return;
               }

               try {
                  await interaction.reply({
                     content: `คุณ ${name} อายุ ${age} ปี ได้ยืนยันตัวตนเรียบร้อยแล้ว!`,
                     flags: MessageFlags.Ephemeral,
                  });

                  await sendVerifyLog(interaction.user, name, age);
                  await member.roles.add(config.verifyRoleId);
               } catch (error) {
                  console.error(error);

                  await interaction.reply({
                     content: 'เกิดข้อผิดพลาดในการยืนยันตัวตนของคุณ โปรดลองอีกครั้ง',
                     flags: MessageFlags.Ephemeral,
                  });
               }
               break;
            }
            // no default
         }
      }
   },
};
