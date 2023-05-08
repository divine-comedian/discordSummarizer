require('dotenv').config();
const { Client, Intents } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.MESSAGE_CONTENT, Intents.FLAGS.GUILD_MESSAGES
] });

const OPENAI_API_BASE_URL = "https://api.openai.com/v1/chat/completions"; // Update this line
const OPENAI_API_KEY= process.env.OPENAI_GPT3_5_API
const messageLimit = 50;


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.content === '!aisummarize20' && !message.author.bot) {
    try {
      const messages = await message.channel.messages.fetch({ limit: messageLimit });
      const messageContentArray = messages.map((msg) => `${msg.author.username}: ${msg.content}`);
      const messageContent = messageContentArray.reverse().join('\n');
      const summary = await fetchSummary(messageContent);
      await summary;
      console.log("this is the summary", summary)
      message.channel.send(`Here's the summary:\n${summary}`);
    } catch (error) {
      console.error(error);
      message.channel.send('An error occurred while fetching the summary.');
    }
  }
});

async function fetchSummary(text) {
    const axiosInstance = axios.create({
        baseURL: OPENAI_API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      });

  const response = await axiosInstance.post(OPENAI_API_BASE_URL, 
    {
        "model": "gpt-3.5-turbo",
        "messages": [
          {"role": "system", "content": `Your goal is to summarize the last ${messageLimit} messages in a specific discord channel. Do not include in your summary any messages that are bot commands or from bots, including MEE6.`},
          {"role": "user", "content": `Please summarize, with some detail, the following conversation:\n${text}`}
        ],
      }
    
    // JSON.stringify({
    //   prompt: `Please summarize the following conversation:\n${text}`,
    //   max_tokens: 100,
    //   n: 1,
    //   stop: null,
    //   temperature: 0.5,
    // }),
  );

  return response.data.choices[0].message.content;
}

client.on('ready', () => {
    console.log(`Ready for action! Logged in as ${client.user.tag}.`);
  });

client.login(process.env.DISCORD_BOT_TOKEN);


