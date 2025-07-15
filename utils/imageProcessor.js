import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

export function extractEmojis(text) {
    const emojiRegex = /<(a?):(\w+):(\d+)>/g;
    const emojis = [];
    let match;
    
    while ((match = emojiRegex.exec(text)) !== null) {
        const [raw, animated, name, id] = match;
        const isAnimated = animated === 'a';
        const extension = isAnimated ? 'gif' : 'png';
        
        emojis.push({
            raw,
            name,
            id,
            animated: isAnimated,
            url: `https://cdn.discordapp.com/emojis/${id}.${extension}?size=128`
        });
    }
    
    return emojis;
}

export async function downloadEmoji(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    return Buffer.from(response.data);
}

export async function upscaleImage(imageBuffer, options = {}) {
    const { scale = 4, isAnimated = false } = options;
    
    if (isAnimated) {
        return await upscaleGif(imageBuffer, scale);
    } else {
        return await upscaleStatic(imageBuffer, scale);
    }
}

async function upscaleStatic(imageBuffer, scale) {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    const targetSize = 512;
    const interpolationSize = Math.min(targetSize, metadata.width * scale);
    
    let upscaled = await image
        .resize(interpolationSize, interpolationSize, {
            kernel: sharp.kernel.lanczos3,
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();
    
    upscaled = await applyUnsharpMask(upscaled);
    
    upscaled = await enhanceEdges(upscaled);
    
    const finalImage = await sharp(upscaled)
        .resize(targetSize, targetSize, {
            kernel: sharp.kernel.lanczos3,
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
    
    return finalImage;
}

async function applyUnsharpMask(imageBuffer) {
    return await sharp(imageBuffer)
        .sharpen({
            sigma: 1.5,
            m1: 1.0,
            m2: 0.5,
            x1: 2,
            y2: 10,
            y3: 20
        })
        .toBuffer();
}

async function enhanceEdges(imageBuffer) {
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();
    
    const edgeKernel = [
        -1, -1, -1,
        -1,  9, -1,
        -1, -1, -1
    ];
    
    const enhanced = await image
        .convolve({
            width: 3,
            height: 3,
            kernel: edgeKernel,
            scale: 1,
            offset: 0
        })
        .toBuffer();
    
    const original = await sharp(imageBuffer).ensureAlpha().raw().toBuffer();
    const edge = await sharp(enhanced).ensureAlpha().raw().toBuffer();
    
    const blended = Buffer.alloc(original.length);
    const blendFactor = 0.3;
    
    for (let i = 0; i < original.length; i += 4) {
        blended[i] = Math.min(255, original[i] * (1 - blendFactor) + edge[i] * blendFactor);
        blended[i + 1] = Math.min(255, original[i + 1] * (1 - blendFactor) + edge[i + 1] * blendFactor);
        blended[i + 2] = Math.min(255, original[i + 2] * (1 - blendFactor) + edge[i + 2] * blendFactor);
        blended[i + 3] = original[i + 3];
    }
    
    return await sharp(blended, {
        raw: {
            width,
            height,
            channels: 4
        }
    }).png().toBuffer();
}

async function upscaleGif(gifBuffer, scale) {
    try {
        // For animated GIFs, we'll use Sharp's built-in GIF support
        // This preserves animation but with limited processing options
        const targetSize = 512;
        
        const upscaledGif = await sharp(gifBuffer, { animated: true })
            .resize(targetSize, targetSize, {
                kernel: sharp.kernel.lanczos3,
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .sharpen({
                sigma: 1.0,
                m1: 0.8,
                m2: 0.3,
                x1: 2,
                y2: 8,
                y3: 15
            })
            .gif()
            .toBuffer();
            
        return upscaledGif;
        
    } catch (error) {
        console.error('GIF processing error:', error);
        // If GIF processing fails, fall back to static processing
        return await upscaleStatic(gifBuffer, scale);
    }
}

export function isCustomEmoji(input) {
    const customEmojiRegex = /<(a?):(\w+):(\d+)>/;
    return customEmojiRegex.test(input);
}