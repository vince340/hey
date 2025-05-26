const axios = require('axios');

module.exports = {
    name: "hentai",
    usePrefix: false,
    author:"aesther", 
    description: "Envoie une image waifu aléatoire",
    async execute({ api, event }) {
        const { threadID, messageID } = event;

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // Appel à l'API waifu
            const { data } = await axios.get('https://api.nekorinn.my.id/waifuim/hentai');
            
            if (!data || !data.url) {
                return api.sendMessage(
                    "❌ Impossible de récupérer l'image waifu",
                    threadID, messageID
                );
            }

            api.sendMessage({
                body: "🫠 𝗛𝗘𝗡𝗧𝗔𝗜 🔞",
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
