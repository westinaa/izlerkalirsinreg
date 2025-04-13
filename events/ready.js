const { REST } = require("@discordjs/rest");
const { joinVoiceChannel } = require('@discordjs/voice');
const { Routes } = require("discord-api-types/v10");
const { TOKEN } = require("../config.json");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);

const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});

module.exports = async (client) => {

  const rest = new REST({ version: "10" }).setToken(TOKEN || process.env.token);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: client.commands,
    });
  } catch (error) {
    console.error(error);
  }

   // Ses kanalına bağlanma
   let botVoiceChannel = client.channels.cache.get("1357154558870163647");
   try {
     const connection = joinVoiceChannel({
       channelId: botVoiceChannel.id, // Ses kanalının ID'si
       guildId: botVoiceChannel.guild.id, // Sunucunun ID'si
       adapterCreator: botVoiceChannel.guild.voiceAdapterCreator, // Sesli kanal bağlantısı için adapter
     });

     console.log('Bot ses kanalına bağlandı!');
   } catch (err) {
     console.error("[HATA] Bot ses kanalına bağlanamadı!", err);
   }

    console.log(`${client.user.tag} Aktif!`);
    client.user.setActivity("@izlerkalirsin")
};
