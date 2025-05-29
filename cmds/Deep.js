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
            await api.setMessageReaction("⏳", messageID, () => {}, true);
            const prompt = args.join(" ");

            // Appel à l'API qui retourne les images
            const apiUrl = `https://api.nekorinn.my.id/ai-img/netwrck-img?text=${encodeURIComponent(prompt)}`;
            
            const response = await axios.get(apiUrl, { 
                timeout: 30000,
                validateStatus: status => status === 200
            });
            
            // Vérification de la réponse de l'API
            if (!response.data?.status || !Array.isArray(response.data.result) || response.data.result.length === 0) {
                await api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ Aucune image n'a pu être générée.", threadID, messageID);
            }

            const imageUrls = response.data.result.slice(0, 10); // Limite à 10 images max
            const attachments = [];
            const tempFiles = [];

            // Téléchargement des images en parallèle
            await Promise.all(imageUrls.map(async (imageUrl, i) => {
                try {
                    const tempPath = path.join(__dirname, `temp_img_${Date.now()}_${i}.png`);
                    tempFiles.push(tempPath);
                    
                    const response = await axios({
                        url: imageUrl,
                        method: "GET",
                        responseType: "stream",
                        timeout: 30000
                    });

                    const writer = fs.createWriteStream(tempPath);
                    response.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on("finish", resolve);
                        writer.on("error", reject);
                    });

                    attachments.push(fs.createReadStream(tempPath));
                } catch (imageError) {
                    console.error(`Erreur avec l'image ${i}:`, imageError.message);
                }
            }));

            if (attachments.length > 0) {
                await api.sendMessage({
                    body: `🖼️ 𝗥𝗘𝗦𝗨𝗟𝗧𝗦 彡: "${prompt}"\n${attachments.length} image(s) générée(s)`,
                    attachment: attachments
                }, threadID, () => {
                    // Nettoyage des fichiers temporaires après envoi
                    tempFiles.forEach(file => {
                        try {
                            if (fs.existsSync(file)) fs.unlinkSync(file);
                        } catch (cleanError) {
                            console.error("Erreur de nettoyage:", cleanError.message);
                        }
                    });
                });
                
                await api.setMessageReaction("🎉", messageID, () => {}, true);
            } else {
                await api.setMessageReaction("❌", messageID, () => {}, true);
                await api.sendMessage("⚠️ Aucune image n'a pu être téléchargée.", threadID, messageID);
            }

        } catch (error) {
            console.error("❌ Erreur:", error.message);
            await api.setMessageReaction("❌", messageID, () => {}, true);
            await api.sendMessage("⚠️ Une erreur est survenue lors de la génération des images.", threadID, messageID);
        }
    },
};
