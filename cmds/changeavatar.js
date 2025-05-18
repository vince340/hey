const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    name: "changeavatar",
    usage: "changeavatar <image_url> OR reply to an image with 'changeavatar'",
    description: "Change the bot's profile picture using an image URL or a replied image.",
    version: "1.0",
    cooldown: 10,
    admin: true,

    execute: async ({ api, event, args }) => {
        const senderID = event.senderID;
        const threadID = event.threadID;

        // Owner UID protection (like leave.js)
        let ownerUID = null;
        try {
            const appState = JSON.parse(fs.readFileSync("appState.json", "utf8"));
            ownerUID = appState.ownerUid;
        } catch (e) {
            return api.sendMessage("❌ Failed to load owner UID from appState.json", threadID);
        }

        if (senderID !== ownerUID) {
            return api.sendMessage("❌ You are not authorized to use this command.", threadID);
        }

        let imageUrl;

        // If replying to a message with an image
        if (event.messageReply && event.messageReply.attachments.length > 0) {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type !== "photo") {
                return api.sendMessage("⚠️ Please reply to an image, not another file type.", threadID, event.messageID);
            }
            imageUrl = attachment.url;
        } else {
            if (args.length === 0) {
                return api.sendMessage("⚠️ Provide an image URL or reply to an image.\n📌 Usage: changeavatar <image_url>", threadID, event.messageID);
            }
            imageUrl = args[0];
        }

        try {
            const response = await axios.get(imageUrl, { responseType: "stream" });
            const imagePath = path.join(__dirname, "avatar.jpg");
            const writer = fs.createWriteStream(imagePath);
            response.data.pipe(writer);

            writer.on("finish", () => {
                const imageStream = fs.createReadStream(imagePath);

                api.changeAvatar(imageStream, "", null, (err) => {
                    fs.unlinkSync(imagePath); // delete temp file

                    if (err) {
                        console.error("❌ Error changing avatar:", err);
                        return api.sendMessage("❌ Failed to change the avatar.", threadID, event.messageID);
                    }

                    api.sendMessage("✅ Bot avatar changed successfully!", threadID, event.messageID);
                });
            });

            writer.on("error", (error) => {
                console.error("❌ Error saving image:", error);
                api.sendMessage("❌ Failed to save image.", threadID, event.messageID);
            });

        } catch (error) {
            console.error("❌ General error:", error);
            api.sendMessage("❌ An error occurred. Make sure the image is valid.", threadID, event.messageID);
        }
    }
};
