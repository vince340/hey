const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "owner",
    usePrefix: false,
    usage: "owner",
    version: "1.0",
    author: "Aesther",
    admin: false,
    cooldown: 5,

    execute: async ({ api, event }) => {
        const { threadID, messageID } = event;

        try {
            // 🔮 Informations stylisées de l'owner
            const ownerInfo = {
                name: '𝘼𝙉𝙅𝘼/Sanchokuin/𝚃𝚑𝚎𝚊',
                gender: '𝘎𝘪𝘳𝘭',
                hobby: '𝘱𝘦𝘳𝘧𝘦𝘤𝘵𝘪𝘰𝘯𝘯𝘪𝘴𝘵𝘦/𝘵𝘦𝘢𝘤𝘩𝘦𝘳/𝘙𝘰𝘭𝘦𝘱𝘢𝘺𝘦𝘳/𝘿𝙊𝙈𝙄𝙉𝘼𝙏𝙄𝙊𝙉😌',
                relationship: '𝙈𝘼𝙍𝙍𝙄𝙀𝘿',
                facebookLink: 'www.facebook.com/mitama.sama\nwww.facebook.com/Goddess-anais-Aesther',
                bio: '𝙄 𝘮 𝘵𝘩𝘦 𝘽𝙀𝙎𝙏🤣🌷'
            };

            // 🎥 Liste des vidéos (corrigé les URLs mal formatées)
            const videos = [
                "https://i.imgur.com/JnmXyO3.mp4",
                "https://i.imgur.com/Qudb0Vl.mp4",
                "https://i.imgur.com/N3wIadu.mp4",
                // ... (autres URLs valides)
                "https://i.imgur.com/3umJ6NL.mp4"
            ].filter(url => url.startsWith("https://")); // Filtre les URLs valides

            // ✨ Message stylisé
            const styledMessage = `
𝗼𝘄𝗻𝗲𝗿 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻:
⊰🌟⊱┈────╌❊
(◍•ᴗ•◍)𝗡𝗔𝗠𝗘 : ${ownerInfo.name}
⊰🌟⊱┈────╌❊
♀️𝗚𝗘𝗡𝗗𝗘𝗥♂️: ${ownerInfo.gender}
⊰🌟⊱┈────╌❊
🏓𝗛𝗢𝗕𝗕𝗬⛹️‍♂️: ${ownerInfo.hobby}
⊰🌟⊱┈────╌❊
𝗥𝗘𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣💞: ${ownerInfo.relationship}
⊰🌟⊱┈────╌❊
➤🔑 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞🔗: ${ownerInfo.facebookLink}
⊰🌟⊱┈────╌❊
      ◈ 𝗦𝗧𝗔𝗧𝗨𝗦 ◈: ${ownerInfo.bio} 🇲🇬
            `;

            // 📤 Envoi du message textuel d'abord
            await api.sendMessage(styledMessage, threadID);

            // 🎬 Sélection aléatoire d'une vidéo valide
            const randomVideo = videos[Math.floor(Math.random() * videos.length)];
            if (!randomVideo) {
                throw new Error("Aucune URL vidéo valide disponible");
            }

            // ⏳ Téléchargement de la vidéo
            const tempPath = path.join(__dirname, `owner_video_${Date.now()}.mp4`);
            const writer = fs.createWriteStream(tempPath);

            const videoRes = await axios({
                url: randomVideo,
                method: "GET",
                responseType: "stream",
                timeout: 60000
            });

            videoRes.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", (error) => {
                    fs.unlinkSync(tempPath); // Nettoyage en cas d'erreur
                    reject(new Error(`Erreur d'écriture: ${error.message}`));
                });
            });

            // Vérification que le fichier existe et a une taille valide
            const stats = fs.statSync(tempPath);
            if (stats.size < 1024) { // Moins de 1KB = probablement invalide
                fs.unlinkSync(tempPath);
                throw new Error("Vidéo trop petite, probablement corrompue");
            }

            // 🎥 Envoi de la vidéo
            await api.sendMessage({
                body: "🎬 𝗩𝗜𝗗𝗘𝗢 𝗢𝗙 𝗧𝗛𝗘 𝗤𝗨𝗘𝗘𝗡 👑✨",
                attachment: fs.createReadStream(tempPath)
            }, threadID);

            // 🧹 Nettoyage du fichier temporaire
            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error("⚠️ Erreur dans la commande owner:", error.message);
            await api.sendMessage({
                body: "❌ 𝗘𝗥𝗥𝗢𝗥 | La vidéo n'a pas pu être envoyée.\n" + 
                      `Raison: ${error.message}\n` +
                      "Essayez à nouveau ou contactez le développeur.",
                mentions: [{
                    tag: "Thea Starliness",
                    id: "100066731134942" // Remplacez par l'ID réel
                }]
            }, threadID, messageID);
        }
    },
};
