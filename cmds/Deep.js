const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "Deep",
    usePrefix: false,
    usage: "Deep prompt",
    version: "3",
    author: "aesther", 
    admin: false,
    cooldown: 5,

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;

        if (!args[0]) {
            return api.sendMessage("Veuillez fournir un prompt pour générer les images", threadID, messageID);
        }

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // Appel à l'API qui retourne les images
            const apiUrl = `https://api.nekorinn.my.id/ai-img/netwrck-img?text=${encodeURIComponent(args.join(" "))}`;
            
            const response = await axios.get(apiUrl, { timeout: 10000 });
            
            // Vérification de la réponse de l'API
            if (!response.data || !response.data.status || !response.data.result || response.data.result.length === 0) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ Aucune image n'a pu être générée.", threadID, messageID);
            }

            const imageUrls = response.data.result;
            const attachments = [];

            // Téléchargement des images
            for (let i = 0; i < imageUrls.length; i++) {
                try {
                    const imageUrl = imageUrls[i];
                    const tempPath = path.join(__dirname, `temp_img_${i}.png`);
                    const writer = fs.createWriteStream(tempPath);
                    
                    const imageRes = await axios({
                        url: imageUrl,
                        method: "GET",
                        responseType: "stream",
                        timeout: 15000
                    });

                    imageRes.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on("finish", resolve);
                        writer.on("error", reject);
                    });

                    attachments.push(fs.createReadStream(tempPath));
                } catch (imageError) {
                    console.error(`Erreur avec l'image ${i}:`, imageError);
                }
            }

            if (attachments.length > 0) {
                await api.sendMessage({
                    body: `🖼️ 𝗥𝗘𝗦𝗨𝗟𝗧𝗦 彡: "${args.join(" ")}"\n${attachments.length} images disponibles`,
                    attachment: attachments
                }, threadID);
                
                // Nettoyage des fichiers temporaires
                for (let i = 0; i < attachments.length; i++) {
                    try {
                        const tempPath = path.join(__dirname, `temp_img_${i}.png`);
                        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                    } catch (cleanError) {
                        console.error("Erreur de nettoyage:", cleanError);
                    }
                }
                
                api.setMessageReaction("🎉", messageID, () => {}, true);
            } else {
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Aucune image n'a pu être téléchargée.", threadID, messageID);
            }

        } catch (error) {
            console.error("❌ Erreur:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ Une erreur est survenue lors de la génération des images.", threadID, messageID);
        }
    },
};
