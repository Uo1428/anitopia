"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configProfileEmbed = exports.config = void 0;
const discord_js_1 = require("discord.js");
exports.config = {
    messages: {
        footerText: "For assistance or to report issues, please contact our support team.",
    },
    commands: {
        registerCommandTag: "</register:1160263671814045898>",
        profileCommandTag: "</profile:1160505037873754194>",
        mainCommandTag: "</main:1160515892803817482>",
    },
};
const configProfileEmbed = (interaction, player) => {
    return new discord_js_1.EmbedBuilder()
        .setColor('Blurple')
        .setAuthor({
        name: `${interaction.user.username}'s Profile`,
        iconURL: interaction.user.displayAvatarURL(),
    })
        .setTitle('Account Details')
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`**Biography:**\n\`\`\`${player.bio}\`\`\`\nExplore more options by selecting from the menu below. To personalize your profile, select **Customize Profile**.`)
        .addFields({
        name: '📊 Level',
        value: `${player.experience.level}`,
        inline: true
    }, {
        name: `⭐ Experience Points`,
        value: `${player.experience.exp}/10000`,
        inline: true
    }, {
        name: '🔑 Token',
        value: `\`${player.token}\``,
        inline: true
    }, {
        name: '💰 Golden Coins',
        value: `${player.balance.goldenCoins}`,
        inline: true
    }, {
        name: '💎 Stellar Crystals',
        value: `${player.balance.stellarCrystals}`,
        inline: true
    })
        .setFooter({
        text: `Tip: Use tokens to connect with other users!`,
    });
};
exports.configProfileEmbed = configProfileEmbed;