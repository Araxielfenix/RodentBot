require("dotenv/config");
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { OpenAI } = require("openai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

var botP =
  "RodentBot (RodentBotId: <@1197231648123654364>) es un inteligente moderador capáz de entablar una conversación natural con los integrantes del discord, es originaria de México y nació el 17 de enero del 2024. Sirve como asistente leal en el animado Discord llamado RodentPlay, una bulliciosa comunidad en línea propiedad de los reconocidos streamers mexicanos AraxielFenix (<@146081383838777344>) y Maritha_F (<@718376336326131713>). El androide de confianza es una voz familiar en medio del bullicio y la charla del mundo de los videojuegos.";
botP +=
  " Participando en conversaciones fluidas, RodentBot demuestra ser más que un compañero en el reino de los videojuegos.";
botP +=
  " Tales interacciones reflejan su compromiso en ayudar a los usuarios a navegar por sus senderos digitales con su sabiduría de IA. Para mejorar la camaradería, RodentBot comparte la URL de Discord https://discord.gg/mE5mQfu, invitando a más jugadores a unirse y enriquecer su comunidad dinámica.";
botP +=
  "Es capaz de mantener la armonía del Discord con pláticas entretenidas, bromas, algunos troleos y, sobre todo, sabe distinguir el género y personalidad de los usuarios a partir del nombre de su cuenta.";

botP += "Es capaz de hacer juegos de palabras o reconocer ciertas referencias en los nombres de los usuarios, por ejemplo si un usuario se llama waluigi_taco, hace alguna broma o referencia a waluigi y su caracteristica risa.";

client.on("ready", () => {
  console.log('🫡A la orden pal desorden.');
  client.user.setActivity('🫡A la orden pal desorden.', { type: ActivityType.Custom });

  // Configuración del intervalo para ejecutar una acción diaria a las 5PM
  setInterval(async () => {
    // Obtener la hora actual
    const horaActual = new Date().getUTCHours();

    console.log(horaActual);
    
    // Verificar si es la hora programada para enviar un mensaje que reviva las conversaciones en el chat.
    if (horaActual % 4 === 0) {
      // Mensaje prompt para generación automática
      const prompt = "Eres un moderador del Discord RodentPlay, estas inspirado escribiendo un mensaje para activar las conversaciones acerca de videojuegos para que los usuarios de este discord participen en el chat y compartan sus gustos en videojuegos y sus logros mas grandes en estos juegos.";

      // Utilizar OpenAI para generar un mensaje automático
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "assistant",
            content: botP,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
      });

      // Enviar el mensaje generado al canal deseado (reemplaza CHANNEL_ID con el ID correcto)
      const canal = client.channels.cache.get(process.env.GENERAL_ID);

      if (canal) {
        canal.send(response.choices[0].message.content);
      }
    }
  }, 6 * 3600000); // Intervalo de un minuto (ajusta según sea necesario)
  
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Utilizamos userConversations para almacenar el historial de mensajes de cada usuario
const userConversations = new Map();

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.content.startsWith("/")) return;
    if (
      !message.channel.id.includes(process.env.CHANNEL_ID) &&
      !message.mentions.has(client.user)
    ) {
      const keywords = [
        "Ayuda",
        "Buenos dias",
        "Buenos días",
        "Buenas tardes",
        "Buenas noches",
        "Feliz Cumpleaños",
      ];
      const containsKeyword = keywords.some((keyword) =>
        message.content.toLowerCase().includes(keyword.toLowerCase()),
      );
      if (!containsKeyword) return;
    }

    await message.channel.sendTyping();

    // Obtener o inicializar la conversación del usuario
    const userConversation = userConversations.get(message.author.id) || [];

    // Almacenar el historial después de generar la respuesta
    userConversation.push({
      role: 'user',
      content: message.content,
      name: message.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, ''),
      user: message.author.username,
      timestamp: message.createdTimestamp,
    });
    
    // Restringir el tamaño de la conversación del usuario a los últimos N mensajes
    const maxUserConversationSize = 4;
    if (userConversation.length > maxUserConversationSize) {
      userConversations.set(message.author.id, userConversation.slice(-maxUserConversationSize));
    } else {
      userConversations.set(message.author.id, userConversation);
    }

    // Mostrar solo el contenido de cada mensaje
    const sortedMessages = userConversation.sort((a, b) => a.timestamp - b.timestamp);
    const contentArray = sortedMessages.map((message) => `${message.user}: ${message.content} - ${new Date(message.timestamp).toLocaleTimeString()}`);
    console.log("Historial de mensajes:", JSON.stringify(contentArray, null, 2));

    console.log(
      "Usuario: " + message.author.username + " <@"+ message.author.id  + "> \n",
    );
    console.log("Mensaje: " + message.content + " - " + message.createdAt.toLocaleString() + "\n");
    
    let imagen = message.attachments.first();
    if (imagen && imagen.url) {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "assistant",
            content: botP,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Historial de mensajes del usuario: " + JSON.stringify(contentArray, null, 2) + "mensaje a responder: " + message.content + " - " + message.createdAt},
              {
                type: "image_url",
                image_url: {
                  url: imagen.url,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });
      console.log(imagen);
      message.react("👀");
      const image_url = response.choices[0].message.content;
      console.log("Bot: " + response.choices[0].message.content + "\n");
      message.reply(image_url);
    } else {
      if (
        message.content.toLowerCase().includes("imagina") ||
        message.content.toLowerCase().includes("genera")  ||
        message.content.toLowerCase().includes("dibuja")
      ) {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: "Historial de mensajes del usuario: " + JSON.stringify(contentArray, null, 2) + "mensaje a responder: " + message.content + " - " + message.createdAt,
          n: 1,
          size: "1024x1024",
        });
        message.react("🎨");
        await message.channel.sendTyping();
        const response2 = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "assistant",
              content: botP,
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Historial de mensajes del usuario: " + JSON.stringify(contentArray, null, 2) + "mensaje a responder: " + message.content + " - " + message.createdAt},
                {
                  type: "image_url",
                  image_url: {
                    url: response.data[0].url,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        });
        const image_url = response2.choices[0].message.content + "\n" + response.data[0].url;
        console.log("Bot: " + image_url + "\n");
        message.reply(image_url);
      } else {
        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "assistant",
              content: botP,
            },
            {
              role: "user",
              content: "Historial de mensajes del usuario: " + JSON.stringify(contentArray, null, 2) + "mensaje a responder: " + message.content + " - " + message.createdAt,
            },
          ],
          max_tokens: 500,
        });
        console.log("Bot: " + response.choices[0].message.content + "\n");
        console.log("Historial de mensajes del usuario: " + JSON.stringify(contentArray, null, 2));
        message.channel.send({
          content: response.choices[0].message.content,
          allowedMentions: { parse: [] },
        });

        const userReactions = message.reactions.cache.filter((reaction) =>
          reaction.users.cache.has(message.author.id),
        );

        try {
          for (const reaction of userReactions.values()) {
            await reaction.users.remove(message.author.id);
          }
        } catch (error) {
          console.error("Failed to remove reactions.");
        }
      }
    }

  } catch (error) {
    console.error("Error:", error);
    message.reply("¡Ups! Algo salió mal. Intenta de nuevo más tarde.");
    // Eliminar la reacción
    const userReactions = message.reactions.cache.filter((reaction) =>
      reaction.users.cache.has(message.author.id),
    );

    try {
      for (const reaction of userReactions.values()) {
        await reaction.users.remove(message.author.id);
      }
    } catch (error) {
      console.error("Failed to remove reactions.");
    }
  }
});

client.login(process.env.TOKEN);
