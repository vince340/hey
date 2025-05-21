const fs = require("fs");

module.exports = {
    name: "callad",
    usePrefix: false,
    usage: "notify <message to announce>",
    version: "1.0",
    cooldown: 5,
    author:"aesther", 
    admin: true,

    execute: async ({ api, event, args, ownerUid }) => {
        if (!ownerUid || event.senderID !== ownerUid) {
            return api.sendMessage("❌ (๑·`▱´·๑) u aren't THEA\n\nFuck u ‼️‼️", event.threadID);
        }

        const message = args.join(" ");
        if (!message) {
            return api.sendMessage("⚠️ ๑·̑◡･̑๑ Write Something ", event.threadID);
        }

        const allThreads = await api.getThreadList(100, null, ["INBOX"]);
        const groupThreads = allThreads.filter(t => t.isGroup && !t.isArchived);

        let sentCount = 0;
        for (const thread of groupThreads) {
            try {
                await api.sendMessage(`[📑] 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡\n\n✏️[${message}]\n\n꒰ঌ(⃔ ⌯' '⌯)⃕໒꒱`, thread.threadID);
                sentCount++;
            } catch (err) {
                console.error(`❌ Failed to send to ${thread.threadID}:`, err.message);
            }
        }

        return api.sendMessage(`✅ Announcement sent to ${sentCount} group(s).`, event.threadID);
    }
};
