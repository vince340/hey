const axios = require('axios');

const fonts = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
    j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
    s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
    J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
    S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
};

module.exports.config = {
    name: "ai",
    usePrefix: true,
    usage: "ai [question]",
    version: "1.3",
    credits: "Aester",
    cooldown: 5,
    hasPermission: 0,
    commandCategory: "ai"
};

module.exports.execute = async function({ api, event, args }) {
    try {
        const input = args.join(' ').trim();
        
        if (!input) {
            const defaultMessage = `🌸 | 𝗔𝗘𝗦𝗧𝗛𝗘𝗥 𝗔𝗜\n\n(≖ω≖)ω≖)`;
            return api.sendMessage(defaultMessage, event.threadID, event.messageID);
        }

        api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
        
        const prompt = `Réponds en français avec des emojis pertinents, sois précise et détaillée :\n\n${input}`;
        const apiUrl = `https://sandipbaruwal.onrender.com/gemini?prompt=${encodeURIComponent(prompt)}`;
        
        const { data } = await axios.get(apiUrl, { timeout: 30000 });
        
        if (!data?.answer) {
            throw new Error("Réponse API invalide");
        }

        let formattedResponse = data.data.answer.split('').map(char => fonts[char] || char).join('');
        formattedResponse = `${formattedResponse} 🪐`;
        
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        return api.sendMessage(formattedResponse, event.threadID);
        
    } catch (error) {
        console.error('Erreur:', error);
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        return api.sendMessage("❌ | Une erreur s'est produite. Veuillez réessayer plus tard.", event.threadID);
    }
};
