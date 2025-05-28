const emojiSets = {
    standard: ["😀", "😍", "😂", "🔥", "❤️", "👍", "🎉", "👀", "🤔", "🙏"],
    animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🦁", "🐮"],
    food: ["🍎", "🍕", "🍔", "🍟", "🍦", "🍩", "🍪", "🎂", "🍫", "🍿"],
    nature: ["🌞", "🌻", "🌈", "🌊", "🍂", "❄️", "🌸", "⚡", "🌙", "🌟"]
};

const config = {
    reactionChance: 0.7, // 70% de chance de réagir à un message
    maxReactions: 3,      // Maximum d'emojis par message
    cooldown: 1000,       // Délai minimal entre réactions (ms)
    excludedThreads: []    // IDs des conversations à ignorer
};

function getRandomEmoji() {
    const set = Object.keys(emojiSets)[Math.floor(Math.random() * Object.keys(emojiSets).length)];
    const emojis = emojiSets[set];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

module.exports = {
    name: "randomreact",
    author: "VotreNom",
    version: "2.0",
    description: "Réagit aléatoirement aux messages avec des emojis variés",
    
    onEvent: async ({ api, event }) => {
        // Vérifications initiales
        if (
            !event.messageID || 
            !event.threadID || 
            event.senderID === api.getCurrentUserID() || 
            config.excludedThreads.includes(event.threadID) ||
            Math.random() > config.reactionChance
        ) return;

        try {
            const reactionCount = Math.floor(Math.random() * config.maxReactions) + 1;
            
            for (let i = 0; i < reactionCount; i++) {
                await api.setMessageReaction(
                    getRandomEmoji(),
                    event.messageID,
                    event.threadID,
                    (err) => { if (err) console.error("Erreur de réaction:", err) }
                );
                
                if (i < reactionCount - 1) {
                    await new Promise(resolve => setTimeout(resolve, config.cooldown));
                }
            }
        } catch (error) {
            console.error("[RANDOMREACT ERROR]", error);
        }
    },
    
    // Fonction pour configurer la commande
    config: (newConfig) => {
        Object.assign(config, newConfig);
        console.log("Configuration randomreact mise à jour:", config);
    }
};
