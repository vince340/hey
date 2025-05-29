const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "event",
    version: "3.1",
    author: "aesther",
    description: "Gestion complète des événements de groupe",

    async execute({ api, event }) {
        try {
            if (event.logMessageType === "log:subscribe") {
                await handleNewMembers({ api, event });
            } 
            else if (event.logMessageType === "log:unsubscribe") {
                await handleLeaveMembers({ api, event });
            }
        } catch (err) {
            console.error("❌ Erreur dans l'événement de groupe:", err);
        }
    }
};

const welcomeVideos = [
    "https://i.imgur.com/JnmXyO3.mp4",
    "https://i.imgur.com/Qudb0Vl.mp4",
    "https://i.imgur.com/N3wIadu.mp4",
    "https://i.imgur.com/X7lugs3.mp4",
    "https://i.imgur.com/6b61HGs.mp4",
    "https://i.imgur.com/EPzjIbt.mp4",
    "https://i.imgur.com/WWGiRvB.mp4",
    "https://i.imgur.com/20QmmsT.mp4"
];

async function downloadVideo(url) {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });
        
        const tempPath = path.join(__dirname, 'temp_video.mp4');
        const writer = fs.createWriteStream(tempPath);
        
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(tempPath));
            writer.on('error', reject);
        });
    } catch (err) {
        console.error('Erreur de téléchargement:', err);
        return null;
    }
}

async function handleNewMembers({ api, event }) {
    const botID = api.getCurrentUserID();
    const newUsers = event.logMessageData.addedParticipants;

    for (const user of newUsers) {
        const userID = user.userFbId;
        const userName = user.fullName || "Utilisateur";

        if (userID !== botID) {
            // Gestion des nouveaux membres normaux
            const mentions = [{ tag: `@${userName}`, id: userID }];
            const welcomeMsg = `(⁎⁍̴̀﹃ ⁍̴́⁎)♡ @${userName} 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 🩷`;
            
            await api.sendMessage({
                body: welcomeMsg,
                mentions
            }, event.threadID);
        } else {
            // Comportement spécial pour le bot
            await api.changeNickname("🟡𝘼𝙀𝙎𝙏𝙃𝙀𝙍🟢[๑·̑◡･̑๑]", event.threadID, botID);
            
            // Message texte d'introduction
            await api.sendMessage({
                body: "꒰ঌ(⃔ ⌯' '⌯)⃕໒꒱........ᐕ\n\n𝗕𝗢𝗧 :🟡𝘼𝙀𝙎𝙏𝙃𝙀𝙍🟢[๑·̑◡･̑๑]\n∅ NO PREFIX BOT\n∅ ADMIN Thea\n𝗣𝗔𝗚𝗘 : https://www.facebook.com/Anime.other"
            }, event.threadID);
            
            // Envoi de la vidéo avec une nouvelle méthode plus fiable
            try {
                const randomVideo = welcomeVideos[Math.floor(Math.random() * welcomeVideos.length)];
                const videoPath = await downloadVideo(randomVideo);
                
                if (videoPath) {
                    await api.sendMessage({
                        attachment: fs.createReadStream(videoPath),
                        body: "🎬 Vidéo d'accueil spéciale pour vous !"
                    }, event.threadID);
                    
                    // Nettoyage du fichier temporaire
                    fs.unlink(videoPath, (err) => {
                        if (err) console.error('Erreur suppression vidéo:', err);
                    });
                } else {
                    await api.sendMessage("", event.threadID);
                }
            } catch (videoErr) {
                console.error('Erreur vidéo:', videoErr);
                await api.sendMessage("", event.threadID);
            }
        }
    }
}

async function handleLeaveMembers({ api, event }) {
    const userID = event.logMessageData.leftParticipantFbId;
    
    try {
        const userInfo = await api.getUserInfo(userID);
        const userName = userInfo[userID]?.name || "Un membre";
        const goodbyeMsg = `(;ↀ⌓ↀ) ${userName} `;
        
        await api.sendMessage(goodbyeMsg, event.threadID);
    } catch (error) {
        console.error("Erreur départ:", error);
        await api.sendMessage("Un membre nous a quittés...", event.threadID);
    }
}
