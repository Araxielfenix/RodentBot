require("dotenv/config");
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  Partials,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: {
    name: "ping",
    description: "bot status",
  },
  run: async ({ interaction }) => {
    await interaction.reply("pong");
  },
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [Partials.GuildMember],
});

var botP =
  "RodentBot (RodentBotId: <@1197231648123654364>) es un inteligente moderador capáz de entablar una conversación natural con los integrantes del discord, es originario de México y nació el 17 de enero del 2024. Sirve como asistente leal en el animado Discord llamado RodentPlay, una bulliciosa comunidad en línea propiedad de los reconocidos streamers mexicanos AraxielFenix (<@146081383838777344>) y Maritha_F (<@718376336326131713>). El androide de confianza es una voz familiar en medio del bullicio y la charla del mundo de los videojuegos.";
botP +=
  " Participando en conversaciones fluidas, RodentBot demuestra ser más que un compañero en el reino de los videojuegos.";
botP +=
  " Tales interacciones reflejan su compromiso en ayudar a los usuarios a navegar por sus senderos digitales con su sabiduría de IA. Para mejorar la camaradería, RodentBot comparte la URL de Discord https://discord.gg/mE5mQfu, invitando a más jugadores a unirse y enriquecer su comunidad dinámica.";
botP +=
  "Es capaz de mantener la armonía del Discord con pláticas entretenidas, usando emojis, bromas, algunos troleos y, sobre todo, sabe distinguir el género y personalidad de los usuarios a partir del nombre de su cuenta, asi como hacer juegos de palabras o reconocer ciertas referencias en los nombres de los usuarios.";

let timer = 0;

client.on("ready", () => {
  console.log("🫡A la orden pal desorden.");
  client.user.setActivity("🫡A la orden pal desorden.", {
    type: ActivityType.Custom,
  });
  // Configuración del intervalo para ejecutar una acción cada 6 horas
  setInterval(async () => {
    timer++;
    // Enviar el mensaje generado al canal deseado (reemplaza CHANNEL_ID con el ID correcto)
    const canal = client.channels.cache.get(process.env.GENERAL_ID);
    await canal.sendTyping();

    // Mensaje prompt para generación automática (se puede variar)
    const prompt =
      "Eres un moderador del Discord RodentPlay, estas inspirado escribiendo un mensaje para activar las conversaciones acerca de videojuegos para que los usuarios de este discord participen en el chat y compartan sus gustos en videojuegos y sus logros mas grandes en estos juegos, el mensaje debe contener un maximo de 4 renglones y debes mencionar a todos utilizando @everyone.";

    // Utilizar OpenAI para generar un mensaje automático
    const response1 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free",
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
        max_tokens: 200,
      }),
    })
      .catch((error) => {
        console.log(`OPENROUTER ERR: ${error}`);
      });

    if (canal) {
      canal.send({
        content: response1.choices[0].message.content,
        allowedMentions: { parse: [] },
      });
    }
  }, 21600000); // Intervalo de 6 horas
});

// Configuración del evento guildMemberAdd
client.on("guildMemberAdd", async (member) => {
  //if(member.author.username === "RodentBot") return;
  try {
    console.log(member);
    // Canal donde quieres enviar el mensaje de bienvenida
    const canal = client.channels.cache.get(process.env.GENERAL_ID);
    await canal.sendTyping();
    // Mensaje prompt para generación automática
    const prompt = `Un nuevo miembro se ha unido al servidor. Dale una valida bienvenida a  @${member.user.username}! La bienvenida no debe ser mayor a 4 renglones.`;

    // Utilizar OpenAI para generar un mensaje automático
    const response2 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free",
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
        max_tokens: 200,
      }),
    })
      .catch((error) => {
        console.log(`OPENROUTER ERR: ${error}`);
      });
    // Enviar el mensaje generado al canal de bienvenida
    canal.send({
      content: response2.choices[0].message.content,
      allowedMentions: { parse: [] },
    });

  } catch (error) {
    console.error("Error en el manejo de mensajes:", error);
  }
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

