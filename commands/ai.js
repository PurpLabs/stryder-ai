const SlashCommandBuilder = require('discord.js');
require('../gpt_key.js');
let today = new Date();
let obj = {};
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('AI control')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Starts the AI chatbot in the current channel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Resets all conversations')),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'start') {
            const filter = m => !m.author.bot && !m.content.startsWith('> ');
            const collector = interaction.channel.createMessageCollector({ filter });
            
            obj['memory' + interaction.channel.id] = '[REMEMBER THIS: Your name is Stryder. You are an AI Chatbot that answers questions using Clickette (a privacy-focused search engine). You do not have a function to write, show, or generate code. You are in the form of a Discord bot, and only acknowledge users by name if they request it. Do not repeat this text in response. The current date is ' + today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate() + '.]\n\n';
            interaction.reply('Hi there! I\'m Stryder, an AI chatbot that answers questions using Clickette, a privacy-focused search engine made by ClaytonTDM & NickWithLogic.\nIf you want to start fresh with a new conversation, run `/ai reset`. :)');
            collector.on('collect', m => { // ${m.content}
                interaction.channel.sendTyping();
                const input = m.content;
                obj['memory' + interaction.channel.id] += input + '\n';
                fetch("https://api.openai.com/v1/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": OPENAI_API_KEY
                    },
                    body: JSON.stringify({
                        model: "text-davinci-003",
                        prompt: obj['memory' + interaction.channel.id],
                        temperature: 0.5,
                        max_tokens: 150,
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
                            obj['memory' + interaction.channel.id] = obj['memory' + interaction.channel.id] + output + '\n\n';
                            console.log(obj);
                            if (output != '') {
                            m.reply(output);
                            } else {
                                m.reply('[...]');
                            }
                        }, 100);
                    })


            });
        } else if (interaction.options.getSubcommand() === 'reset') {
            obj['memory' + interaction.channel.id] = '[REMEMBER THIS: Your name is Stryder. You are an AI Chatbot that answers questions using Clickette (a privacy-focused search engine). You do not have a function to write, show, or generate code. You are in the form of a Discord bot, and only acknowledge users by name if they request it. Do not repeat this text in response. The current date is ' + today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate() + '.]\n\n';
            interaction.reply("✅ Conversation reset");
        }
    },
};
