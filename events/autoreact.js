module.exports = {
    name: "randomreact",
    
    async execute({ api, event }) {
        // Liste des réactions possibles (emojis Unicode)
        const possibleReactions = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "😍", "🤔", "🎉", "🤯", "👏", "🙏", "🔥", "💩", "🍆"];

        try {
            // Vérifications strictes avant réaction
            if (!event.messageID || 
                !api.setMessageReaction || 
                event.senderID === api.getCurrentUserID() || 
                event.type !== "message") {
                return;
            }

            // Sélection aléatoire robuste
            const randomIndex = Math.floor(Math.random() * possibleReactions.length);
            const randomReaction = possibleReactions[randomIndex];

            // Réaction avec timeout de sécurité
            await api.setMessageReaction(randomReaction, event.messageID, (err) => {
                if (err) {
                    console.error("Erreur de réaction:", {
                        error: err,
                        messageID: event.messageID,
                        reaction: randomReaction
                    });
                }
            });

        } catch (err) {
            console.error("Erreur globale dans randomreact:", {
                error: err,
                event: event
            });
        }
    }
};
