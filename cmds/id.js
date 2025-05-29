const https = require("https");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "id",
    usePrefix: false,
    usage: "id [@mention]",
    version: "1.1",
    description: "Fetch the Facebook User ID (UID) of a mentioned user or yourself and show their profile picture.",
    admin: false,
    cooldown: 10,

    execute: async ({ api, event }) => {
        const { threadID, messageID, senderID, mentions } = event;

        let uid;
        let userName;

        if (Object.keys(mentions).length > 0) {
            uid = Object.keys(mentions)[0];
            userName = mentions[uid].replace("@", "");
        } else {
            uid = senderID;
            userName = "You";
        }

        const imageUrl = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
        const imagePath = path.join(__dirname, `tmp_${uid}.jpg`);

        // Download the profile picture
        const file = fs.createWriteStream(imagePath);
        https.get(imageUrl, (response) => {
            response.pipe(file);
            file.on("finish", () => {
                file.close(() => {
                    api.sendMessage(
                        {
                            body: `🔍 Facebook UID for ${userName}: ${uid}`,
                            attachment: fs.createReadStream(imagePath),
                        },
                        threadID,
                        () => {
                            fs.unlinkSync(imagePath); // Clean up after sending
                        },
                        messageID
                    );
                });
            });
        }).on("error", (err) => {
            fs.unlinkSync(imagePath);
            api.sendMessage(`❌ Failed to fetch profile picture. UID: ${uid}`, threadID, messageID);
        });
    },
};
