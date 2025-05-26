const axios = require('axios');

module.exports = {
    name: "waifu",
    usePrefix: false,
    usage: "waifu <catégorie>",
    description: "Envoie une image waifu de la catégorie demandée",
    async execute({ api, event, args }) {
        const { threadID, messageID } = event;

        // Si pas d'arguments, montre les catégories disponibles
        if (!args[0]) {
            const categories = [
                "genshin",
    "swimsuit",
    "schoolswimsuit",
    "white",
    "barefoot",
    "touhou",
    "gamecg",
    "hololive",
    "uncensored",
    "sungglasses",
    "glasses",
    "weapon",
    "shirtlift",
    "chain",
    "fingering",
    "flatchest",
    "torncloth",
    "bondage",
    "demon",
    "pantypull",
    "headdress",
    "headphone",
    "anusview",
    "shorts",
    "stokings",
    "topless",
    "beach",
    "bunnygirl",
    "bunnyear",
    "vampire",
    "nobra",
    "bikini",
    "whitehair",
    "blonde",
    "pinkhair",
    "bed",
    "ponytail",
    "nude",
    "dress",
    "underwear",
    "foxgirl",
    "uniform",
    "skirt",
    "breast",
    "twintail",
    "spreadpussy",
    "seethrough",
    "breasthold",
    "fateseries",
    "spreadlegs",
    "openshirt",
    "headband",
    "nipples",
    "erectnipples",
    "greenhair",
    "wolfgirl",
    "catgirl"
                // Ajoute d'autres catégories populaires ici
            ].join(", ");
            
            return api.sendMessage(
                `🌸 Catégories waifu disponibles :\n${categories}\n\nExemple : waifu bikini`,
                threadID, messageID
            );
        }

        const category = args[0].toLowerCase();

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // Appel à l'API waifu
            const { data } = await axios.get(`https://apis.davidcyriltech.my.id/nsfw?category=${category}`);
            
            if (!data.success || !data.url) {
                return api.sendMessage(
                    `❌ Catégorie "${category}" non trouvée. Utilisez "waifu" sans argument pour voir les catégories.`,
                    threadID, messageID
                );
            }

            api.sendMessage({
                body: `🌸 Waifu ${category}`,
                attachment: await global.utils.getStreamFromURL(data.url)
            }, threadID);

            api.setMessageReaction("✅", messageID, () => {}, true);

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ Erreur lors de la récupération de l'image waifu", threadID, messageID);
        }
    }
};
