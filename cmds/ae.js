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

const RP = "Répond et ajoute des Emoji convenables";

function applyFont(text) {
    return text.split('').map(char => fonts[char] || char).join('');
}

module.exports = {
    name: "ai",
    usePrefix: false,
    usage: "ai <question>",
    version: "1.3",
    author:"Aesther", 
    admin: false,
    cooldown: 2,

    execute: async ({ api, event, args }) => {
        const { threadID } = event;
        const prompt = args.join(" ");
        
        if (!prompt) {
            const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
            await api.sendMessage({ sticker: randomSticker }, threadID);
            return;
        }
        
        const loadingMsg = await api.sendMessage(applyFont(""), threadID);
            
        try {
            const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(RP + " : " + prompt)}`;
            
            const { data } = await axios.get(apiUrl);
            const response = data?.result || data?.description || data?.reponse || data;
            
            if (response) {
                await api.unsendMessage(loadingMsg.messageID);
                const styledResponse = applyFont(response.toString());
                await api.sendMessage(`${styledResponse} 🪐`, threadID);
                api.setMessageReaction("🪐", event.messageID, () => {}, true);
                return;
            }
            
            await api.sendMessage(applyFont("⚠️ L'API n'a pas retourné de réponse valide."), threadID);
        } catch (error) {
            console.error("Erreur Gemini:", error);
            await api.sendMessage(applyFont("❌ Erreur de connexion avec l'API Gemini."), threadID);
        }
    }
};
