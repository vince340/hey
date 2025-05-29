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

            // 🎥 Liste des vidéos (ajoutez toutes vos URLs)
            const videos = [
                			"https://i.imgur.com/JnmXyO3.mp4",
										"https://i.imgur.com/Qudb0Vl.mp4",
										"https://i.imgur.com/N3wIadu.mp4",
										"https://i.imgur.com/X7lugs3.mp4",
										"https://i.imgur.com/6b61HGs.mp4",
										"https://i.imgur.com/EPzjIbt.mp4",
										"https://i.imgur.com/WWGiRvB.mp4",
										"https://i.imgur.com/20QmmsT.mp4",
										"https://i.imgur.com/nN28Eea.mp4",
										"https://i.imgur.com/fknQ3Ut.mp4",
										"https://i.imgur.com/yXZJ4A9.mp4",
										"https://i.imgur.com/GnF9Fdw.mp4",
										"https://i.imgur.com/B86BX8T.mp4",
										"https://i.imgur.com/kZCBjkz.mp4",
										"https://i.imgur.com/id5Rv7O.mp4",
										"https://i.imgur.com/aWIyVpN.mp4",
										"https://i.imgur.com/aFIwl8X.mp4",
										"https://i.imgur.com/SJ60dUB.mp4",
										"https://i.imgur.com/ySu69zS.mp4",
										"https://i.imgur.com/mAmwCe6.mp4",
										"https://i.imgur.com/Sbztqx2.mp4",
										"https://i.imgur.com/s2d0BIK.mp4",
										"https://i.imgur.com/rWRfAAZ.mp4",
										"https://i.imgur.com/dYLBspd.mp4",
										"https://i.imgur.com/HCv8Pfs.mp4",
										"https://i.imgur.com/jdVLoxo.mp4",
										"https://i.imgur.com/hX3Znez.mp4",
										"https://i.imgur.com/cispiyh.mp4",
										"https://i.imgur.com/ApOSepp.mp4",
										"https://i.imgur.com/lFoNnZZ.mp4",
										"https://i.imgur.com/qDsEv1Q.mp4",
										"https://i.imgur.com/NjWUgW8.mp4",
										"https://i.imgur.com/ViP4uvu.mp4",
										"https://i.imgur.com/bim2U8C.mp4",
										"https://i.imgur.com/YzlGSlm.mp4",
										"https://i.imgur.com/HZpxU7h.mp4",
										"https://i.imgur.com/exTO3J4.mp4",
										"https://i.imgur.com/Xf6HVcA.mp4",
										"https://i.imgur.com/9iOci5S.mp4",
										"https://i.imgur.com/6w5tnvs.mp4",
										"https://i.imgur.com/1L0DMtl.mp4",
										"https://i.imgur.com/7wcQ8eW.mp4",
										"https://i.imgur.com/3MBTpM8.mp4",
										"https://i.imgur.com/8h1Vgum.mp4",
										"https://i.imgur.com/CTcsUZk.mp4",
										"https://i.imgur.com/e505Ko2.mp4",
"https://i.imgur.com/3umJ6NL.mp4"
            ];

            // ✨ Message stylisé (comme demandé)
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

            // 🎬 Sélection aléatoire d'une vidéo
            const randomVideo = videos[Math.floor(Math.random() * videos.length)];

            // 📤 Envoi du message stylisé
            await api.sendMessage({
                body: styledMessage
            }, threadID);

            // ⏳ Téléchargement de la vidéo
            const tempPath = path.join(__dirname, `owner_video_${Date.now()}.mp4`);
            const writer = fs.createWriteStream(tempPath);

            const videoRes = await axios({
                url: randomVideo,
                method: "GET",
                responseType: "stream",
                timeout: 60000 // 60s max
            });

            videoRes.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", () => {
                    fs.unlinkSync(tempPath); // Suppression si erreur
                    reject();
                });
            });

            // 🎥 Envoi de la vidéo avec un message stylisé
            await api.sendMessage({
                body: "🎬 𝗩𝗜𝗗𝗘𝗢 𝗢𝗙 𝗧𝗛𝗘 𝗤𝗨𝗘𝗘𝗡 👑✨",
                attachment: fs.createReadStream(tempPath)
            }, threadID);

            // 🧹 Nettoyage du fichier temporaire
            fs.unlinkSync(tempPath);

        } catch (error) {
            console.error("⚠️ Erreur dans la commande owner :", error);
            api.sendMessage("❌ 𝗘𝗥𝗥𝗢𝗥 | La vidéo n'a pas pu être envoyée.", threadID, messageID);
        }
    },
};
