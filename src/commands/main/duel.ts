import { ActionRowBuilder, ApplicationCommandOptionType, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { Character } from "../../classes/Character";
import { Team } from "../../classes/Team";
import { getPlayer } from "../../utils";
import { ITeams } from "../../interfaces";
import { PlayerModel } from "../../models";
import { config } from "../../config";
import { actionNA, playerIssue } from "../exceptions";

export default {
    name: 'duel',
    description: 'Challenge another player to a team battle',
    cooldown: 5_000,
    options: [
        {
            name: 'user',
            description: 'Mention the player you want to duel with',
            type: ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction) => {
        const userOptionValue: string = String(interaction.options.get('user')?.value);

        const opponentUser = await client.users.fetch(userOptionValue);

        const getOpponentUser = await PlayerModel.findOne({ 
            userId: userOptionValue 
        }).populate({
            path: 'teams.lineup.character',
            populate: {
                path: 'character'
            },
        });

        if (getOpponentUser == null || opponentUser.id == interaction.user.id) {
            playerIssue(interaction);
            return;
        }

        const player = await getPlayer(interaction);

        const duelEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTitle('Duel Options')
            .setDescription(`You're challenging **${opponentUser.username} (${getOpponentUser?.playerId})** to a friendly duel. Choose the duel type:\n - **Team of 3**\n- **Team of 5**`)
            .setFooter({
                text: 'Select an option below for your duel type.',
            });
    
        const teamOf3Button = new ButtonBuilder()
            .setCustomId('teamOf3')
            .setLabel('Team of 3')
            .setStyle(ButtonStyle.Primary);

        const teamOf5Button = new ButtonBuilder()
            .setCustomId('teamOf5')
            .setLabel('Team of 5')
            .setDisabled(true)
            .setStyle(ButtonStyle.Primary);

        const duelComponentRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(teamOf3Button, teamOf5Button);

        const response = await interaction.reply({
            embeds: [duelEmbed],
            components: [duelComponentRow],
        });

        const collectorFilter = (i: {
            reply(arg0: { embeds: EmbedBuilder[]; ephemeral: boolean; }): unknown;               
            user: { id: string; username: string; };
        }) => {
            if (i.user.id !== interaction.user.id) {
                actionNA(i, interaction.user.username);
                return false;
            }

            return true;
        };

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60_000
            });

            if (confirmation.customId === 'teamOf3') {
                const duelRequestEmbed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTitle('Duel Request')
                    .setDescription(`Hello **${opponentUser}**! You've been invited by **${interaction.user.username} (${player.playerId})** for a friendly **Team of 3** duel! Are you ready for the challenge?`)
                    .addFields(
                        {
                            name: `${interaction.user.username} (Challenger)`,
                            value: `**Team Name**: ${player.activeTeams.teamOfThree}\n**Power**:`,
                            inline: true,
                        },
                        {
                            name: `${opponentUser.username} (Opponent)`,
                            value: `**Team Name**: ${getOpponentUser.activeTeams.teamOfThree}\n**Power**:`,
                            inline: true,
                        }
                    )
                    .setFooter({
                        text: 'Click the accept button to start the duel.',
                    });

                const acceptButton = new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success);
            
                const declineButton = new ButtonBuilder()
                    .setCustomId('decline')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger);

                const duelRequestComponentRow = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(acceptButton, declineButton);

                await confirmation.deferUpdate();
                const response = await confirmation.editReply({
                    embeds: [duelRequestEmbed],
                    components: [duelRequestComponentRow],
                })

                const collectorFilter = (interaction: {
                    reply(arg0: { embeds: EmbedBuilder[]; ephemeral: boolean; }): unknown;               
                    user: { id: string; username: string; };
                }) => {
                    if (interaction.user.id !== opponentUser.id) {
                        actionNA(interaction, opponentUser.username);
                        return false;
                    }
                
                    return true;
                };

                try {
                    const confirmation = await response.awaitMessageComponent({
                        filter: collectorFilter,
                        time: 300_000
                    });

                    if (confirmation.customId === 'accept') {
                        // const megumin = await loadImage('C:/Storage/Programming/Project Dev/Anitopia/src/public/megumin.png');
                        // const chainsawman = await loadImage('C:/Storage/Programming/Project Dev/Anitopia/src/public/chainsawman.png');
                        // const background = await loadImage('C:/Storage/Programming/Project Dev/Anitopia/src/public/background.png');
                        
                        // // Adjust the canvas dimensions to make it landscape
                        // const canvas = createCanvas(1920, 1080);
                        // const ctx = canvas.getContext('2d');
                        
                        // ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        
                        // // Calculate the desired height for the characters (e.g., half of the canvas height)
                        // const characterHeight = canvas.height / 2;
                        // const meguminScale = characterHeight / megumin.height;
                        // const chainsawmanScale = characterHeight / chainsawman.height;
                        
                        // ctx.save();
                        // ctx.scale(-meguminScale, meguminScale); // Scale the context before drawing Megumin
                        // ctx.drawImage(megumin, -megumin.width * meguminScale * 2, canvas.height - megumin.height * meguminScale / 1.5); // Draw Megumin at the bottom
                        // ctx.restore();
                        
                        // // Draw Chainsaw Man at the scaled size on the right side of the canvas
                        // ctx.drawImage(chainsawman, canvas.width - chainsawman.width * chainsawmanScale, canvas.height - chainsawman.height * chainsawmanScale * 1.3, chainsawman.width * chainsawmanScale, canvas.height - chainsawman.height * chainsawmanScale);
                        
                        // const buffer = canvas.toBuffer('image/png');
                        
                        // const attachment = new AttachmentBuilder(buffer, {name: 'image.png'})
        
                        const activeTeamOfThree = player.teams.find((team: ITeams) => team.name === player.activeTeams.teamOfThree);
                        const opponentActiveTeamOfThree = getOpponentUser?.teams?.find((team: ITeams) => team.name === getOpponentUser.activeTeams.teamOfThree);
        
                        const characterDataPlayerA = activeTeamOfThree.lineup.map((characterObject: any) => {
                            return new Character(
                                characterObject.character.character.name,
                                characterObject.character.attributes.health * 10,
                                characterObject.character.attributes.attack,
                                characterObject.character.attributes.defense,    
                                characterObject.character.attributes.speed,
                                characterObject.character.level,
                                characterObject.character.rarity,
                                characterObject.character.character.element,
                                3
                            );
                        });
        
                        const characterDataPlayerB = opponentActiveTeamOfThree.lineup.map((characterObject: any) => {
                            return new Character(
                                characterObject.character.character.name,
                                characterObject.character.attributes.health * 10,
                                characterObject.character.attributes.attack,
                                characterObject.character.attributes.defense,    
                                characterObject.character.attributes.speed,
                                characterObject.character.level,
                                characterObject.character.rarity,
                                characterObject.character.character.element,
                                3
                            );
                        });
        
                        let PlayerB1 = new Character(
                            'Goblin', // name
                            1000, // health
                            50, // attack
                            60, // defense
                            30, // speed
                            100, // level
                            'Common', // rarity
                            'Shade', // element
                            3, // cooldown
                        );
        
                        let teamA = new Team(characterDataPlayerA);
                        let teamB = new Team(characterDataPlayerB);
        
                        let allCharacters = [...characterDataPlayerA, ...characterDataPlayerB];
        
                        await confirmation.deferUpdate();
                        await confirmation.editReply({
                            content: null,
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Blurple')
                                    .setTitle("Fight")
                                    .addFields(
                                        {
                                            name: `Intializing Battle`,
                                            value: `Player A vs Player B`
                                        },
                                        {
                                            name: `Player A Team`,
                                            value: characterDataPlayerA
                                                .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${character.health}/${character.maxHealth}`)
                                                .join('\n'),
                                            inline: true
                                        },
                                        {
                                            name: `Player B Team`,
                                            value: characterDataPlayerB
                                                .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${character.health}/${character.maxHealth}`)
                                                .join('\n'),
                                            inline: true
                                        },
                                    )
                            ],
                            components: []
                        });
        
                        const delay = (ms: number) => {
                            return new Promise(resolve => setTimeout(resolve, ms));
                        };
                        
                        let turn = 0;
        
                        while (!teamA.isDefeated() && !teamB.isDefeated()) {
                            turn++;
                            console.log(`This is Turn: ${turn}`);
        
                            allCharacters.sort((a, b) => {
                                if (a.speed === b.speed) {
                                    return 0.5 - Math.random();
                                }
                                return b.speed - a.speed;
                            });
        
                            for (let character of allCharacters) {
                                if (character.health > 0) {
                                    let enemyTeamPlayers = teamA.hasMember(character) ? [...characterDataPlayerB] : [...characterDataPlayerA];
        
                                    for (let enemy of enemyTeamPlayers) {
                                        if (enemy.health > 0) {
                                            await delay(1000);
                                            console.log(`Character ${character.name} Attacking!`);
                                            character.attackCalculation(enemy);
        
                                                await confirmation.editReply({
                                                    content: null,
                                                    embeds: [
                                                        new EmbedBuilder()
                                                            .setColor('Blurple')
                                                            .setTitle("Fight")
                                                            .setDescription(`**[Turn ${turn}]**\n${character.name} attack ${enemy.name} with ${character.displayDamage}`)
                                                            .addFields(
                                                                {
                                                                    name: `In-Game Battle`,
                                                                    value: `Turn ${turn}`
                                                                },
                                                                {
                                                                    name: `Player A Team`,
                                                                    value: characterDataPlayerA
                                                                        .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${character.health}/${character.maxHealth}`)
                                                                        .join('\n'),
                                                                    inline: true
                                                                },
                                                                {
                                                                    name: `Player B Team`,
                                                                    value: characterDataPlayerB
                                                                        .map((character: { name: string; health: number; maxHealth: number; }) => `${character.name}: ${character.health}/${character.maxHealth}`)
                                                                        .join('\n'),
                                                                    inline: true
                                                                },
                                                            )
                                                    ],
                                                    components: []
                                                });
                                            break;
                                        }
                                    }
                                }
                            }
                        }
        
                        if (teamA.isDefeated()) {
                            console.log("Team B has won the battle!");
                        } else if (teamB.isDefeated()) {
                            console.log("Team A has won the battle!");
                        } else {
                            console.log("The battle ended in a draw.");
                        }
        
                    }

                } catch (error) {
                }

            }
        } catch (error) {
            console.log(error);
            
        }
    }
};