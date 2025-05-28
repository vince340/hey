module.exports = {
    name: "randomreact",

    async execute({ api, event }) {
        // Liste des réactions possibles (emojis)
        const possibleReactions = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "😍", "🤔", "🎉", "🤯", "👏", "🙏", "🔥", "💩", "🍆"];

        try {
            // Vérifie si c'est un message et pas le bot qui parle
            if (event.type === "message" && event.senderID !== api.getCurrentUserID()) {
                // Choisir une réaction aléatoire
                const randomReaction = possibleReactions[Math.floor(Math.random() * possibleReactions.length)];
                
                // Réagir instantanément
                await api.setMessageReaction(randomReaction, event.messageID, (err) => {
                    if (err) console.error("❌ Erreur de réaction:", err);
                });
            }
        } catch (err) {
            console.error("❌ Erreur dans randomreact:", err);
        }
    }
};
