"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Account_1 = require("../../models/Account");
const redis_1 = require("../../lib/redis");
const config_1 = require("../../config");
exports.default = {
    name: "customizeProfileModal",
    callback: async (client, interaction) => {
        try {
            const bioInput = interaction.fields.getTextInputValue('bioInput');
            let account = await Account_1.default.findOneAndUpdate({ accountId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined }, { bio: bioInput }, { new: true });
            await redis_1.default.set(interaction.user.id, JSON.stringify(account), 'EX', 60);
            const profileEmbed = (0, config_1.configProfileEmbed)(interaction, account);
            await interaction.deferUpdate();
            await interaction.editReply({
                embeds: [profileEmbed],
            });
            await interaction.followUp({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                        .setTitle('Profile Updated Successfully 🎉')
                        .setDescription(`Great job, ${interaction.user.username}! Your **Biography** have been successfully updated. Your unique personality shines through your profile! 🌟\n\nNow, let's dive back into the world of Anitopia. Your adventure awaits! 🚀`)
                        .setFooter({
                        text: config_1.config.messages.footerText
                    })
                ],
                ephemeral: true
            });
        }
        catch (error) {
            console.log(`Handle Submit Modal customizeProfileModal Error: ${error}`);
        }
    }
};
