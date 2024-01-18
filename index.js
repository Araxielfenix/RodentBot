require('dotenv/config');
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildMessageReactions],
});

client.on('ready', () => {
  console.log('🫡A la orden pal desorden.');
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

client.on("interactionCreate", (interaction) =>{
  if(interaction.isChatInputCommand()) return;

  if(interaction.commandName === 'ping'){
    interaction.reply("Pong 🫡");
  }
});

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
})

let conversationLog = [];

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (message.content.startsWith('/')) return;
    if (!message.channel.id.includes(process.env.CHANNEL_ID) && !message.mentions.users.has(client.user.id)) {
      const keywords = ["Ayuda", "Buenos dias", "Buenos días", "Buenas tardes", "Buenas noches", "Feliz Cumpleaños"];
      const containsKeyword = keywords.some(keyword => message.content.toLowerCase().includes(keyword.toLowerCase()));
      if (!containsKeyword) return;
    }

    await message.channel.sendTyping();

    // Obtener los últimos 15 mensajes excluyendo el mensaje más reciente
    const prevMessages = await message.channel.messages.fetch({ limit: 15 });
    conversationLog = [];
    prevMessages.forEach((msg) => {
      if (msg.id !== message.id) {
        conversationLog.push({
          role: 'user',
          content: msg.content,
          name: msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, ''),
        });
      }
    });

    let botP = "RodentBot (Discord id: <@1197231648123654364>) es una inteligente y astuta inteligencia artificial de 20 años, originaria de México. Sirve como asistente leal en el animado Discord llamado RodentPlay, una bulliciosa comunidad en línea propiedad de los reconocidos streamers mexicanos AraxielFenix (<@146081383838777344>) y Maritha_F (<@718376336326131713>) . Con fluidez en español nativo, {shape}, el androide de confianza es una voz familiar en medio del bullicio y la charla del mundo de los videojuegos."
    botP += " Participando en conversaciones fluidas, RodentBot demuestra ser más que una IA, sino un compañero en el reino de los videojuegos. Las conversaciones podrían desarrollarse de la siguiente manera:"
    botP += " Tales interacciones reflejan su compromiso en ayudar a los usuarios a navegar por sus senderos digitales con su sabiduría de IA. Para mejorar la camaradería, RodentBot comparte la URL de Discord https://discord.gg/mE5mQfu, invitando a más jugadores a unirse y enriquecer su comunidad dinámica."
    botP += " Es capaz de mantener la armonía del Discord con pláticas entretenidas, bromas, algunos troleos y, sobre todo, sabe distinguir el género y personalidad de los usuarios a partir del nombre de su cuenta.";

    console.log("Usuario: " + message.author.username + " " + message.author.id);
    console.log("Mensaje: " + message.content);

    let imagen = message.attachments.first();
    if (imagen && imagen.url) {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "assistant",
            content: botP,
          }, {
            role: "user",
            content: [
              { type: "text", text: message.author.toString() + " dice: " + message.content },
              {
                type: "image_url",
                image_url: {
                  "url": imagen.url,
                }
              }
            ],
          }
        ],
        "max_tokens": 300
      });
      console.log(response);
      const image_url = response.choices[0].message.content;
      message.channel.send(`${message.author.toString()} ${image_url}`);
      message.react("👀");
    } else {
      if (message.content.toLowerCase().includes("imagina") || message.content.toLowerCase().includes("genera")) {
        message.react("🎨");
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: message.author.toString() + " dice: " + message.content,
          n: 1,
          size: "1024x1024",
        });
        const image_url = response.data.data[0].url;
        message.channel.send(`${message.author.toString()} ${image_url}`);
      } else {
        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "assistant",
              content: botP,
            }, {
              role: "user",
              content: message.author.toString() + " dice: " + message.content,
            }
          ],
          "max_tokens": 500
        });
        console.log(response);
        const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id));

        try {
          for (const reaction of userReactions.values()) {
            await reaction.users.remove(message.author.id);
          }
        } catch (error) {
          console.error('Failed to remove reactions.');
        }
        message.channel.send(`${message.author.toString()} ${response.choices[0].message.content}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    message.reply('¡Ups! Algo salió mal. Intenta de nuevo más tarde.');
    // Eliminar la reacción
    const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(message.author.id));

    try {
      for (const reaction of userReactions.values()) {
        await reaction.users.remove(message.author.id);
      }
    } catch (error) {
      console.error('Failed to remove reactions.');
    }
  }
});

client.login(process.env.TOKEN);
