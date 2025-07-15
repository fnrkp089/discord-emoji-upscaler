import { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { extractEmojis, downloadEmoji, upscaleImage, isCustomEmoji } from './utils/imageProcessor.js';
import { setupCommands } from './commands/setup.js';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} is online!`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    
    await setupCommands(client);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'upscale') {
        await handleUpscaleCommand(interaction);
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    if (message.content.startsWith('!upscale')) {
        const emojis = extractEmojis(message.content);
        
        if (emojis.length === 0) {
            await message.reply('Please include a custom emoji to upscale!');
            return;
        }
        
        await upscaleEmoji(message, emojis[0]);
        return;
    }
    
    // Auto-upscale any custom emojis found in messages
    const emojis = extractEmojis(message.content);
    if (emojis.length > 0) {
        // Upscale the first custom emoji found
        await upscaleEmoji(message, emojis[0]);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    
    if (reaction.emoji.name === '🔍') {
        const emojis = extractEmojis(reaction.message.content);
        
        if (emojis.length > 0) {
            const channel = reaction.message.channel;
            await upscaleEmoji({ channel, author: user }, emojis[0]);
        }
    }
});

async function handleUpscaleCommand(interaction) {
    const emojiInput = interaction.options.getString('emoji');
    const scale = interaction.options.getInteger('scale') || 4;
    
    if (!isCustomEmoji(emojiInput)) {
        await interaction.reply('Please provide a valid custom emoji! Default Discord emojis cannot be upscaled.');
        return;
    }
    
    const emojis = extractEmojis(emojiInput);
    if (emojis.length === 0) {
        await interaction.reply('Please provide a valid custom emoji!');
        return;
    }
    
    await interaction.deferReply();
    
    try {
        const emojiData = emojis[0];
        const imageBuffer = await downloadEmoji(emojiData.url);
        
        const upscaledBuffer = await upscaleImage(imageBuffer, {
            scale: scale,
            isAnimated: emojiData.animated
        });
        
        const attachment = new AttachmentBuilder(upscaledBuffer, {
            name: `${emojiData.name}_upscaled.${emojiData.animated ? 'gif' : 'png'}`
        });
        
        const embed = new EmbedBuilder()
            .setTitle(`Upscaled ${emojiData.name}`)
            .setColor(0x5865F2)
            .setImage(`attachment://${emojiData.name}_upscaled.${emojiData.animated ? 'gif' : 'png'}`)
            .setFooter({ text: `Upscaled ${scale}x using advanced algorithms` })
            .setTimestamp();
        
        await interaction.editReply({
            embeds: [embed],
            files: [attachment]
        });
        
    } catch (error) {
        console.error('Upscale error:', error);
        await interaction.editReply('Failed to upscale the emoji. Please try again later.');
    }
}

async function upscaleEmoji(context, emojiData) {
    try {
        const imageBuffer = await downloadEmoji(emojiData.url);
        const upscaledBuffer = await upscaleImage(imageBuffer, {
            scale: 4,
            isAnimated: emojiData.animated
        });
        
        const attachment = new AttachmentBuilder(upscaledBuffer, {
            name: `${emojiData.name}_upscaled.${emojiData.animated ? 'gif' : 'png'}`
        });
        
        await context.channel.send({
            files: [attachment]
        });
        
        // Delete the original message
        if (context.deletable) {
            await context.delete();
        }
        
    } catch (error) {
        console.error('Upscale error:', error);
    }
}

client.login(process.env.DISCORD_TOKEN);