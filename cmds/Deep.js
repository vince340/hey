const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "Deep",
    usePrefix: false,
    usage: "Deep [prompt]",
    version: "3.1",
    author: "aesther",
    admin: false,
    cooldown: 5,

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;

        if (!args[0]) {
            return api.sendMessage("❗ Veuillez fournir un prompt pour générer les images.", threadID, messageID);
        }

        const prompt = args.join(" ");
        const apiUrl = `https://api.nekorinn.my.id/ai-img/netwrck-img?text=${encodeURIComponent(prompt)}`;

        try {
            await api.setMessageReaction("⏳", messageID, () => {}, true);

            const response = await axios.get(apiUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 30000,
            });

            const results = response.data?.result;

            if (!Array.isArray(results) || results.length === 0) {
                await api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ Aucune image générée. Essaie un autre prompt.", threadID, messageID);
            }

            const imageUrls = results.slice(0, 10); // max 10 images
            const attachments = [];
            const tempPaths = [];

            for (let i = 0; i < imageUrls.length; i++) {
                const imageUrl = imageUrls[i];
                const tempPath = path.join(__dirname, `temp_${Date.now()}_${i}.jpg`);
                tempPaths.push(tempPath);

                try {
                    const imgResponse = await axios.get(imageUrl, {
                        responseType: "stream",
                        timeout: 30000,
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });

                    const writer = fs.createWriteStream(tempPath);
                    imgResponse.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on("finish", resolve);
                        writer.on("error", reject);
                    });

                    attachments.push(fs.createReadStream(tempPath));
                } catch (err) {
                    console.error(`❌ Erreur de téléchargement de l'image ${i}:`, err.message);
                }
            }

            if (attachments.length === 0) {
                await api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ Impossible de télécharger les images.", threadID, messageID);
            }

            await api.sendMessage({
                body: `🖼️ Résultats pour : "${prompt}"\n→ ${attachments.length} image(s) générée(s).`,
                attachment: attachments
            }, threadID, async () => {
                for (const tempFile of tempPaths) {
                    try {
                        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                    } catch (e) {
                        console.error("Erreur de suppression de fichier :", e.message);
                    }
                }
            });

            await api.setMessageReaction("✅", messageID, () => {}, true);

        } catch (err) {
            console.error("Erreur principale :", err.message);
            await api.setMessageReaction("❌", messageID, () => {}, true);
            await api.sendMessage("🚫 Une erreur est survenue lors de la génération des images.", threadID, messageID);
        }
    },
};
