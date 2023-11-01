import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CollectedInteraction, CommandInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import character from "./character";
import { getPlayer } from "../../utils";

export default {
    name: 'team',
    description: 'Create your team',
    cooldown: 5_000,
    options: [],
    deleted: false,

    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionRequired: [],

    callback: async function callback(client: Client, interaction: CommandInteraction | CollectedInteraction, editReply: boolean = false, resetComponents: boolean = false) {
        const player = await getPlayer(interaction);

        let teamFields = [];

        for (let i = 0; i < player.teams.length; i++) {
            let isActive = '';
            if (player.activeTeams.teamOfThree === player.teams[i].name || player.activeTeams.teamOfFive === player.teams[i].name) {
                isActive = '• __Active__';
            }
        
            teamFields.push({
                name: `🔹 ${player.teams[i].name} ${isActive}`,
                value: `Team of ${player.teams[i].size}`,
                inline: true
            });
        }
        
        for (let i = player.teams.length; i < 6; i++) {
            teamFields.push({
                name: `🔸_Empty Slot_`,
                value: '_Available for a new team_',
                inline: true
            });
        }
        
        const teamEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: `${interaction.user.username}'s Teams`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle(`Team Management`)
            .setDescription(`This is your current lineup of teams for battles. You can have one **Active Team of 3** and one **Active Team of 5** selected for battles at any time. The other teams are available for selection.`)
            .addFields(...teamFields)
            .setFooter({
                iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                text: 'Select an option from the menu bellow to manage your team.',
            });
    
        const teamOption = new StringSelectMenuBuilder()
            .setCustomId('teamOption')
            .setPlaceholder('Select an action for you team')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Back')
                    .setDescription('Return to the character menu')
                    .setValue('back')
                    .setEmoji('🔙'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Create Team')
                    .setDescription('Create a new team')
                    .setValue('create')
                    .setEmoji('🆕'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('View or  Team')
                    .setDescription('View or update your team details')
                    .setValue('viewOrUpdate')
                    .setEmoji('🔍'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Delete Team')
                    .setDescription('Remove your team')
                    .setValue('delete')
                    .setEmoji('🗑️')
            )

        const teamComponentRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(teamOption);

        const responseOptions = {
            embeds: [teamEmbed],
            components: [teamComponentRow],
            files: []
        };

        if ('deferUpdate' in interaction && editReply && !resetComponents) {
            await interaction.deferUpdate();
        }

        const response = editReply ? await interaction.editReply(responseOptions) : await interaction.reply(responseOptions);

        const collectorFilter = (i: { user: { id: string }}) => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 300_000
            });

            if (confirmation.customId === 'teamOption' && 'values' in confirmation) {
                if (confirmation.values.includes('back')) {
                    await character.callback(client, confirmation, false, true);
                } else if (confirmation.values.includes('create')) {
                    const createTeamModal = new ModalBuilder()
                        .setCustomId('createTeamModal')
                        .setTitle('Create a New Team');

                    const createTeamInput = new TextInputBuilder()
                        .setCustomId('createTeamInput')
                        .setLabel('Team Name')
                        .setPlaceholder('Enter a unique alphanumeric team name')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    createTeamModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(createTeamInput));

                    if (!(confirmation instanceof ModalSubmitInteraction)) {
                        await confirmation.showModal(createTeamModal);
                    }

                    await callback(client, confirmation, true, true);
                } else if (confirmation.values.includes('viewOrUpdate')) {
                    const detailTeamModal = new ModalBuilder()
                        .setCustomId('detailTeamModal')
                        .setTitle('Team Details');
                    
                    const detailTeamInput = new TextInputBuilder()
                        .setCustomId('detailTeamInput')
                        .setLabel('Team Name')
                        .setPlaceholder('Enter the team name you wish to view or edit')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    detailTeamModal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(detailTeamInput));

                    if (!(confirmation instanceof ModalSubmitInteraction)) {
                        await confirmation.showModal(detailTeamModal);
                    }

                    await callback(client, confirmation, true, true);
                }
            }


        } catch (error) {

        }
    }
}