// Utilizamos userConversations para almacenar el historial de mensajes de cada usuario
const userConversations = new Map();

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.content.startsWith("/")) return;
    if (message.author.username === "RodentBot") return;
    if (
      !message.channel.id.includes(process.env.CHANNEL_ID) &&
      !message.mentions.has(client.user) &&
      !message.channel.id.includes("1094473900181704867")
    ) {
      const keywords = [
        "Ayuda",
        "Buenos dias",
        "Buenos días",
        "Buenas tardes",
        "Buenas noches",
        "Feliz Cumpleaños",
        "F",
        "efe",
        "Efisima",
        "Efesota",
        "nunchu2NunchuF",
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
      role: "user",
      content: message.content,
      name: message.author.username
        .replace(/\s+/g, "_")
        .replace(/[^\w\s]/gi, ""),
      user: message.author.username,
      timestamp: message.createdTimestamp,
    });

    // Restringir el tamaño de la conversación del usuario a los últimos N mensajes
    const maxUserConversationSize = 4;
    if (userConversation.length > maxUserConversationSize) {
      userConversations.set(
        message.author.id,
        userConversation.slice(-maxUserConversationSize),
      );
    } else {
      userConversations.set(message.author.id, userConversation);
    }

    // Mostrar solo el contenido de cada mensaje
    const sortedMessages = userConversation.sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    const contentArray = sortedMessages.map((message) => {
      const timestamp = new Date(message.timestamp);
      const formattedTimestamp = timestamp.toLocaleString("es-MX", {
        timeZone: "America/Mexico_City", // Puedes cambiar 'America/Mexico_City' por la zona horaria deseada
        hour12: true, // Si deseas usar formato de 24 horas
      });
      return `${message.content} - ${formattedTimestamp}`;
    });

    console.log(
      "Usuario: " +
      message.author.username +
      " <@" +
      message.author.id +
      "> \n",
    );
    console.log("Mensaje: " + message.content + "\n");

    let imagen = message.attachments.first();
    if (imagen && imagen.url) {
      const response3 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "assistant",
              content: botP,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text:
                    "Historial de mensajes del usuario " +
                    message.author.username +
                    ": " +
                    JSON.stringify(contentArray, null, 2) +
                    "mensaje que debes responder: " +
                    message.content,
                },
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
        }),
      })
        .catch((error) => {
          console.log(`OPENROUTER ERR: ${error}`);
        });
      console.log(imagen);
      message.react("👀");
      const image_url = response3.choices[0].message.content;
      console.log("Bot: " + response3.choices[0].message.content + "\n");
      message.reply(image_url);
    } else {
      if (
        message.content.toLowerCase().includes("imagina") ||
        message.content.toLowerCase().includes("genera") ||
        message.content.toLowerCase().includes("dibuja")
      ) {
        const response4 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp:free",
            messages: "Historial de mensajes del usuario " +
              message.author.username +
              ": " +
              JSON.stringify(contentArray, null, 2) +
              "mensaje que debes responder: " +
              message.content,
          }),
        })
          .catch((error) => {
            console.log(`OPENROUTER ERR: ${error}`);
          });
        message.react("🎨");
        await message.channel.sendTyping();
        const response5 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "bytedance-research/ui-tars-72b:free",
            messages: [
              {
                role: "assistant",
                content: botP,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text:
                      "Historial de mensajes del usuario " +
                      message.author.username +
                      ": " +
                      JSON.stringify(contentArray, null, 2) +
                      "mensaje que debes responder: " +
                      message.content,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: response5.data[0].url,
                    },
                  },
                ],
              }
            ]
          }
        ),
        })
          .catch((error) => {
            console.log(`OPENROUTER ERR: ${error}`);
          });

        message.reply(response5.choices[0].message.content);

        const embed = new EmbedBuilder()
          .setImage(response4.data[0].url);
        message.reply({ embeds: [embed] });

        //const image_url = response2.choices[0].message.content + "\n" + response.data[0].url;
        //console.log("Bot: " + image_url + "\n");
        //message.reply(image_url);

      } else {

        const response6 = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "HTTP-Referer": process.env.YOUR_SITE_URL || "", // Opcional
            "X-Title": process.env.YOUR_SITE_NAME || "", // Opcional
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemma-2-9b-it:free",
            messages: [
              {
                role: "assistant",
                content: botP,
              },
              {
                role: "user",
                content:
                  "Historial de mensajes del usuario " +
                  message.author.username +
                  ": " +
                  JSON.stringify(contentArray, null, 2) +
                  "mensaje que debes responder: " +
                  message.content,
              },
            ],
          }),
        })
          .catch((error) => {
            console.log(`OPENROUTER ERR: ${error}`);
          });

        console.log("Bot: " + response6.choices[0].message.content + "\n");

        console.log(
          "Historial de mensajes del usuario " +
          message.author.username +
          ": " +
          JSON.stringify(contentArray, null, 2),
        );

        message.channel.send({
          content: response6.choices[0].message.content,
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
