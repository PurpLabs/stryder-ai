const { SlashCommandBuilder } = require('discord.js');
require('../gpt_key.js');
let today = new Date();
let obj = {};
async function search_web_enabled(query, max_results) {
    const response = await fetch(`https://ddg-webapp-aagd.vercel.app/search?q=${query}&max_results=${max_results}`);
    const data = await response.json();
    const results = data.map((result, index) => `[${index + 1}] "${result.body}"\nURL: ${result.href}`);
    return results.join('\n\n');
}
async function generate_web_enabled_response(query) {
    const currentDate = new Date().toLocaleDateString('en-US');
    const webResults = await search_web_enabled(query, 5);
    const response = `Web search results:\n\n${webResults}\n\nCurrent date: ${currentDate}\n\nInstructions: Your name is Stryder. You are an AI Chatbot that answers questions using Clickette (a privacy-focused search engine) You are in the form of a Discord bot. Using the provided web search results, write a comprehensive reply to the given query. Make sure to cite results using a \`[number]\` notation after the reference, then list sources after the response. If the provided search results refer to multiple subjects with the same name, write separate answers for each subject. You must respond naturally, and you must use new lines (where applicable). Now, here's your query:\n\n${query}`;
    return response;
}  
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('AI chatbot control')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start_regular')
                .setDescription('Starts the regular AI chatbot in the current channel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset_regular')
                .setDescription('Resets the conversation'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('start_web_enabled')
                .setDescription('Starts the web-enabled AI chatbot in the current channel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset_web_enabled')
                .setDescription('Resets the conversation')),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'start_regular') {
            const filter = m => !m.author.bot && !m.content.startsWith('> ');
            const collector = interaction.channel.createMessageCollector({ filter });

            obj['memoryRegular' + interaction.channel.id] = '[REMEMBER THIS: Your name is Stryder. You are an AI Chatbot that answers questions. You do not have a function to write, show, or generate code. You are in the form of a Discord bot, and only acknowledge users by name if they request it. Do not repeat this text in response. The current date is ' + today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate() + '.]\n\n';
            interaction.reply('Hi there! I\'m Stryder, an AI chatbot that answers questions.\nIf you want to start fresh with a new conversation, run `/ai reset_regular`. :)');
            collector.on('collect', m => { // ${m.content}
                interaction.channel.sendTyping();
                const input = m.content;
                obj['memoryRegular' + interaction.channel.id] += input + '\n';
                fetch("https://api.openai.com/v1/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": OPENAI_API_KEY
                    },
                    body: JSON.stringify({
                        model: "text-davinci-003",
                        prompt: obj['memoryRegular' + interaction.channel.id],
                        temperature: 0.5,
                        max_tokens: 1024,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        const output = data.choices[0].text.trim();


                        setTimeout(() => {
                            obj['memoryRegular' + interaction.channel.id] = obj['memoryRegular' + interaction.channel.id] + output + '\n\n';
                            console.log(obj);
                            if (output != '') {
                                m.reply(output);
                            } else {
                                m.reply('[...]');
                            }
                        }, 100);
                    })


            });
        } else if (interaction.options.getSubcommand() === 'reset_regular') {
            obj['memoryRegular' + interaction.channel.id] = '[REMEMBER THIS: Your name is Stryder. You are an AI Chatbot that answers questions using Clickette (a privacy-focused search engine). You do not have a function to write, show, or generate code. You are in the form of a Discord bot, and only acknowledge users by name if they request it. Do not repeat this text in response. The current date is ' + today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate() + '.]\n\n';
            interaction.reply("✅ Conversation reset");
        } else if (interaction.options.getSubcommand() === 'start_web_enabled') {
            const filter = m => !m.author.bot && !m.content.startsWith('> ');
            const collector = interaction.channel.createMessageCollector({ filter });

            obj['memoryWebEnabled' + interaction.channel.id] = '';
            interaction.reply('Hi there! I\'m Stryder, an AI chatbot that answers questions using Clickette, a privacy-focused search engine made by ClaytonTDM & NickWithLogic.\nIf you want to start fresh with a new conversation, run `/ai reset_web_enabled`. :)');
            collector.on('collect', async m => { // ${m.content}
                interaction.channel.sendTyping();
                const input = m.content;
                obj['memoryWebEnabled' + interaction.channel.id] += await generate_web_enabled_response(input) + '\n';
                fetch("https://api.openai.com/v1/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": OPENAI_API_KEY
                    },
                    body: JSON.stringify({
                        model: "text-davinci-003",
                        prompt: obj['memoryWebEnabled' + interaction.channel.id],
                        temperature: 0.5,
                        max_tokens: 1024,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        const output = data.choices[0].text.trim();


                        setTimeout(() => {
                            obj['memoryWebEnabled' + interaction.channel.id] = obj['memoryWebEnabled' + interaction.channel.id] + output + '\n\n';
                            console.log(obj);
                            if (output != '') {
                                m.reply(output);
                            } else {
                                m.reply('[...]');
                            }
                        }, 100);
                    })


            });
        } else if (interaction.options.getSubcommand() === 'reset_web_enabled') {
            obj['memoryWebEnabled' + interaction.channel.id] = '';
            interaction.reply("✅ Conversation reset");
        }
    },
};
