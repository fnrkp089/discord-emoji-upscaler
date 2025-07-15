# Discord Emoji Upscaler Bot

A Discord bot that automatically detects and upscales custom emojis using advanced image processing algorithms, making them appear as high-quality 512x512 images.

![Bot Demo](https://img.shields.io/badge/Discord-Bot-7289da?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

### 🔄 **Automatic Upscaling**
- Detects custom emojis in messages and automatically upscales them
- No commands needed - just post an emoji and get an enhanced version
- Deletes the original message after processing for a clean experience

### 🎨 **Advanced Image Processing**
- **Lanczos3 Interpolation**: High-quality resampling algorithm
- **Unsharp Masking**: Enhances detail and perceived sharpness
- **Edge Enhancement**: Custom convolution filters for crisp edges
- **Alpha Channel Preservation**: Maintains transparency perfectly

### 🎬 **Animation Support**
- Preserves animated GIFs during upscaling
- Maintains frame timing and smooth playback
- Fallback to static processing if animation fails

### 💡 **Multiple Interaction Methods**
- **Automatic**: Simply post a custom emoji in chat
- **Slash Command**: `/upscale emoji:<emoji> scale:<2|4|8>`
- **Text Command**: `!upscale <emoji>`
- **Reaction**: React with 🔍 to messages containing custom emojis

### 🛡️ **Smart Filtering**
- Only processes custom emojis (ignores default Discord emojis)
- Validates emoji format before processing
- Error handling with graceful fallbacks

## 🚀 Quick Start

### Prerequisites
- Node.js 16.9.0 or higher
- Discord bot token
- Server with appropriate permissions

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/discord-emoji-upscaler.git
   cd discord-emoji-upscaler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Discord bot token:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

### Development
```bash
npm run dev  # Start with nodemon for auto-reload
```

## 🔧 Bot Setup

### 1. Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to "Bot" section and create a bot
4. Copy the bot token for your `.env` file

### 2. Required Permissions
The bot needs these permissions to function properly:

**General Permissions:**
- View Channels
- Send Messages
- Manage Messages (to delete original messages)
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Use Slash Commands

**Permission Integer:** `412317906944`

### 3. Invite Bot to Server
Use this invite link (replace `YOUR_BOT_CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=412317906944&scope=bot%20applications.commands
```

## 📖 Usage Guide

### Automatic Upscaling
Simply post any custom emoji in a channel where the bot has access:
```
Look at this emoji: <:custom_emoji:123456789>
```
The bot will automatically:
1. Detect the custom emoji
2. Download and upscale it
3. Post the enhanced version
4. Delete your original message

### Slash Commands
```
/upscale emoji:<:custom_emoji:123456789> scale:4
```
**Parameters:**
- `emoji`: The custom emoji to upscale (required)
- `scale`: Upscale factor - 2x, 4x, or 8x (optional, default: 4x)

### Text Commands
```
!upscale <:custom_emoji:123456789>
```

### Reaction Method
React with 🔍 to any message containing custom emojis to trigger upscaling.

## 🔬 Technical Implementation

### Image Processing Pipeline

1. **Input Validation**
   - Regex pattern matching for custom emoji format
   - URL validation and emoji download

2. **Upscaling Process**
   ```
   Original (128x128) → Lanczos3 Interpolation → Unsharp Masking → Edge Enhancement → Output (512x512)
   ```

3. **Algorithm Details**
   - **Lanczos3 Kernel**: Superior quality interpolation
   - **Unsharp Masking**: Selective sharpening with custom parameters
   - **Edge Enhancement**: 3x3 convolution filter with blending

### Animated GIF Handling
- Uses Sharp's built-in animated GIF support
- Preserves frame timing and transparency
- Applies enhancement to all frames simultaneously

### Performance Optimizations
- Streaming buffer processing
- Automatic cleanup of temporary files
- Memory-efficient operations
- Error handling with fallbacks

## 📁 Project Structure

```
discord-emoji-upscaler/
├── index.js                 # Main bot file
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (excluded from git)
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── commands/
│   └── setup.js           # Slash command registration
└── utils/
    └── imageProcessor.js   # Core upscaling algorithms
```

## 🛠️ Dependencies

### Core Dependencies
- **`discord.js`** (v14.14.1) - Discord bot framework
- **`sharp`** (v0.33.1) - High-performance image processing
- **`axios`** (v1.6.2) - HTTP client for downloading emojis
- **`dotenv`** (v16.3.1) - Environment variable management

### Development Dependencies
- **`nodemon`** (v3.0.2) - Auto-reload during development

## 🎯 Key Features Explained

### Why Algorithmic Upscaling?
- **No API Dependencies**: Fully self-contained processing
- **No Rate Limits**: Process unlimited emojis
- **Consistent Quality**: Reliable results every time
- **Privacy**: No data sent to external services

### Output Quality
- **512x512 Resolution**: 4x larger than original Discord emojis
- **Transparency Preserved**: Perfect alpha channel handling
- **Sharp Details**: Multi-stage enhancement pipeline
- **Animation Intact**: GIFs remain animated

## 🚫 Limitations

- Only processes custom emojis (not Unicode/default Discord emojis)
- Requires appropriate Discord permissions
- GIF processing has quality limitations compared to static images
- Maximum file size limited by Discord's attachment limits
