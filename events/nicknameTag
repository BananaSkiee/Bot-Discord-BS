const { ROLES, ROLE_DISPLAY_MAP } = require("../config");

/**
 * Menambahkan tag ke nickname user
 */
async function tambahTag(member, tag) {
  try {
    const displayTag = ROLE_DISPLAY_MAP[tag] || tag;
    const username = member.user.globalName || member.user.username;
    const newNick = `[${displayTag}] ${username}`.slice(0, 32); // max 32 karakter

    await member.setNickname(newNick);
    return true;
  } catch (error) {
    console.error("Gagal menambahkan tag nickname:", error);
    return false;
  }
}

/**
 * Menghapus tag dari nickname user
 */
async function hapusTag(member) {
  try {
    const username = member.user.globalName || member.user.username;
    await member.setNickname(username);
    return true;
  } catch (error) {
    console.error("Gagal menghapus tag nickname:", error);
    return false;
  }
}

module.exports = {
  tambahTag,
  hapusTag,
};
