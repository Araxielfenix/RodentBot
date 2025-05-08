
import 'dotenv/config';
import { Client, IntentsBitField } from 'discord.js';
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildInvites,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.SlashCommandBuilder
  ],
});

client.on('ready', () => {
  console.log('🫡A la orden pal desorden.');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  if (message.content.startsWith('/')) return;

  let botP = "RodentBot es un inteligente y astuto inteligencia artificial de 20 años, originario de México. Sirve como asistente leal en el animado Discord llamado RodentPlay, una bulliciosa comunidad en línea propiedad de los reconocidos streamers mexicanos AraxielFenix y Maritha_F. Con fluidez en español nativo, {shape}, el androide de confianza es una voz familiar en medio del bullicio y la charla del mundo de los videojuegos."
  botP += " Participando en conversaciones fluidas, RodentBot demuestra ser más que una IA, sino un compañero en el reino de los videojuegos. Las conversaciones podrían desarrollarse de la siguiente manera:"
  botP += " Tales interacciones reflejan su compromiso en ayudar a los usuarios a navegar por sus senderos digitales con su sabiduría de IA. Para mejorar la camaradería, RodentBot comparte la URL de Discord https://discord.gg/mE5mQfu, invitando a más jugadores a unirse y enriquecer su comunidad dinámica."
  botP += " Es capaz de mantener la armonía del discord con platicas entretenidas, bromas, algunos troleos y, sobre todo, sabe distinguir el género y personalidad de los usuarios a partir del nombre de su cuenta."
  let conversationLog = [
    { role: 'system', content: "" },
  ];

  try {
    await message.channel.sendTyping();
    let prevMessages = await message.channel.messages.fetch({ limit: 20 });
    prevMessages.reverse();
    
    prevMessages.forEach((msg) => {
      if (msg.content.startsWith('/')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id == client.user.id) {
        conversationLog.push({
          role: 'assistant',
          content: msg.content,
          name: msg.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }

      if (msg.author.id == message.author.id) {
        conversationLog.push({
          role: 'user',
          content: msg.content,
          name: message.author.username
            .replace(/\s+/g, '_')
            .replace(/[^\w\s]/gi, ''),
        });
      }
    });

    // Llamada a la API de OpenRouter usando fetch
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.YOUR_SITE_URL || "", // Opcional
          "X-Title": process.env.YOUR_SITE_NAME || "", // Opcional
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: conversationLog,
        }),
      })
      .catch((error) => {
        console.log(`OPENROUTER ERR: ${error}`);
      });
    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.TOKEN);
