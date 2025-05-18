const axios = require("axios");

module.exports = {
    name: "ai",
    usePrefix: false,
    usage: "ai <question>",
    version: "1.2",
    admin: false,
    cooldown: 2,

    execute: async ({ api, event, args }) => {
        const { threadID } = event;
        const prompt = args.join(" ");
        
        if (!prompt) return api.sendMessage("Veuillez poser une question.", threadID);

        try {
            const loadingMsg = await api.sendMessage("🔵⚪🔴.... ", threadID);
            const apiUrl = `https://sandipbaruwal.onrender.com/gemini?prompt=${encodeURIComponent(prompt)}`;
            
            const { data } = await axios.get(apiUrl);
            const response = data?.answer || data?.description || data?.reponse;
            
            if (response) {
                return api.sendMessage(`${response} 🪐`, threadID, loadingMsg.messageID);
            }
            
            return api.sendMessage("⚠️ Réponse vide de l'API.", threadID, loadingMsg.messageID);
        } catch (error) {
            console.error("Erreur Gemini:", error);
            return api.sendMessage("❌ Erreur API Gemini.", threadID);
        }
    }
};
