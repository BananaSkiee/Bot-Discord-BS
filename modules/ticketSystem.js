// modules/ticketSystem.js
module.exports = async function handleTicketInteraction(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;

  const channel = await guild.channels.create({
    name: `ticket-${user.username}`,
    type: 0, // GUILD_TEXT
    parent: null, // bisa diisi ID kategori
    permissionOverwrites: [
      {
        id: guild.id,
        deny: ["ViewChannel"],
      },
      {
        id: user.id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
      },
    ],
  });

  await channel.send(`👋 Hai ${user}, silakan jelaskan masalahmu di sini.`);

  await interaction.reply({
    content: `✅ Ticket dibuka: <#${channel.id}>`,
    ephemeral: true,
  });
};
