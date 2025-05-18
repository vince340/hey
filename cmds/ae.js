const axios = require('axios');

module.exports = {
    name: 'ai',
    usage: 'Interact with GPT-3.5 Turbo',
    cooldown: 1,
    version:"1",
    admin :"false", 
    usePrefix: false,
    execute: async (api, event, args) => {
        const input = args.join(' ');
        const uid = event.senderID;

        if (!input) {
            return api.sendMessage('Please enter a prompt.', event.threadID, event.messageID);
        }

        api.sendMessage('Processing your request...', event.threadID, event.messageID);

        try {
            const response = await axios.get(`https://sandipbaruwal.onrender.com/gemini?prompt=${encodeURIComponent(input)}`);
            const result = response.data.answer;

            if (!result) {
                throw new Error('No valid response received from the API.');
            }

            api.sendMessage(
                `${result} 🪐`,
                event.threadID,
                event.messageID
            );
        } catch (error) {
            api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
        }
    },
};
