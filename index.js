const { Client, GatewayIntentBits, Partials, PermissionsBitField, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { readdirSync } = require("fs");
const { PREFIX, TOKEN } = require("./config.js");
const westinadb = require("croxydb");

const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);

const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users", "roles", "everyone"]
    },
    partials: PARTIALS,
    retryLimit: 3
});

global.client = client;
client.commands = [];

// Komutları yükle
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    // Komutların doğru şekilde yüklenmesi
    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: props.dm_permission,
        type: 1,
        run: props.run // Burada run fonksiyonunu da ekliyoruz
    });

    console.log(`[COMMAND] ${props.name} komutu yüklendi.`);
});

// Olayları yükle
readdirSync('./events').forEach(e => {
    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args);
    });
    console.log(`[EVENT] ${name} eventi yüklendi.`);
});

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot aktif 🚀");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Uygulama ayakta: http://localhost:${port}`);
});


// Komutları çalıştırırken
client.on('messageCreate', async (message) => {
    // Mesaj bot tarafından yazılmışsa geç
    if (message.author.bot) return;

    // Eğer mesaj prefix ile başlamıyorsa, geç
    if (!message.content.startsWith(PREFIX)) return;

    // Komutları almak için prefix'ten sonra gelen kısmı al
    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Komutları yüklediğimiz kısım
    const command = client.commands.find(cmd => cmd.name === commandName);

    if (command) {
        try {
            // Komut çalıştırılıyor
            await command.run(client, message, args); // Burada run fonksiyonu doğru şekilde çağrılmalı
        } catch (error) {
            console.error(error);
            message.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
        }
    }
  });
   /*  } else {
        message.reply({ content: 'Böyle bir komut bulunamadı!', ephemeral: true });
    }*/

client.login(TOKEN);

// Hata yakalama işlemi
process.on("unhandledRejection", async (error) => {
    console.log("Bir hata oluştu! " + error);
});

client.on('interactionCreate', interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === "butonRol") {

        let rol = westinadb.get(`butonRol_${interaction.guild.id}`);
        let removeRol = westinadb.get(`butonRolRemove_${interaction.guild.id}`);
        if (!rol) return;

        const botYetki = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Bunu yapabilmek için yeterli yetkiye sahip değilim.");

        if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [botYetki], ephemeral: true });
        }

        // Eğer kullanıcıda rol yoksa → ver
        if (!interaction.member.roles.cache.has(rol)) {
            interaction.member.roles.add(rol).catch(() => { });

            // Eğer kaldırılacak rol varsa ve kullanıcıda varsa → kaldır (sessizce)
            if (removeRol && interaction.member.roles.cache.has(removeRol)) {
                interaction.member.roles.remove(removeRol).catch(() => { });
            }

            const verildi = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`<@&${rol}> adlı rol başarıyla üzerine verildi!`);

            return interaction.reply({ embeds: [verildi], ephemeral: true }).catch(() => { });
        } else {
            // Rol zaten varsa → kaldır
            interaction.member.roles.remove(rol).catch(() => { });

            const alındı = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`<@&${rol}> adlı rol başarıyla üzerinden alındı!`);

            return interaction.reply({ embeds: [alındı], ephemeral: true }).catch(() => { });
        }
    }
});

