const axios = require("axios");

module.exports = {
    name: "loft",
    usePrefix: false,
    usage: "faire parler loft",
    version: "2.0",
    author: "aesther",
    cooldown: 10,
    admin: true,

    shortDescription: 'Loft AI',
    longDescription: {
        en: 'Chat with Loft AI'
    },
    category: 'chat-bot',
    guide: {
        en: '   {pn} <message>: chat with Loft AI\n   Example: {pn} Hello'
    },

    langs: {
        en: {
            turnedOn: '✅ | Loft AI activé avec succès!',
            turnedOff: '✅ | Loft AI désactivé avec succès!',
            error: '😰 - Désolé, je ne peux pas répondre pour le moment'
        }
    },

    execute: async function ({ args, message, event, getLang }) {
        // Gestion ON/OFF
        if (args[0] === 'on' || args[0] === 'off') {
            const isOn = args[0] === "on";
            global.loftAIEnabled = global.loftAIEnabled || {};
            global.loftAIEnabled[event.threadID] = isOn;
            
            return message.reply(getLang(isOn ? "turnedOn" : "turnedOff"));
        }

        // Chat normal
        if (args.length > 0) {
            try {
                const yourMessage = args.join(" ");
                const response = await axios.post(
                    'https://api.simsimi.vn/v1/simtalk',
                    new URLSearchParams({
                        'text': yourMessage,
                        'lc': 'fr'  // Langue française
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );

                if (response.data && response.data.message) {
                    return message.reply(response.data.message);
                } else {
                    throw new Error("Réponse invalide de l'API");
                }
            } catch (err) {
                console.error("Erreur Loft AI:", err);
                return message.reply(getLang("error"));
            }
        } else {
            return message.reply("Veuillez écrire un message après la commande. Ex: /loft Bonjour");
        }
    },

    onChat: async function ({ args, message, event, getLang }) {
        if (!global.loftAIEnabled?.[event.threadID]) return;

        if (args.length > 0 && !this.checkCommandPrefix(args[0])) {
            try {
                const response = await axios.post(
                    'https://api.simsimi.vn/v1/simtalk',
                    new URLSearchParams({
                        'text': args.join(" "),
                        'lc': 'fr'
                    })
                );
                
                if (response.data?.message) {
                    await message.reply(response.data.message);
                }
            } catch (err) {
                console.error("Erreur onChat Loft:", err);
            }
        }
    }
};
