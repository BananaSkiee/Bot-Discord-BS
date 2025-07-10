const updateOnline = require("../online");

module.exports = {
  name: "presenceUpdate",
  async execute(_, newPresence, client) {
    const guild = newPresence.guild;
    if (guild) await updateOnline(guild);
  }
};
