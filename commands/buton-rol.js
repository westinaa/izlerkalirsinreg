const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonStyle, ButtonBuilder, Discord } = require("discord.js");
const westinadb = require("croxydb");

module.exports = {
    name: "buton-rol",
    description: "Üyelerin butona basarak rol almasını sağlarsın",
    async run(client, message, args) {
        // Komut parametrelerini kontrol et
        const emoji = args[0]; // Emojiyi komutun ilk parametresinden alıyoruz
        const roleName = args[1]; // Rol ismini komutun ikinci parametresinden alıyoruz
        const buttonColor = args[2]; // Buton rengini komutun üçüncü parametresinden alıyoruz
        const removeRoleName = args[3];
        const removeRole = message.guild.roles.cache.find(r => r.name === removeRoleName);
        // Yetki Kontrolü
        const yetki = new Discord.EmbedBuilder()
            .setColor("Red")
            .setDescription("Bu komutu kullanabilmek için `Rolleri Yönet` yetkisine sahip olmalısın!");

        const rol = message.guild.roles.cache.find(r => r.name === roleName); // Rolü buluyoruz
        if (!rol) {
            return message.reply("Belirttiğiniz rol bulunamadı.");
        }

        let input = buttonColor;

        // Kullanıcıda gerekli yetkiler yoksa hata mesajı
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ embeds: [yetki] });
        }

        // Botun rolü çok düşükse hata mesajı
        if (rol.position >= message.guild.members.me.roles.highest.position) {
            const pozisyon = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`${rol} benim rolümden yüksekte!\n\n**Sunucu Ayarları** -> __**Roller**__ kısmından rolümü ${rol} rolünün üzerine sürüklemelisin.`);
            return message.reply({ embeds: [pozisyon] });
        }

        // Botun yetkisi yoksa hata mesajı
        const botYetki = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Bunu yapabilmek için yeterli yetkiye sahip değilim.");

        let me = message.guild.members.cache.get(client.user.id);
        if (!me.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [botYetki] });
        }

        // Emoji hatası
        if (!emoji) {
            return message.reply("Lütfen düzgün bir emoji girin.");
        }

        // Buton mesajı
        const butonRolMesaj = new EmbedBuilder()
            .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setColor("Green")
            .setDescription(`ARAMIZA HOŞ GELDİN!
                Aşağıdaki butona basarak aramıza katılabilirsin.

                https://discord.gg/izlerkalirsin
                `);

        // Buton satırı
        const butonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji(emoji)
                    .setLabel("Tıkla kaydol!")
                    .setStyle(getButtonStyle(input))
                    .setCustomId("butonRol")
            );

        // Veri tabanına rol ID'sini kaydet
        westinadb.set(`butonRol_${message.guild.id}`, rol.id);
    if (removeRole) westinadb.set(`butonRolRemove_${message.guild.id}`, removeRole.id);

        const basari = new EmbedBuilder()
            .setColor("Green")
            .setDescription("Buton rol sistemi başarıyla ayarlandı.");

        // Komut çalıştırıldıktan sonra başarı mesajı
        message.reply({ embeds: [basari] });

        // Butonu mesajla gönder
        return message.channel.send({ embeds: [butonRolMesaj], components: [butonRow] }).catch(() => {
            return message.reply("Bir hata oluştu. Lütfen emoji ve rol adını doğru girdiğinizden emin olun.");
        });
    }
};

// Buton rengini ayarlama fonksiyonu
function getButtonStyle(color) {
    switch (color) {
        case 'red':
            return ButtonStyle.Danger;
        case 'blue':
            return ButtonStyle.Primary;
        case 'gray':
            return ButtonStyle.Secondary;
        case 'green':
            return ButtonStyle.Success;
        default:
            return ButtonStyle.Primary;
    }
}
