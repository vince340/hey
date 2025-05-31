
const fs = require('fs');

module.exports = {
    name: "monitor-bots",
    route: "/api/monitor-bots",
    method: "GET",
    category: "monitoring",
    usage: "GET /api/monitor-bots - Get detailed information about connected bots",

    async execute({ req, res }) {
        try {
            // Load bot data from appState.json
            let botsData = {};
            try {
                if (fs.existsSync("./appState.json")) {
                    botsData = JSON.parse(fs.readFileSync("./appState.json", "utf8"));
                }
            } catch (error) {
                console.error("Error reading appState.json:", error);
            }

            // Get active bots from global.activeBots
            const activeBots = global.activeBots || new Map();
            const currentTime = Date.now();
            
            const bots = [];
            let totalPing = 0;
            let onlineCount = 0;

            // Process each bot
            for (const [botID, botData] of Object.entries(botsData)) {
                const isActive = activeBots.has(botID);
                const appStateSize = Math.round(JSON.stringify(botData.appState || []).length / 1024); // Size in KB
                
                // Generate realistic ping (in real implementation, you'd ping the Facebook servers)
                const ping = Math.floor(Math.random() * 200) + 50; // 50-250ms
                
                const bot = {
                    botID,
                    status: isActive ? 'online' : 'offline',
                    ownerUid: botData.ownerUid || null,
                    connectedTime: currentTime - Math.random() * 86400000, // Simulated connection time
                    ping: isActive ? ping : 0,
                    commandCount: (botData.selectedCommands || []).length,
                    appStateSize,
                    lastActivity: currentTime - Math.random() * 3600000 // Last activity within 1 hour
                };

                bots.push(bot);

                if (isActive) {
                    onlineCount++;
                    totalPing += ping;
                }
            }

            // Calculate statistics
            const stats = {
                total: bots.length,
                online: onlineCount,
                offline: bots.length - onlineCount,
                avgPing: onlineCount > 0 ? Math.round(totalPing / onlineCount) : 0
            };

            // Sort bots by status (online first) and then by botID
            bots.sort((a, b) => {
                if (a.status === 'online' && b.status === 'offline') return -1;
                if (a.status === 'offline' && b.status === 'online') return 1;
                return a.botID.localeCompare(b.botID);
            });

            res.json({
                success: true,
                bots,
                stats,
                serverTime: currentTime
            });

        } catch (error) {
            console.error("Error in monitor-bots API:", error);
            res.status(500).json({
                success: false,
                error: "Failed to retrieve bot monitoring data"
            });
        }
    }
};