client.on('guildMemberAdd', (member, type, invite) => {

    const data = db.get(`davetLog_${member.guild.id}`)
    if (!data) return;
    const inviteChannel = member.guild.channels.cache.get(data.channel);
    if (!inviteChannel) return db.delete(`davetLog_${member.guild.id}`); // ayarlanan kanal yoksa sistemi sıfırlar

    const invitedMember = db.get(`invitedİnfo_${member.id}_${member.guild.id}`)
    if (invitedMember) {
        if (data.message === "embed") {

            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! Daha önce <@${invitedMember.inviterİd}> tarafından davet edilmişsin! :tada:\n\n> **discord.gg/${invitedMember.inviteCode}** linkiyle giriş yapmıştın.`)
                .setFooter({ text: `${invite.inviter.username} tarafından davet edildi` })
                .setTimestamp()

            db.add(`inviteCount_${invitedMember.inviterİd}_${member.guild.id}`, 1)
            db.add(`inviteRemoveCount_${invitedMember.inviterİd}_${member.guild.id}`, -1)
            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj" && member.user.id === invite.inviter.id) {
            db.add(`inviteCount_${invitedMember.inviterİd}_${member.guild.id}`, 1)
            db.add(`inviteRemoveCount_${invitedMember.inviterİd}_${member.guild.id}`, -1)
            return inviteChannel.send({ content: `Hoşgeldin ${member}! Daha önce <@${invitedMember.inviterİd}> tarafından davet edilmişsin! :tada:` })
        }
    }

    if (type === 'normal') {

        if (data.message === "embed" && member.user.id === invite.inviter.id) {
            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! Adam kendi kendini davet etmiş :tada:\n\n> **discord.gg/${invite.code}** linkiyle giriş yaptı.`)
                .setFooter({ text: `Kendi kendini davet etmiş.` })
                .setTimestamp()

            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj" && member.user.id === invite.inviter.id) {
            return inviteChannel.send({ content: `Hoşgeldin ${member}! Adam kendi kendini davet etmiş :tada:` })
        }

        if (data.message === "embed") {

            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! **${invite.inviter.username}** sayesinde buradasın! :tada:\n\n> **discord.gg/${invite.code}** linkiyle giriş yaptı.`)
                .setFooter({ text: `${invite.inviter.username} tarafından davet edildi` })
                .setTimestamp()

            db.set(`invitedİnfo_${member.id}_${member.guild.id}`, { inviterİd: invite.inviter.id, inviteCode: invite.code })
            db.add(`inviteCount_${invite.inviter.id}_${member.guild.id}`, 1)
            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj") {
            db.set(`invitedİnfo_${member.id}_${member.guild.id}`, { inviterİd: invite.inviter.id, inviteCode: invite.code })
            db.add(`inviteCount_${invite.inviter.id}_${member.guild.id}`, 1)
            return inviteChannel.send({ content: `Hoşgeldin ${member}! **${invite.inviter.username}** sayesinde buradasın! :tada:` })
        }
    }

    else if (type === 'permissions') {
        if (data.message === "embed") {
            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! Sunucuyu yönet yetkim olmadığı için nasıl geldiğini bulamadım!`)
                .setFooter({ text: `Nasıl davet edildiğini bulamadım, yetkim yok` })
                .setTimestamp()

            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj") {
            return inviteChannel.send({ content: `Hoşgeldin ${member}! Sunucuyu yönet yetkim olmadığı için nasıl geldiğini bulamadım!` })
        }
    }

    else if (type === 'unknown') {
        if (data.message === "embed") {
            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} giriş yaptı` })
                .setDescription(`Hoşgeldin ${member}! Nasıl geldiğini bulamadım, gökten mi indin? :tada:`)
                .setFooter({ text: `Nasıl geldi anlamadım, kimsede söylemiyor` })
                .setTimestamp()

            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj") {
            return inviteChannel.send({ content: `Hoşgeldin ${member}! Nasıl geldiğini bulamadım, gökten mi indin? :tada:` })
        }
    }
})
//
//
client.on('guildMemberRemove', (member) => {

    const data = db.get(`davetLog_${member.guild.id}`)
    if (!data) return;
    const inviteChannel = member.guild.channels.cache.get(data.channel);
    if (!inviteChannel) return db.delete(`davetLog_${member.guild.id}`); // ayarlanan kanal yoksa sistemi sıfırlar

    const invitedMember = db.get(`invitedİnfo_${member.id}_${member.guild.id}`)
    if (invitedMember) {
        if (data.message === "embed") {
            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} çıkış yaptı` })
                .setDescription(`Görüşürüz ${member}! <@${invitedMember.inviterİd}> tarafından davet edilmişti! :neutral_face:\n\n> **discord.gg/${invitedMember.inviteCode}** linkiyle giriş yapmıştı.`)
                .setFooter({ text: `Uf ya adam gitti valla, ${member.guild.memberCount} kişi kaldık` })
                .setTimestamp()

            db.add(`inviteRemoveCount_${invitedMember.inviterİd}_${member.guild.id}`, 1)
            db.add(`inviteCount_${invitedMember.inviterİd}_${member.guild.id}`, -1)
            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj" && member.user.id === invite.inviter.id) {
            db.add(`inviteRemoveCount_${invitedMember.inviterİd}_${member.guild.id}`, 1)
            db.add(`inviteCount_${invitedMember.inviterİd}_${member.guild.id}`, -1)
            return inviteChannel.send({ content: `Görüşürüz ${member}! <@${invitedMember.inviterİd}> tarafından davet edilmişti! :neutral_face:` })
        }
    } else {
        if (data.message === "embed") {

            const invite_embed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setAuthor({ name: `${member.user.username} çıkış yaptı` })
                .setDescription(`Görüşürüz ${member}! Kim davet etti ne oldu bilmiyorum valla. :neutral_face:`)
                .setFooter({ text: `Uf ya adam gitti valla, ${member.guild.memberCount} kişi kaldık` })
                .setTimestamp()

            return inviteChannel.send({ embeds: [invite_embed] })
        }

        if (data.message === "mesaj" && member.user.id === invite.inviter.id) {
            return inviteChannel.send({ content: `Görüşürüz ${member}! Kim davet etti ne oldu bilmiyorum valla. :neutral_face:` })
        }
    }
})
