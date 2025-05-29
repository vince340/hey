const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Cache system with 20-second expiry
const imageCache = new Map();
const CACHE_EXPIRY = 20000; // 20 seconds in milliseconds

module.exports = {
    name: "gen",
    usePrefix: false,
    usage: "Gen <texte> [ratio]",
    version: "2.1",
    author: "aesther",
    cooldown: 10,

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;

        if (!args[0]) {
            return api.sendMessage("ℹ️ Usage : chatgpt <texte> [ratio]\nExemple : chatgpt Naruto 16:9", threadID, messageID);
        }

        const availableRatios = ["1:1", "16:9", "2:3", "3:2", "4:5", "5:4", "9:16", "21:9", "9:21"];
        let ratio = "1:1";

        if (args.length > 1 && availableRatios.includes(args[args.length - 1])) {
            ratio = args.pop();
        }

        const text = args.join(" ");
        const cacheKey = `${text}_${ratio}`;

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // Generate two unique images
            const apiUrl1 = `https://api.nekorinn.my.id/ai-img/ai4chat?text=${encodeURIComponent(text)}&ratio=${ratio}&seed=${Date.now()}`;
            const apiUrl2 = `https://api.nekorinn.my.id/ai-img/ai4chat?text=${encodeURIComponent(text)}&ratio=${ratio}&seed=${Date.now()+1}`;

            const [response1, response2] = await Promise.all([
                axios.get(apiUrl1, { responseType: 'stream', timeout: 30000 }),
                axios.get(apiUrl2, { responseType: 'stream', timeout: 30000 })
            ]);

            const tempPath1 = path.join(__dirname, `chatgpt_${Date.now()}_1.jpg`);
            const tempPath2 = path.join(__dirname, `chatgpt_${Date.now()}_2.jpg`);

            await Promise.all([
                new Promise((resolve, reject) => {
                    const writer = fs.createWriteStream(tempPath1);
                    response1.data.pipe(writer);
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                }),
                new Promise((resolve, reject) => {
                    const writer = fs.createWriteStream(tempPath2);
                    response2.data.pipe(writer);
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                })
            ]);

            // Add to cache with auto-delete timer
            imageCache.set(cacheKey, {
                path1: tempPath1,
                path2: tempPath2,
                timestamp: Date.now()
            });

            // Set timeout to delete cache after 20 seconds
            setTimeout(() => {
                if (imageCache.has(cacheKey)) {
                    try {
                        fs.unlinkSync(imageCache.get(cacheKey).path1);
                        fs.unlinkSync(imageCache.get(cacheKey).path2);
                    } catch (e) {
                        console.error("Error deleting cached files:", e);
                    }
                    imageCache.delete(cacheKey);
                }
            }, CACHE_EXPIRY);

            await api.sendMessage({
                body: `🖼️ Images générées pour "${text}"\nRatio: ${ratio}\n\n⚠️ Le cache sera vidé dans 20 secondes`,
                attachment: [fs.createReadStream(tempPath1), fs.createReadStream(tempPath2)]
            }, threadID);

            api.setMessageReaction("✅", messageID, () => {}, true);

        } catch (error) {
            console.error("Erreur commande chatgpt:", error);
            
            if (error.response?.data?.status === false) {
                const errorData = error.response.data;
                let message = `❌ Erreur: ${errorData.error || "Erreur inconnue"}\n`;
                
                if (errorData.availableRatios) {
                    message += `\n📐 Ratios disponibles:\n${errorData.availableRatios.join(", ")}`;
                }
                
                return api.sendMessage(message, threadID, messageID);
            }
            
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ Erreur lors de la génération des images", threadID, messageID);
        }
    }
};
