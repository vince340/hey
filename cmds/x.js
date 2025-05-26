const fs = require("fs");

module.exports = {
    name: "notification",
    usePrefix: false,
    usage: "notify <message to announce>",
    version: "1.0",
    cooldown: 5,
    author: "aesther", 
    admin: true,

    execute: async ({ api, event, args, ownerUid }) => {
        if (!ownerUid || event.senderID !== ownerUid) {
            return api.sendMessage("❌ (๑·`▱´·๑) u aren't THEA\n\nFuck u ‼️‼️", event.threadID);
        }

        const message = args.join(" ");
        if (!message.trim()) {
            return api.sendMessage("⚠️ ๑·̑◡･̑๑ Write Something ", event.threadID);
        }

        try {
            const allThreads = await api.getThreadList(100, null, ["INBOX"]);
            const groupThreads = allThreads.filter(t => t.isGroup && !t.isArchived);
            
            if (groupThreads.length === 0) {
                return api.sendMessage("ℹ️ No active group threads found.", event.threadID);
            }

            let sentCount = 0;
            const failedThreads = [];
            
            // Send messages sequentially to avoid rate limiting
            for (const thread of groupThreads) {
                try {
                    await api.sendMessage(
                        `[📑] 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡\n\n✏️[${message}]\n\n꒰ঌ(⃔ ⌯' '⌯)⃕໒꒱`, 
                        thread.threadID
                    );
                    sentCount++;
                } catch (err) {
                    console.error(`❌ Failed to send to ${thread.name || thread.threadID}:`, err.message);
                    failedThreads.push(thread.threadID);
                    // Optional: add delay after failure
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                // Small delay between sends to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            let report = `✅ Announcement sent to ${sentCount}/${groupThreads.length} group(s).`;
            if (failedThreads.length > 0) {
                report += `\n❌ Failed to send to ${failedThreads.length} group(s).`;
                // Optional: log failed thread IDs
                report += `\nFailed IDs: ${failedThreads.join(', ')}`;
            }
            
            return api.sendMessage(report, event.threadID);
            
        } catch (error) {
            console.error("Error in notification command:", error);
            return api.sendMessage("❌ An error occurred while processing the notification command.", event.threadID);
        }
    }
};
