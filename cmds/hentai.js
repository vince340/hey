const fs = require("fs");
const axios = require("axios");
const path = require("path");

// Objet pour stocker les états d'activation par thread
const hentaiAutoStatus = {};

module.exports = {
    name: "hentai",
    usePrefix: false,
    usage: "hentai [on/off] ou hentai [prompt]",
    version: "1.0",
    admin: false,
    author: "aesther", 
    cooldown: 10,

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;

        // Gestion de l'activation/désactivation automatique
        if (args[0] && (args[0].toLowerCase() === 'on' || args[0].toLowerCase() === 'off')) {
            if (args[0].toLowerCase() === 'on') {
                hentaiAutoStatus[threadID] = true;
                startAutoHentai(api, threadID);
                return api.sendMessage("✅ Mode automatique activé - Hentai envoyé toutes les 30 minutes", threadID);
            } else {
                hentaiAutoStatus[threadID] = false;
                return api.sendMessage("❌ Mode automatique désactivé", threadID);
            }
        }

        // Si pas d'arguments ou demande d'aide
        if (!args[0]) {
            return api.sendMessage(
                "🔞 𝗛𝗘𝗡𝗧𝗔𝗜 -----🔞\n" +
                "Usage:\n" +
                "- hentai [prompt] : Génère une image hentai\n" +
                "- hentai on : Active l'envoi automatique toutes les 30 min\n" +
                "- hentai off : Désactive l'envoi automatique",
                threadID, 
                messageID
            );
        }

        // Fonction normale de génération d'hentai
        const prompt = args.join(" ");
        const apiUrl = `https://api.nekorinn.my.id/waifuim/hentai`;
        const filePath = path.join(__dirname, "poli-image.jpg");

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            const response = await axios({
                url: apiUrl,
                method: "GET",
                responseType: "stream"
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on("finish", () => {
                api.setMessageReaction("🔞", messageID, () => {}, true);

                const msg = {
                    body: `🥵𝗛𝗘𝗡𝗧𝗔𝗜 𝗣𝗜𝗖𝗦🥵 ${prompt}`,
                    attachment: fs.createReadStream(filePath),
                };

                api.sendMessage(msg, threadID, (err) => {
                    if (err) {
                        console.error("❌ Error sending image:", err);
                        api.sendMessage("⚠️ Failed to send image.", threadID);
                    }

                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
                    });
                });
            });

            writer.on("error", (err) => {
                console.error("❌ Error downloading image:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Failed to download image.", threadID, messageID);
            });

        } catch (error) {
            console.error("❌ API Error:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ An error occurred while generating the image.", threadID, messageID);
        }
    },
};

// Fonction pour l'envoi automatique
function startAutoHentai(api, threadID) {
    if (hentaiAutoStatus[threadID]) {
        // Première exécution immédiate
        sendRandomHentai(api, threadID);
        
        // Puis toutes les 30 minutes (1800000 ms)
        const interval = setInterval(() => {
            if (hentaiAutoStatus[threadID]) {
                sendRandomHentai(api, threadID);
            } else {
                clearInterval(interval);
            }
        }, 1800000);
    }
}

async function sendRandomHentai(api, threadID) {
    const apiUrl = `https://api.nekorinn.my.id/waifuim/hentai`;
    const filePath = path.join(__dirname, "auto-hentai.jpg");

    try {
        const response = await axios({
            url: apiUrl,
            method: "GET",
            responseType: "stream"
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on("finish", () => {
            const msg = {
                body: "🥵 𝗛𝗘𝗡𝗧𝗔𝗜 𝗔𝗨𝗧𝗢𝗠𝗔𝗧𝗜𝗤𝗨𝗘 🥵 (toutes les 30 minutes)",
                attachment: fs.createReadStream(filePath),
            };

            api.sendMessage(msg, threadID, (err) => {
                if (err) {
                    console.error("❌ Error sending auto hentai:", err);
                }
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("❌ Error deleting auto hentai file:", unlinkErr);
                });
            });
        });

        writer.on("error", (err) => {
            console.error("❌ Error downloading auto hentai:", err);
        });

    } catch (error) {
        console.error("❌ API Error in auto hentai:", error);
    }
}
