const axios = require("axios");

const fonts = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
    j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
    s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
    J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
    S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
};

const stickers = [
  "254594546003916", "254595732670464", "254593389337365",
  "37117808696806", "254597316003639", "254598806003490",
  "254596219337082", "2379537642070973", "2379545095403561",
  "2379551785402892", "254597059336998"
];

const RP = "Répond bien a cette question et ajoute des Emoji convenables";

function applyFont(text) {
    return text.split('').map(char => fonts[char] || char).join('');
}

function splitMessage(text, maxLength = 2000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.substring(i, i + maxLength));
    }
    return chunks;
}

module.exports = {
    name: "ai",
    usePrefix: false,
    usage: "ai <question>",
    version: "1.4",
    author: "Aesther",
    admin: false,
    cooldown: 2,

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;
        const prompt = args.join(" ").trim();
        
        if (!prompt) {
            const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
            await api.sendMessage({ sticker: randomSticker }, threadID);
            return;
        }
        
        console.log(`[AI CMD] Prompt: ${prompt}`);
        const loadingMsg = await api.sendMessage(applyFont("(⁎⁍̴̀﹃ ⁍̴́⁎)♡"), threadID);
            
        try {
            const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(RP + " : " + prompt)}`;
            console.log(`[AI CMD] Calling API: ${apiUrl}`);
            
            const { data } = await axios.get(apiUrl, { timeout: 15000 });
            console.log("[AI CMD] API Response:", data);
            
            const response = data?.result || data?.description || data?.reponse || data;
            
            if (response) {
                await api.unsendMessage(loadingMsg.messageID);
                const styledResponse = applyFont(response.toString());
                
                // Gestion des longs messages
                const messageChunks = splitMessage(styledResponse);
                
                for (const chunk of messageChunks) {
                    await api.sendMessage(chunk + (chunk === messageChunks[messageChunks.length - 1] ? " 🪐" : ""), threadID);
                }
                
                api.setMessageReaction("🪐", messageID, () => {}, true);
                return;
            }
            
            await api.sendMessage(applyFont("⚠️ L'API n'a pas retourné de réponse valide."), threadID);
        } catch (error) {
            console.error("[AI CMD] Erreur:", error);
            await api.unsendMessage(loadingMsg.messageID);
            
            const errorMessage = error.code === 'ECONNABORTED' 
                ? "❌ Le serveur met trop de temps à répondre. Veuillez réessayer plus tard." 
                : "❌ Erreur de connexion avec l'API.";
                
            await api.sendMessage(applyFont(errorMessage), threadID);
        }
    }
};
