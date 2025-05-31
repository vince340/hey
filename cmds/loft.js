const axios = require("axios");

module.exports = {
    name: "loft",
    usePrefix: false,
    usage: "faire parler loft",
    version: "1.2",
    author: "LOVELY",
    cooldown: 10,
    admin: true,

    shortDescription: 'Loft AI',
    longDescription: {
        vi: 'Chat với simsimi',
        en: 'Chat with Loft AI'
    },
    category: 'chat-bot',
    guide: {
        vi: '   {pn} [on | off]: bật/tắt simsimi'
            + '\n'
            + '\n   {pn} <word>: chat nhanh với simsimi'
            + '\n   Ví dụ:\n    {pn} hi',
        en: '   {pn} [on | off]: Turn Loft AI on/off'
            + '\n'
            + '\n   {pn} <message>: Chat with Loft AI'
            + '\n   Example:\n    {pn} Hello there'
    },

    langs: {
        vi: {
            turnedOn: 'Bật simsimi thành công!',
            turnedOff: 'Tắt simsimi thành công!',
            chatting: 'Đang chat với simsimi...',
            error: 'Simsimi đang bận, bạn hãy thử lại sau'
        },
        en: {
            turnedOn: '✅ | Loft AI activated successfully!',
            turnedOff: '✅ | Loft AI deactivated successfully!',
            chatting: '💬 | Chatting with Loft AI...',
            error: '😰 | Oops! Loft AI is unavailable right now. Please try again later.',
            apiError: '⚠️ | Failed to get response from Loft AI'
        }
    },

    onStart: async function ({ args, threadsData, message, event, getLang }) {
        if (args[0] === 'on' || args[0] === 'off') {
            await threadsData.set(event.threadID, args[0] === "on", "settings.simsimi");
            return message.reply(args[0] === "on" ? getLang("turnedOn") : getLang("turnedOff"));
        }
        
        if (!args[0]) {
            return message.reply(getLang("guide"));
        }

        const yourMessage = args.join(" ");
        try {
            const responseMessage = await getMessage(yourMessage);
            return message.reply(responseMessage);
        } catch (err) {
            console.error('Loft AI Error:', err);
            return message.reply(getLang("error"));
        }
    },

    onChat: async ({ args, message, threadsData, event, isUserCallCommand, getLang }) => {
        if (args.length > 1 && !isUserCallCommand && await threadsData.get(event.threadID, "settings.simsimi")) {
            try {
                const responseMessage = await getMessage(args.join(" "));
                return message.reply(responseMessage);
            } catch (err) {
                console.error('Loft AI Chat Error:', err);
                return message.reply(getLang("error"));
            }
        }
    }
};

async function getMessage(yourMessage) {
    try {
        const res = await axios.post(
            'https://api.simsimi.vn/v1/simtalk',
            new URLSearchParams({
                'text': yourMessage,
                'lc': 'fr'  // Changé en français pour correspondre à votre demande
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                timeout: 10000  // Timeout après 10 secondes
            }
        );

        if (res.status !== 200 || !res.data.message) {
            throw new Error('Invalid API response');
        }

        return res.data.message;
    } catch (error) {
        console.error('API Error:', error);
        throw new Error('Failed to get response from Loft AI');
    }
}
