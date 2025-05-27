const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    name: "deep",
    usePrefix: false,
    usage: "deep [prompt]",
    version: "1.0",
    admin: false,
    author:"aesther", 
    cooldown: 10,

    execute: async ({ api, event, args }) => {
        const { threadID, messageID } = event;

        if (!args[0]) {
            return api.sendMessage("⚠️ 𝗣𝗥𝗢𝗠𝗣𝗧 ✖️✖️✖️.\nUsage: deep [prompt]", threadID, messageID);
        }

        const prompt = args.join(" ");
        const apiUrl = `https://api.nekorinn.my.id/ai-img/deep-img?text=${encodeURIComponent(prompt)}`;
        const filePath = path.join(__dirname, "poli-image.jpg");

        try {
            api.setMessageReaction("🌸", messageID, () => {}, true);

            const response = await axios({
                url: apiUrl,
                method: "GET",
                responseType: "stream"
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on("finish", () => {
                api.setMessageReaction("🌷", messageID, () => {}, true);

                const msg = {
                    body: `🛄 𝗣𝗥𝗢𝗠𝗣𝗧 : ${prompt}`,
                    attachment: fs.createReadStream(filePath),
                };

                api.sendMessage(msg, threadID, (err) => {
                    if (err) {
                        console.error("❌ Error sending image:", err);
                        api.sendMessage("⚠️ Failed to send image.", threadID);
                    }

                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
                    });
                });
            });

            writer.on("error", (err) => {
                console.error("❌ Error downloading image:", err);
                api.setMessageReaction("❌", messageID, () => {}, true);
                api.sendMessage("⚠️ Failed to download image.", threadID, messageID);
            });

        } catch (error) {
            console.error("❌ API Error:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            api.sendMessage("⚠️ An error occurred while generating the image.", threadID, messageID);
        }
    },
};
