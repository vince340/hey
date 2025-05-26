const fs = require('fs');
const axios = require('axios');
const path = require('path');

module.exports = {
    name: "google",
    usePrefix: false,
    author: "aesther",
    usage: "𝗚𝗢𝗢𝗚𝗟𝗘 <recherche> [nombre d'images]",
    description: "Récupère des images depuis l'API Pinterest de David Cyril",
    async execute({ api, event, args }) {
        const { threadID, messageID } = event;

        if (!args[0]) {
            return api.sendMessage("🔍 (ex: 𝗚𝗢𝗢𝗚𝗟𝗘 chat 5)", threadID, messageID);
        }

        // Gestion du nombre d'images (1-20 par défaut)
        let count = 5;
        const lastArg = args[args.length - 1];
        if (!isNaN(lastArg)) {
            count = Math.min(20, Math.max(1, parseInt(lastArg)));
            args.pop();
        }

        const searchQuery = args.join(" ");

        try {
            api.setMessageReaction("🔎", messageID, () => {}, true);

            // Appel à l'API
            const apiUrl = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(searchQuery)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });

            if (!data.success || !data.results || data.results.length === 0) {
                return api.sendMessage("❌ Aucun résultat trouvé ou erreur de l'API", threadID, messageID);
            }

            const images = data.results.slice(0, count);
            const tempFiles = [];
            const attachments = [];

            // Téléchargement de toutes les images en parallèle
            await Promise.all(images.map(async (imageUrl, i) => {
                try {
                    const tempPath = path.join(__dirname, `google_${i}.jpg`);
                    tempFiles.push(tempPath);

                    const response = await axios({
                        url: imageUrl,
                        responseType: 'stream',
                        timeout: 15000
                    });

                    await new Promise((resolve, reject) => {
                        response.data.pipe(fs.createWriteStream(tempPath))
                            .on('finish', resolve)
                            .on('error', reject);
                    });

                    attachments.push(fs.createReadStream(tempPath));
                } catch (error) {
                    console.error(`Erreur avec l'image ${i+1}:`, error);
                }
            }));

            if (attachments.length === 0) {
                return api.sendMessage("❌ Aucune image n'a pu être téléchargée", threadID, messageID);
            }

            // Envoi de toutes les images en une seule fois
            await api.sendMessage({
                body: `📌 𝗥𝗘𝗦𝗨𝗧𝗔𝗧 : \n\n"${searchQuery}" (${attachments.length} images)`,
                attachment: attachments
            }, threadID);

            // Nettoyage des fichiers temporaires
            tempFiles.forEach(file => {
                try {
                    fs.unlinkSync(file);
                } catch (err) {
                    console.error(`Erreur suppression ${file}:`, err);
                }
            });

            api.setMessageReaction("💯", messageID, () => {}, true);

        } catch (error) {
            console.error('Erreur principale:', error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ Erreur lors de la connexion à l'API", threadID, messageID);
        }
    }
};
