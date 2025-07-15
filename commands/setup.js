import { REST, Routes, SlashCommandBuilder } from 'discord.js';

export async function setupCommands(client) {
    const commands = [
        new SlashCommandBuilder()
            .setName('upscale')
            .setDescription('Upscale a custom emoji to make it larger and sharper')
            .addStringOption(option =>
                option
                    .setName('emoji')
                    .setDescription('The custom emoji to upscale')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option
                    .setName('scale')
                    .setDescription('Upscale factor (2, 4, or 8)')
                    .setRequired(false)
                    .addChoices(
                        { name: '2x', value: 2 },
                        { name: '4x', value: 4 },
                        { name: '8x', value: 8 }
                    )
            )
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🔄 Refreshing application (/) commands...');

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
}