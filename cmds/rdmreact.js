module.exports = {
    name: "rdmreact",
    usePrefix: true,
    usage: "réagit à tous les messages avec un emoji similaire ou aléatoire",
    version: "1.4",
    author: "aesther", 
    description: "Réagit automatiquement aux messages avec des emojis",

    onStart: async function({ api, event }) {
        // Cette fonction est nécessaire pour que la commande soit reconnue par le système
    },

    onChat: async function({ api, event }) {
        if (!event.body || !event.messageID) return;

        // Liste d'emojis aléatoires améliorée
        const randomEmojis = [
            '😘', '🥺', '😀', '😾', '😛', '😽', '😸', '♥️', '😋', '✨', 
            '❄️', '👅', '😒', '😊', '💚', '🚀', '🤪', '😙', '🥴', '🤐', 
            '🙁', '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', 
            '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', 
            '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', 
            '🤫', '🤔', '🤐', '🤨', '😐', '😑', '🤹', '🎭', '🩰', '🎨', 
            '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🎸', 
            '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🧸', 
            '🪅', '🪆', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄', '🎴', '🎭', 
            '🖼️', '🎨', '🧵', '🧶', '🪡', '🪢', '👓', '🕶️', '🥽', '🥼', 
            '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', 
            '🥻', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🛍️', 
            '🎒', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰', '👢', '👑', 
            '👒', '🎩', '🎓', '🧢', '🪖', '⛑️', '💄', '💍', '💼', '🩴'
        ];

        // Regex améliorée pour détecter les emojis
        const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const existingEmojis = event.body.match(emojiRegex);

        let selectedEmoji;
        
        // Si le message contient des emojis, on en sélectionne un au hasard
        if (existingEmojis && existingEmojis.length > 0) {
            selectedEmoji = existingEmojis[Math.floor(Math.random() * existingEmojis.length)];
        } else {
            // Sinon, on prend un emoji aléatoire dans notre liste
            selectedEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
        }

        // Envoi de la réaction avec gestion d'erreur
        try {
            await api.setMessageReaction(selectedEmoji, event.messageID, (err) => {
                if (err) {
                    console.error("Erreur lors de l'ajout de la réaction:", err);
                    // Tentative avec un emoji de secours si la première échoue
                    const fallbackEmoji = '❤️';
                    api.setMessageReaction(fallbackEmoji, event.messageID, () => {}, true);
                }
            }, true);
        } catch (error) {
            console.error("Erreur fatale de réaction:", error);
        }
    }
};
