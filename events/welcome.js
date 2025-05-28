module.exports = {
    name: "event",
    version: "3.0",
    author: "aesther",
    description: "Gère les événements de groupe avec messages de bienvenue/départ et vidéos d'accueil",

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

// Liste des vidéos d'accueil
const welcomeVideos = [
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

async function handleNewMembers({ api, event }) {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const botID = api.getCurrentUserID();
    const newUsers = event.logMessageData.addedParticipants;

    for (const user of newUsers) {
        const userID = user.userFbId;
        const userName = user.fullName || "Utilisateur";

        // Message pour les nouveaux membres
        if (userID !== botID) {
            const mentions = [
                { tag: `@${userName}`, id: userID },
                { tag: "@Admin", id: "100066731134942" }
            ];

            const welcomeMessages = [
                `✨ Bienvenue @${userName} dans le groupe !`,
                `👋 Salut @${userName}, content de te voir ici !`,
                `🌟 @${userName} a rejoint l'aventure !`
            ];

            const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

            await api.sendMessage({
                body: randomMessage,
                mentions
            }, event.threadID);
        }
        // Comportement spécial quand c'est le bot qui est ajouté
        else {
            await api.changeNickname("[📑] ᗩEᔕTᕼEᖇ", event.threadID, botID);
            
            // Envoi d'un message texte
            await api.sendMessage(
                "Merci de m'avoir ajouté ! Je suis prêt à vous aider. Tapez /help pour voir mes commandes.", 
                event.threadID
            );
            
            // Envoi aléatoire d'une vidéo d'accueil
            try {
                const randomVideo = welcomeVideos[Math.floor(Math.random() * welcomeVideos.length)];
                await api.sendMessage({
                    attachment: await global.utils.getStreamFromURL(randomVideo),
                    body: "🎬 𝗔𝗘𝗦𝗧𝗛𝗘𝗥 🎬\n(⁎⁍̴̀﹃ ⁍̴́⁎)♡𝗔𝗘 : https://www.facebook.com/Thea.Starliness\n(๑·`▱´·๑)𝗧𝗛𝗘𝗔 : https://www.facebook.com/thegoddess.aesther"
                }, event.threadID);
            } catch (videoError) {
                console.error("Erreur d'envoi de vidéo:", videoError);
                await api.sendMessage(
                    "Je voulais vous envoyer une vidéo d'accueil mais ça n'a pas fonctionné 😢", 
                    event.threadID
                );
            }
        }
    }
}

async function handleLeaveMembers({ api, event }) {
    const userID = event.logMessageData.leftParticipantFbId;
    
    try {
        const userInfo = await api.getUserInfo(userID);
        const userName = userInfo[userID]?.name || "Un membre";

        const goodbyeMessages = [
            `😢 ${userName} nous a quittés... À bientôt !`,
            `👋 ${userName} a quitté le groupe. Bonne continuation !`,
            `🚪 ${userName} est parti. On espère te revoir bientôt !`
        ];

        const randomMessage = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
        await api.sendMessage(randomMessage, event.threadID);
    } catch (error) {
        console.error("Erreur lors du traitement du départ:", error);
        await api.sendMessage("Un membre a quitté le groupe.", event.threadID);
    }
}
