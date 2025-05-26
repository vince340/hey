const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "waifu",
    usePrefix: false,
    usage: "waifu <catégorie>",
    author:"aesther", 
    description: "Envoie une image waifu de la catégorie demandée",
    async execute({ api, event, args }) {
        const { threadID, messageID } = event;

        // Liste complète des catégories valides
        const validCategories = [
            "genshin", "swimsuit", "schoolswimsuit", "white", "barefoot", 
            "touhou", "gamecg", "hololive", "uncensored", "sungglasses", 
            "glasses", "weapon", "shirtlift", "chain", "fingering", 
            "flatchest", "torncloth", "bondage", "demon", "pantypull", 
            "headdress", "headphone", "anusview", "shorts", "stokings", 
            "topless", "beach", "bunnygirl", "bunnyear", "vampire", 
            "nobra", "bikini", "whitehair", "blonde", "pinkhair", 
            "bed", "ponytail", "nude", "dress", "underwear", 
            "foxgirl", "uniform", "skirt", "breast", "twintail", 
            "spreadpussy", "seethrough", "breasthold", "fateseries", 
            "spreadlegs", "openshirt", "headband", "nipples", 
            "erectnipples", "greenhair", "wolfgirl", "catgirl"
        ];

        // Si pas d'arguments, montre les catégories disponibles
        if (!args[0]) {
            const categoriesChunked = [];
            for (let i = 0; i < validCategories.length; i += 10) {
                categoriesChunked.push(validCategories.slice(i, i + 10).join(", "));
            }
            
            let message = "🌸 Catégories waifu disponibles :\n";
            message += categoriesChunked.join("\n");
            message += "\n\nExemple : waifu bikini";
            
            return api.sendMessage(message, threadID, messageID);
        }

        const category = args[0].toLowerCase();

        // Vérifie si la catégorie est valide
        if (!validCategories.includes(category)) {
            return api.sendMessage(
                `❌ Catégorie "${category}" invalide. Utilisez "waifu" sans argument pour voir les catégories disponibles.`,
                threadID, 
                messageID
            );
        }

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // Appel à l'API waifu avec timeout
            const { data } = await axios.get(`https://apis.davidcyriltech.my.id/nsfw?category=${category}`, {
                timeout: 10000 // 10 secondes timeout
            });
            
            if (!data?.success || !data?.url) {
                throw new Error("Réponse API invalide");
            }

            // Vérification de l'URL
            if (!data.url.match(/^https?:\/\/.+\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
                throw new Error("URL d'image invalide");
            }

            // Envoi du message avec l'image
            await api.sendMessage({
                body: `🌸 Waifu ${category}`,
                attachment: await global.utils.getStreamFromURL(data.url)
            }, threadID, messageID);

            api.setMessageReaction("✅", messageID, () => {}, true);

        } catch (error) {
            console.error("Erreur waifu:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            
            let errorMessage = "⚠️ Erreur lors de la récupération de l'image waifu";
            if (error.response?.status === 404) {
                errorMessage = `❌ Catégorie "${category}" non trouvée sur le serveur`;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "⌛ Le serveur a mis trop de temps à répondre";
            }
            
            api.sendMessage(errorMessage, threadID, messageID);
        }
    }
};
