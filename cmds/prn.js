const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "prn",
    usePrefix: false,
    author:"aesther", 
    usage: "minivideo <recherche> [qualité=hq/lq]",
    description: "🔞 Envoie des mini-vidéos avec choix de qualité",
    cooldown: 15,

    async execute({ api, event, args }) {
        const { threadID, messageID } = event;

        if (!args[0]) {
            return api.sendMessage("📌 Usage: minivideo <thème> [hq=high quality/lq=low quality]", threadID);
        }

        // Détection de la qualité demandée
        let quality = 'hq'; // Par défaut en haute qualité
        const lastArg = args[args.length - 1].toLowerCase();
        
        if (lastArg === 'lq' || lastArg === 'hq') {
            quality = lastArg;
            args.pop(); // Retire l'argument qualité
        }

        const search = args.join(' ');

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // 1. Appel API
            const { data } = await axios.get(`https://your-video-api.com/search?q=${encodeURIComponent(search)}`);
            
            if (!data.status || !data.result) {
                return api.sendMessage("❌ Aucune vidéo trouvée", threadID);
            }

            const videoInfo = data.result;
            
            // Choix de la qualité
            const videoUrl = quality === 'hq' 
                ? videoInfo.download.high_quality 
                : videoInfo.download.low_quality;

            if (!videoUrl) {
                return api.sendMessage(`⚠️ La qualité ${quality.toUpperCase()} n'est pas disponible`, threadID);
            }

            // 2. Téléchargement temporaire
            const tempPath = path.join(__dirname, `minivideo_${Date.now()}.mp4`);
            const writer = fs.createWriteStream(tempPath);
            
            const response = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream',
                timeout: 30000
            });

            response.data.pipe(writer);

            // 3. Envoi avec les infos
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            await api.sendMessage({
                body: `🎬 ${videoInfo.title}\n⏱️ Durée: ${Math.floor(videoInfo.duration/60)}min\n📝 ${videoInfo.info}\n⚡ Qualité: ${quality.toUpperCase()}`,
                attachment: fs.createReadStream(tempPath)
            }, threadID);

            // Nettoyage
            fs.unlinkSync(tempPath);
            api.setMessageReaction("✅", messageID, () => {}, true);

        } catch (error) {
            console.error("Erreur minivideo:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ Erreur de téléchargement", threadID);
        }
    }
};
