const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "pinterest",
    usePrefix: true,
    usage: "pinterest <recherche> [nombre d'images (1-10)]",
    version: "1.1",
    author:"aesther", 
    admin: false,
    cooldown: 10,

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;

        if (!args[0]) {
            return api.sendMessage("⚠️ Veuillez fournir un terme de recherche.\nExemple: pinterest naruto 5", threadID, messageID);
        }

        // Vérification du nombre d'images demandé
        let count = 5; // Valeur par défaut
        if (!isNaN(args[args.length - 1])) {
            const num = parseInt(args[args.length - 1]);
            if (num > 0 && num <= 10) {
                count = num;
                args.pop(); // Retire le nombre des arguments
            }
        }

        const searchQuery = args.join(" ");
        
        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // API Pinterest alternative
            const apiUrl = `https://api.pinterest.com/v3/pidgets/boards/${encodeURIComponent(searchQuery)}/pins/`;
            
            // Solution de repli si l'API principale ne fonctionne pas
            const fallbackApiUrl = `https://kaiz-apis.gleeze.com/api/pinterest?=${encodeURIComponent(searchQuery)}&apikey=2f858a4e-204d-47b1-829a-36147e539cbf&count=${count}`;

            let response;
            try {
                response = await axios.get(apiUrl, { timeout: 10000 });
            } catch (primaryError) {
                console.log("API principale échouée, utilisation de l'API de repli...");
                response = await axios.get(fallbackApiUrl, { timeout: 10000 });
            }

            // Traitement des différentes structures de réponse API
            let pins = [];
            if (response.data && response.data.data) {
                pins = response.data.data.pins || response.data.data || [];
            }

            if (!pins || pins.length === 0) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return api.sendMessage("⚠️ Aucune image trouvée pour cette recherche.", threadID, messageID);
            }

            // Limite le nombre d'images selon la demande
            pins = pins.slice(0, count);

            // Téléchargement et envoi des images
            const sentImages = [];
            for (let i = 0; i < pins.length; i++) {
                try {
                    const pin = pins[i];
                    const imageUrl = pin.images?.orig?.url || pin.image || pin;
                    
                    if (!imageUrl) continue;

                    const tempPath = path.join(__dirname, `temp_pin_${i}.jpg`);
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

                    await api.sendMessage({
                        body: i === 0 ? `📌 Résultats Pinterest pour: "${searchQuery}" (${i+1}/${pins.length})` : `(${i+1}/${pins.length})`,
                        attachment: fs.createReadStream(tempPath)
                    }, threadID);

                    sentImages.push(tempPath);
                    await new Promise(resolve => setTimeout(resolve, 500)); // Délai entre les images
                    
                } catch (imageError) {
                    console.error(`Erreur avec l'image ${i}:`, imageError);
                }
            }

            // Nettoyage des fichiers temporaires
            sentImages.forEach(file => {
                try {
                    if (fs.existsSync(file)) fs.unlinkSync(file);
                } catch (cleanError) {
                    console.error("Erreur de nettoyage:", cleanError);
                }
            });

            if (sentImages.length > 0) {
                api.setMessageReaction("✅", messageID, () => {}, true);
            } else {
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Aucune image n'a pu être téléchargée.", threadID, messageID);
            }

        } catch (error) {
            console.error("❌ Pinterest Error:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ Une erreur est survenue lors de la récupération des images Pinterest.", threadID, messageID);
        }
    },
};
