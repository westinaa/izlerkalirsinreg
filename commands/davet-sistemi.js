const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");
// westina
module.exports = {
    name: "davet-sistemi",
    description: 'Gelişmiş davet sistemini ayarlarsın.',
    type: 1,
    options: [
        {
            name: "davet-kanalı",
            description: "Davet mesajlarının gönderileceği kanal.",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "mesaj-görünümü",
            description: "Mesajın görünümünü ayarlarsın, hoş bir embed mi yoksa düz mesaj mı!",
            type: 3,
            required: true,
            choices: [
                {
                    name: 'Embed Mesajı',
                    value: "embed"
                },

                {
                    name: 'Normal Mesaj',
                    value: "mesaj"
                },
            ]
        }
    ],
    run: async (client, interaction) => {

        const permission_embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Davet sistemini ayarlayabilmek için **Yönetici** yetkisine sahip olmalısın!")

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [permission_embed], ephemeral: true })

        const channel = interaction.options.getChannel("davet-kanalı")
        const input = interaction.options.getString("mesaj-görünümü")

        if (input === "embed") {
            const success_embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `${interaction.user.username} tarafından`, iconURL: interaction.user.avatarURL() })
                .setDescription(`> Davet log sistemi başarıyla ayarlandı!\n\n#️⃣ ${channel}\n📄 \`${input}\``)
                .setThumbnail(interaction.user.avatarURL())

            db.set(`davetLog_${interaction.guild.id}`, { channel: channel.id, message: input })
            return interaction.reply({ embeds: [success_embed] })
        }

        if (input === "mesaj") {
            const success_embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `${interaction.user.username} tarafından`, iconURL: interaction.user.avatarURL() })
                .setDescription(`> Davet log sistemi başarıyla ayarlandı!\n\n#️⃣ ${channel}\n📄 \`${input}\``)
                .setThumbnail(interaction.user.avatarURL())

            db.set(`davetLog_${interaction.guild.id}`, { channel: channel.id, message: input })
            return interaction.reply({ embeds: [success_embed] })
        }
    }
}
