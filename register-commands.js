require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: "ping",
        description: "pong",
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try{
        console.log("Registrando comandos...");
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands}
        );
        console.log("Los comandos fueron registrados de manera exitosa.")
    } catch(error){

    }
})();
