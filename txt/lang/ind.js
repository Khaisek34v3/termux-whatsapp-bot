exports.help = (prefix) => {
  return `
[Main]
=> ${prefix}help
=> ${prefix}menu

[Fun]
=> ${prefix}meme
`
}
exports.wait = () => {
  return `Mohon tunggu sebentar...`
}
exports.hours = () => {
  return `Jam`
}
exports.minute = () => {
  return `Menit`
}
exports.second = () => {
  return `Detik`
}
exports.hello = () => {
  return `Halo`
}
exports.welcome = () => {
  return `Selamat datang di`
}
exports.goodbye = () => {
  return `Selamat tinggal`
}
exports.done = () => {
  return `Selesai`
}
exports.onlygroup = () => {
  return `[ ! ] Perintah ini hanya bisa di gunakan di dalam group.`
}
exports.onlyadmin = () => {
  return `[ ! ] Perintah ini hanya bisa di gunakan oleh admin group.`
}
exports.onlybadmin = () => {
  return `[ ! ] Perintah ini hanya bisa di gunakan saat bot menjadi admin group.`
}
exports.onlyowner = () => {
  return `[ ! ] Perintah ini hanya bisa di gunakan oleh owner.`
}
exports.acc = () => {
  return `Perintah diterima.`
}
exports.addedadmin = () => {
  return `Menambahkan menjadi admin group.`
}
exports.demotedadmin = () => {
  return `Menurunkan jabatan dari admin group.`
}
exports.ongroup = () => {
  return `di group`
}
exports.levelup = (sender, getLevelingXp, getLevel, getLevelingLevel) => {
  return `
*[ LEVEL UP ]*
• *Name*: ${sender}
• *XP*: ${getLevelingXp(sender)}
• *Level*: ${getLevel} ~> ${getLevelingLevel(sender)}
Selamat!! 🎉🎉`
}
exports.wame = (sender) => {
  return `[ *WA-ME* ]
• _Diminta Oleh_ : *@${sender.split("@s.whatsapp.net")[0]}*
• _Tautan WhatsApp Anda_ : *https://wa.me/${sender.split("@s.whatsapp.net")[0]}*
  *Atau ( / )*
  *https://api.whatsapp.com/send?phone=${sender.split("@")[0]}*`
}
