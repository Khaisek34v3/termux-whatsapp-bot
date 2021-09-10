const {
  WAConnection,
  MessageType,
  Presence,
  Mimetype,
  GroupSettingChange,
  MessageOptions
} = require('@adiwajshing/baileys')
const { getLevelingXp, getLevelingLevel, getLevelingId, addLevelingXp, addLevelingLevel } = require('./lib/function/leveling')
const { color, bgcolor } = require('./lib/color')
const { simih, getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom } = require('./lib/msgf')
const { start, info, success, close } = require('./lib/instance')
const { fetchJson } = require('./lib/fetcher')
const fs = require('fs')
const speed = require('performance-now')
const moment = require('moment-timezone')
const { exec } = require('child_process')
const fetch = require('node-fetch')
const ffmpeg = require('fluent-ffmpeg')
const { removeBackgroundFromImageFile } = require('remove.bg')
const imgbb = require('imgbb-uploader')
const setting = JSON.parse(fs.readFileSync('./lib/setting.json'))
const apilink = JSON.parse(fs.readFileSync('./lib/apilink.json'))
const { eng, ind, arab } = require('./txt/lang/')
const txtlang = ind
const welcomejson = JSON.parse(fs.readFileSync('./src/welcome.json'))
const nsfwjson = JSON.parse(fs.readFileSync('./src/nsfw.json'))
const simijson = JSON.parse(fs.readFileSync('./src/simi.json'))
//const user = JSON.parse(fs.readFileSync('./src/user.json'))
const _leveling = JSON.parse(fs.readFileSync('./src/leveling.json'))
const _level = JSON.parse(fs.readFileSync('./src/level.json'))
const privategc_ = JSON.parse(fs.readFileSync('./src/privategc.json'))
const _scommand = JSON.parse(fs.readFileSync("./src/scommand.json"));

pttmode = setting.pttmode
prefix = setting.prefix
blocked = []

function kyun(seconds){
  function pad(s){
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60*60));
  var minutes = Math.floor(seconds % (60*60) / 60);
  var seconds = Math.floor(seconds % 60);

  return `${pad(hours)} ` + txtlang.hours() + ` ${pad(minutes)} ` + txtlang.minute() + ` ${pad(seconds)} ` + txtlang.second()
}

function addMetadata(packname, author) {
  if (!packname) packname = 'WABot'; if (!author) author = 'Bot';
  author = author.replace(/[^a-zA-Z0-9]/g, '');
  let name = `${author}_${packname}`
  if (fs.existsSync(`./src/stickers/${name}.exif`)) return `./src/stickers/${name}.exif`
  const json = {
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author,
  }
  const littleEndian = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])
  const bytes = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]

  let len = JSON.stringify(json).length
  let last

  if (len > 256) {
    len = len - 256
    bytes.unshift(0x01)
  } else {
    bytes.unshift(0x00)
  }

  if (len < 16) {
    last = len.toString(16)
    last = "0" + len
  } else {
    last = len.toString(16)
  }

  const buf2 = Buffer.from(last, "hex")
  const buf3 = Buffer.from(bytes)
  const buf4 = Buffer.from(JSON.stringify(json))

  const buffer = Buffer.concat([littleEndian, buf2, buf3, buf4])

  fs.writeFile(`./src/stickers/${name}.exif`, buffer, (err) => {
    return `./src/stickers/${name}.exif`
  })
}

async function startsBaileysBot() {
  const MUT = new WAConnection()
  MUT.logger.level = 'warn'
  MUT.on('qr', () => {
    console.log(color('[','white'), color('!','red'), color(']','white'), color(' Scan the qr code above'))
  })
  fs.existsSync('./auth_info/auth.json') && MUT.loadAuthInfo('./auth_info/auth.json')
  MUT.on('connecting', () => {
    start('2', 'Connecting...')
  })
  MUT.on('open', () => {
    success('2', 'Connected')
  })
  await MUT.connect({timeoutMs: 30*1000})
  fs.writeFileSync('./auth_info/auth.json', JSON.stringify(MUT.base64EncodedAuthInfo(), null, '\t'))
  MUT.on('group-participants-update', async (anu) => {
    if (!welcomejson.includes(anu.jid)) return
    try {
      const mdata = await MUT.groupMetadata(anu.jid)
      console.log(anu)
      if (anu.action == 'add') {
	num = anu.participants[0]
	try {
	  ppimg = await MUT.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
	} catch {
	  ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
	}
	teks = txtlang.hello() + ` @${num.split('@')[0]}\n` + txtlang.welcome() + ` *${mdata.subject}*`
	let buff = await getBuffer(ppimg)
	MUT.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
      } else if (anu.action == 'remove') {
	num = anu.participants[0]
	try {
	  ppimg = await MUT.getProfilePicture(`${num.split('@')[0]}@c.us`)
	} catch {
	  ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
	}
	teks = txtlang.goodbye() + ` @${num.split('@')[0]}👋`
	let buff = await getBuffer(ppimg)
	MUT.sendMessage(mdata.id, buff, MessageType.image, {caption: teks, contextInfo: {"mentionedJid": [num]}})
      }
    } catch (e) {
      console.log('Error : ', e)
    }
  })
  MUT.on('CB:Blocklist', json => {
    if (blocked.length > 2) return
    for (let i of json[1].blocklist) {
      blocked.push(i.replace('c.us','s.whatsapp.net'))
    }
  })
  MUT.on('chat-update', async (mek) => {
    try {
      if (!mek.hasNewMessage) return
      mek = mek.messages.all()[0]
      if (!mek.message) return
      if (mek.key && mek.key.remoteJid == 'status@broadcast') return
      if (mek.key.fromMe) return
      global.prefix
      global.blocked
      const content = JSON.stringify(mek.message)
      const from = mek.key.remoteJid
      const type = Object.keys(mek.message)[0]
      const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
      const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
      const jam = moment().tz("Asia/Jakarta").format("HH:mm:ss");
      const wita = moment.tz("Asia/Makassar").format("HH:mm:ss");
      const wit = moment.tz("Asia/Jayapura").format("HH:mm:ss");
      const getCmd = (id) => {
        let position = null;
        Object.keys(_scommand).forEach((i) => {
          if (_scommand[i].id === id) {
            position = i;
          }
        });
        if (position !== null) {
          return _scommand[position].chats;
        }
      };
      let body = type === "conversation" && mek.message.conversation
        ? mek.message.conversation
        : type == "imageMessage" && mek.message.imageMessage.caption
        ? mek.message.imageMessage.caption
        : type == "videoMessage" && mek.message.videoMessage.caption
        ? mek.message.videoMessage.caption
        : type == "extendedTextMessage" && mek.message.extendedTextMessage.text
        ? mek.message.extendedTextMessage.text
        : type == "buttonsResponseMessage" && mek.message[type].selectedButtonId
        ? mek.message[type].selectedButtonId
        : type == "stickerMessage" &&
          getCmd(mek.message[type].fileSha256.toString("base64")) !== null &&
          getCmd(mek.message[type].fileSha256.toString("base64")) !== undefined
        ? getCmd(mek.message[type].fileSha256.toString("base64"))
        : "";
        for(AOW of listprefix){
	  if(body.startsWith(AOW)){prefix = AOW}else{}
        }
      let budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
      const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
      const args = body.trim().split(/ +/).slice(1)
      const isCmd = body.startsWith(prefix)
      const botNumber = MUT.user.jid
      const ownerNumber = [setting.ownernum + '@s.whatsapp.net'] // replace this with your number
      const isGroup = from.endsWith('@g.us')
      const sender = isGroup ? mek.participant : mek.key.remoteJid
      const groupMetadata = isGroup ? await MUT.groupMetadata(from) : ''
      const groupName = isGroup ? groupMetadata.subject : ''
      const groupId = isGroup ? groupMetadata.jid : ''
      const groupMembers = isGroup ? groupMetadata.participants : ''
      const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
      const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
      const isGroupAdmins = groupAdmins.includes(sender) || false
      const isWelcome = isGroup ? welcomejson.includes(from) : false
      const isNsfw = isGroup ? nsfwjson.includes(from) : false
      const isSimi = isGroup ? simijson.includes(from) : false
      const isOwner = ownerNumber.includes(sender)
      const isPrivateGc = isGroup ? privategc_.includes(from) : false
      const isLevelingOn = isGroup ? _leveling.includes(from) : false
      let authorname = MUT.contacts[from] != undefined ? MUT.contacts[from].vname || MUT.contacts[from].notify : undefined
      if (authorname != undefined) { } else { authorname = groupName }
      pushname = MUT.contacts[sender] != undefined ? MUT.contacts[sender].vname || MUT.contacts[sender].notify : undefined
      const isUrl = (url) => {
        return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
      }
      const reply = (teks) => {
	MUT.sendMessage(from, teks, text, {quoted:mek})
      }
      const sendMess = (hehe, teks) => {
	MUT.sendMessage(hehe, teks, text)
      }
      const mentions = (teks, memberr, id) => {
	(id == null || id == undefined || id == false) ? MUT.sendMessage(from, teks.trim(), extendedText, {contextInfo: {"mentionedJid": memberr}}) : MUT.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": memberr}})
      }
      if (isGroup && isLevelingOn) {
        const currentLevel = getLevelingLevel(sender)
        const checkId = getLevelingId(sender)
        try {
          if (currentLevel === undefined && checkId === undefined) addLevelingId(sender)
          const amountXp = Math.floor(Math.random() * 10) + 500
          const requiredXp = 5000 * (Math.pow(2, currentLevel) - 1)
          const getLevel = getLevelingLevel(sender)
          addLevelingXp(sender, amountXp)
          if (requiredXp <= getLevelingXp(sender)) {
            addLevelingLevel(sender, 1)
            await reply(txtlang.levelup(sender, getLevelingXp, getLevel, getLevelingLevel))
          }
        } catch (err) {
          console.error(err)
        }
      }
      colors = ['red','white','black','blue','yellow','green']
      const isMedia = (type === 'imageMessage' || type === 'videoMessage')
      const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
      const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
      const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
      if (!isGroup && isCmd) console.log('[MUT]', time, command, 'from', sender.split('@')[0], 'args :', args.length)
      if (!isGroup && !isCmd) console.log('[RECV]', time, 'Message', 'from', sender.split('@')[0], 'args :', args.length)
      if (isCmd && isGroup) console.log('[MUT]', time, command, 'from', sender.split('@')[0], 'in', groupName, 'args :', args.length)
      if (!isCmd && isGroup) console.log('[RECV]', time, 'Message', 'from', sender.split('@')[0], 'in', groupName, 'args :', args.length)
      switch(command) {
	case 'help':
	case 'menu':
	  MUT.sendMessage(from, txtlang.help(prefix), text)
	break
        case 'meme':
          reply(txtlang.wait())
          try {
            memeilink = await fetchJson(apilink + `darkjokes`, { method: 'get'})
            memeimg = await getBuffer(memeilink.result)
            MUT.sendMessage(from, memeimg, image, { quoted:mek, caption:txtlang.done()})
          } catch(e) {
            reply('[ ! ] Error')
            console.log('Error : ' + e)
          }
        break
        case 'promote': 
          if (!isGroup) return reply(txtlang.onlygroup())
	  if (!isGroupAdmins) return reply(txtlang.onlyadmin())
	  if (!isBotGroupAdmins) return reply(txtlang.onlybadmin())
	  if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply(txtlang.tagcmd())
	  mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
	  if (mentioned.length > 1) {
	    txtacc = txtlang.acc()
	    for (let _ of mentioned) {
	      teks += `@${_.split('@')[0]}\n`
	    }
	    mentions(teks, mentioned, true)
	    MUT.groupMakeAdmin(from, mentioned)
	  } else {
	    mentions(`${txtlang.acc()}, ${txtlang.addedadmin()} : @${mentioned[0].split('@')[0]}`, mentioned, true)
	    MUT.groupMakeAdmin(from, mentioned)
	  }
	break
        case 'demote':
          if (!isGroup) return reply(txtlang.onlygroup())
	  if (!isGroupAdmins) return reply(txtlangonlyadmin())
          if (!isBotGroupAdmins) return reply(txtlang.onlybdmin())
	  if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('𝐓𝐚𝐠 𝐭𝐚𝐫𝐠𝐞𝐭 𝐲𝐚𝐧𝐠 𝐦𝐚𝐮 𝐝𝐢 𝐭𝐮𝐫𝐮𝐧𝐤𝐚𝐧 𝐚𝐝𝐦𝐢𝐧')
	  mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
	  if (mentioned.length > 1) {
	    teks = ''
	    for (let _ of mentioned) {
	      teks += `${txtlang.acc()}, ${txtlang.demotedadmin()} :\n`
	      teks += `@_.split('@')[0]`
	    }
	    mentions(teks, mentioned, true)
	    MUT.groupDemoteAdmin(from, mentioned)
	  } else {
	    mentions(`${txtlang.acc()}, ${txtlang.demotedadmin()} @${mentioned[0].split('@')[0]}\n ${txtlang.ongroup()} _*${groupMetadata.subject}*_`, mentioned, true)
	    MUT.groupDemoteAdmin(from, mentioned)
	  }
	break
        case 'wa.me':
	case 'wame':
          try {
            ppimg = await MUT.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
          } catch {
            ppimg = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
          }
          ppimgbuf = await getBuffer(ppimg)
          teks = `${txtlang.wame(sender)}`
          MUT.sendMessage(from, ppimgbuf, image, { quoted:mek, caption: teks, contextInfo: { mentionedJid: [sender] } } )
	break
        case 'blocklist':
          teks = 'This is list of blocked number :\n'
          for (let block of blocked) {
            teks += `~> @${block.split('@')[0]}\n`
          }
          teks += `Total : ${blocked.length}`
          MUT.sendMessage(from, teks.trim(), extendedText, {quoted: mek, contextInfo: {"mentionedJid": blocked}})
        break
        case 'listadmins':
        case 'listadmin':
        case 'adminslist':
        case 'adminlist':
          if (!isGroup) return reply(txtlang.onlygroup())
          teks = `List admin group *${groupMetadata.subject}*\nTotal : ${groupAdmins.length}\n\n`
          no = 0
          for (let admon of groupAdmins) {
            no += 1
            teks += `[${no.toString()}] @${admon.split('@')[0]}\n`
          }
          mentions(teks, groupAdmins, true)
        break
        case 'setprefix':
          if (args.length < 1) return
          if (!isOwner) return reply(txtlang.onlyowner())
          prefix = args[0]
          reply(txtlang.prefixchanged() + ` : ${prefix}`)
          console.log(color('[INFO]', 'green'), color(`${txtlang.prefixchanged()} : ${prefix}`, 'yellow'));
        break
        case 'setppbot':
          if (!isQuotedImage) return reply(`${txtlang.needimgcpt()} ${txtlang.or()} ${txtlang.needtagimgcpt()}`)
          if (!isOwner) return reply(txtlang.onlyowner())
          enmedia = JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo
          media = await MUT.downloadAndSaveMediaMessage(enmedia)
          await MUT.updateProfilePicture(botNumber, media)
          reply(txtlang.done())
        break
        case 'bc':
          if (!isOwner) return reply(txtlang.onlyowner())
          if (args.length < 1) return reply('.......')
          anu = await MUT.chats.all()
          if (isMedia && !mek.message.videoMessage || isQuotedImage) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
            buff = await MUT.downloadMediaMessage(encmedia)
            for (let _ of anu) {
              MUT.sendMessage(_.jid, buff, image, {caption: `*[ BROADCAST ]*\n\n${body.slice(4)}`})
            }
            reply('')
          } else {
            for (let _ of anu) {
              sendMess(_.jid, `*[ BROADCAST ]*\n\n${body.slice(4)}`)
            }
            reply('Broadcast' + txtlang.done())
          }
        break
        case 'bcgc':
          if (!isOwner) return reply(txtlang.onlyowner())                              
          if (args.length < 1) return reply('.......')
          if (isMedia && !mek.message.videoMessage || isQuotedImage) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
            buff = await MUT.downloadMediaMessage(encmedia)
            for (let _ of groupMembers) {
              MUT.sendMessage(_.jid, buff, image, {caption: `*[ BC GROUP ]*\n*Group* : ${groupName}\n\n${body.slice(6)}`})
            }
            reply('')
          } else {
            for (let _ of groupMembers) {
              sendMess(_.jid, `*[ BC GROUP ]*\n*Group* : ${groupName}\n\n${body.slice(6)}`)
            }
            reply('Broadcast Group' + txtlang.done())
          }
        break
        case 'add':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          if (!isBotGroupAdmins) return reply(txtlang.onlybadmin())
          if (args.length < 1) return reply('.....')
          if (args[0].startsWith('08')) return reply(txtlang.countrynum())
          try {
            num = `${args[0].replace(/ /g, '')}@s.whatsapp.net`
            MUT.groupAdd(from, [num])
            reply(txtlang.done())
          } catch (e) {
            console.log('Error :', e)
            reply(txtlang.fail())
          }
        break
        case 'kick':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          if (!isBotGroupAdmins) return reply(txtlang.onlybadmin())
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply(txtlang.needtagmember())
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (mentioned.length > 1) {
            teks =  txtlang.acc() + txtlang.kicked() + ` :\n`
            for (let _ of mentioned) {
              teks += `@${_.split('@')[0]}\n`
            }
            mentions(teks, mentioned, true)
            MUT.groupRemove(from, mentioned)
          } else {
            mentions(`${txtlang.acc()} ${txtlang.kicked()} : @${mentioned[0].split('@')[0]}`, mentioned, true)
            MUT.groupRemove(from, mentioned)
            MUT.sendMessage(mentioned, txtlang.goodbye(), text)
          }
        break
        case 'linkgroup':
          if (isPrivateGc) return reply(txtlang.privategc())
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isBotGroupAdmins) return reply(txtlang.onlybadmin())
          linkgc = await MUT.groupInviteCode(from)
          reply('https://chat.whatsapp.com/'+linkgc)
        break
        case 'welcome':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          if (args.length < 1) return reply('.....')
          if (args[0] === 'enable') {
            if (isWelcome) return reply(txtlang.done())
            welcomejson.push(from)
            fs.writeFileSync('./src/welcome.json', JSON.stringify(welcomejson))
            reply(`${txtlang.succactwelcome()}✔️`)
          } else if (args[0] === 'disable') {
            welcomejson.splice(from, 1)
            fs.writeFileSync('./src/welcome.json', JSON.stringify(welcomejson))
            reply(`${txtlang.succnonactwelcome()} ✔️`)
          } else {
            reply(txtlang.enaordisa())
          }
        break
        case 'privategc':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          if (args.length < 1) return reply('.....')
          if (args[0] === 'enable') {
            if (isPrivateGc) return reply(txtlang.done())
            privategc_.push(from)
            fs.writeFileSync('./src/privategc.json', JSON.stringify(privategc_))
            reply(`${txtlang.succactprivategc()} ✔️`)
          } else if (args[0] === 'disable') {
            privategc_.splice(from, 1)
            fs.writeFileSync('./src/privategc.json', JSON.stringify(privategc_))
            reply(`${txtlang.succnonactprivategc()} ✔️`)
          } else {
            reply(txtlang.enaordisa())
          }
        break
        case 'leave':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          setTimeout( () => {
            MUT.groupLeave (from)
          }, 5000)
          setTimeout( () => {
            if (pttmode == 'true') {
              if (txtlang == ind) {
                indgoodbye = fs.readFileSync('./media/ptt/goodbyeind.mp3')
                MUT.sendMessage(from, indgoodbye, audio, { mimetype: 'audio/mp4', quoted:mek, ptt: true})
              } else {
                audgoodbye = fs.readFileSync('./media/ptt/goodbye.mp3')
                MUT.sendMessage(from, audgoodbye, audio, { mimetype: 'audio/mp4', quoted:mek, ptt: true})
              }
            } else if (pttmode = 'false') {
              MUT.sendMessage(from, txtlang.goodbye(), text)
            }
          }, 0)
        break
        case 'closegc':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          if (!isBotGroupAdmins) return reply(txtlang.onlybadmin())
          var nomor = mek.participant
          const close = {
            text: `${txtlang.gcclosed(nomor)}`,
            contextInfo: { mentionedJid: [nomor] }
          }
          MUT.groupSettingChange (from, GroupSettingChange.messageSend, true);
          reply(close)
        break
        case 'opengc':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          if (!isBotGroupAdmins) return reply(txtlang.onlybadmin())
          open = {
            text: `${txtlang.gcopened(sender)}`,
            contextInfo: { mentionedJid: [sender] }
          }
          MUT.groupSettingChange (from, GroupSettingChange.messageSend, false)
          MUT.sendMessage(from, open, text, {quoted: mek})
        break
        case 'setpttmode':
          if (args.length < 1) return reply('.....')
          if (!isOwner) return reply(txtlang.onlyowner())
          if (args[0] == 'true') {
            pttmode = 'true'
            reply(txtlang.pttmodechanged() + ` ${pttmode}`)
            console.log(color('[INFO]', 'green'), color(`${txtlang.pttmodechanged()} : ${pttmode}`, 'yellow'));
          } else if (args[0] == 'false') {
            pttmode = 'false'
            reply(txtlang.pttmodechanged() + ` ${pttmode}`)
            console.log(color('[INFO]', 'green'), color(`${txtlang.pttmodechanged()} : ${pttmode}`, 'yellow'));
          } else {
            reply(txtlang.wrongf())
          }
        break
        case 'stiker':
        case 'sticker':
          if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
            const media = await MUT.downloadAndSaveMediaMessage(encmedia)
            ran = getRandom('.webp')
            await ffmpeg(`./${media}`)
            .input(media)
            .on('start', function (cmd) {
              console.log(`Started : ${cmd}`)
            })
            .on('error', function (err) {
              console.log(`Error : ${err}`)
              fs.unlinkSync(media)
              reply(txtlang.fail())
            })
            .on('end', function () {
              console.log('Finish')
              exec(`webpmux -set exif ${addMetadata('BOT', authorname)} ${ran} -o ${ran}`, async (error) => {
                if (error) return reply(txtlang.fail())
                MUT.sendMessage(from, fs.readFileSync(ran), sticker, {quoted: mek})
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              })
            })
            .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
            .toFormat('webp')
            .save(ran)
          } else if ((isMedia && mek.message.videoMessage.seconds < 11 || isQuotedVideo && mek.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
            const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
            const media = await MUT.downloadAndSaveMediaMessage(encmedia)
            ran = getRandom('.webp')
            reply(txtlang.wait())
            await ffmpeg(`./${media}`)
            .inputFormat(media.split('.')[1])
            .on('start', function (cmd) {
              console.log(`Started : ${cmd}`)
            })
            .on('error', function (err) {
              console.log(`Error : ${err}`)
              fs.unlinkSync(media)
              tipe = media.endsWith('.mp4') ? 'video' : 'gif'
              reply(txtlang.fail())
            })
            .on('end', function () {
              console.log('Finish')
              exec(`webpmux -set exif ${addMetadata('BOT', authorname)} ${ran} -o ${ran}`, async (error) => {
                if (error) return reply(txtlang.fail())
                MUT.sendMessage(from, fs.readFileSync(ran), sticker, {quoted: mek})
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              })
            })
            .addOutputOptions([`-vcodec`,`libwebp`,`-vf`,`scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
            .toFormat('webp')
            .save(ran)
          } else if ((isMedia || isQuotedImage) && args[0] == 'nobg') {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo : mek
            const media = await MUT.downloadAndSaveMediaMessage(encmedia)
            ranw = getRandom('.webp')
            ranp = getRandom('.png')
            reply(txtlang.wait())
            keyrmbg = setting.removebgApiKey
            await removeBackgroundFromImageFile({path: media, apiKey: keyrmbg, size: 'auto', type: 'auto', ranp}).then(res => {
              fs.unlinkSync(media)
              let buffer = Buffer.from(res.base64img, 'base64')
              fs.writeFileSync(ranp, buffer, (err) => {
                if (err) return reply('Gagal, Terjadi kesalahan, silahkan coba beberapa saat lagi.')
              })
              exec(`ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${ranw}`, (err) => {
                fs.unlinkSync(ranp)
                if (err) return reply(txtlang.fail())
                exec(`webpmux -set exif ${addMetadata('BOT', authorname)} ${ranw} -o ${ranw}`, async (error) => {
                  if (error) return reply(txtlang.fail())
                  MUT.sendMessage(from, fs.readFileSync(ranw), sticker, {quoted: mek})
                  fs.unlinkSync(ranw)
                })
              })
            })
          } else {
            reply(txtlang.needimgcpt() + ' ' + txtlang.or() + ' ' + txtlang.needtagimgcpt())
          }
        break
        case 'toimg':
          if (!isQuotedSticker) return reply(txtlang.needtagstickcpt())
          reply(txtlang.wait())
          var encmedia_ = JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo
          var media_ = await MUT.downloadAndSaveMediaMessage(encmedia_)
          ran = getRandom('.png')
          exec(`ffmpeg -i ${media_} ${ran}`, (err) => {
            fs.unlinkSync(media_)
            if (err) return reply(txtlang.fail())
            buffer = fs.readFileSync(ran)
            MUT.sendMessage(from, buffer, image, {quoted: mek, caption: txtlang.done()})
            fs.unlinkSync(ran)
          })
        break
        case 'tomp3':
          if (!isQuotedVideo) return reply(txtlang.needtagvidcpt())
          reply(txtlang.wait())
          encmedia = JSON.parse(JSON.stringify(mek).replace('quotedM','m')).message.extendedTextMessage.contextInfo
          media = await MUT.downloadAndSaveMediaMessage(encmedia)
          ran = getRandom('.mp4')
          exec(`ffmpeg -i ${media} ${ran}`, (err) => {
            fs.unlinkSync(media)
            if (err) return reply(txtlang.fail())
            buffer = fs.readFileSync(ran)
            MUT.sendMessage(from, buffer, audio, {mimetype: 'audio/mp4', quoted: mek})
            fs.unlinkSync(ran)
          })
        break
        case 'level':
          if (!isLevelingOn) return reply(txtlang.levelingon())
          if (!isGroup) return reply(txtlang.onlygroup())
          const userLevel = getLevelingLevel(sender)
          const userXp = getLevelingXp(sender)
          if (userLevel === undefined && userXp === undefined) return reply(txtlang.levelnol())
          sem = sender.replace('@s.whatsapp.net','')
          resul = txtlang.levelview(sem, userXp, userLevel, pushname)
          MUT.sendMessage(from, resul, text, { quoted: mek})
          .catch(async (err) => {
            console.error(err)
          })
          break
        case 'leveling':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          if (args.length < 1) return reply(txtlang.enaordisa())
          if (args[0] === 'enable') {
            if (isLevelingOn) return reply(txtlang.levelingalron())
            _leveling.push(from)
            fs.writeFileSync('./src/leveling.json', JSON.stringify(_leveling))
            reply(txtlang.levelon())
          } else if (args[0] === 'disable') {
            _leveling.splice(from, 1)
            fs.writeFileSync('./src/leveling.json', JSON.stringify(_leveling))
            reply(txtlang.leveloff())
          } else {
            reply(txtlang.enaordisa())
          }
        break
        case 'setppgc':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          if (!isBotGroupAdmins) return reply(txtlang.onlybadmin())
          const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo: mek
          reply(txtlang.wait())
          const media = await MUT.downloadAndSaveMediaMessage(encmedia)
          await MUT.updateProfilePicture (from, media)
          reply(txtlang.done())
        break
        case 'delete':
        case 'del':
          if (!isGroup)return reply(txtlang.onlygroup())
          try {
            MUT.deleteMessage(from, { id: mek.message.extendedTextMessage.contextInfo.stanzaId, remoteJid: from, fromMe: true })
          } catch (e) {
            reply(txtlang.onlybotdel())
          }
        break
        case 'fitnah':
        case 'fake':
          if (args.length < 1) return reply(txtlang.exafakecmd())
          var gh = body.slice(7)
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          var replace = gh.split("|")[0];
          var target = gh.split("|")[1];
          var bot = gh.split("|")[2];
          MUT.sendMessage(from, `${bot}`, text, {
            quoted: {
              key: {
                fromMe: false, participant: `${mentioned}`, ...(from ? { remoteJid: from }: {})
              }, message: {
                conversation: `${target}`
              }
            }
          })
        break
        case 'setname':
          if (!isGroup) return reply(txtlang.onlygroup())
          if (!isGroupAdmins) return reply(txtlang.onlyadmin())
          if (!isBotGroupAdmins) return reply(txtlang.onlybadmin())
          let idgrup = `${from.split("@s.whatsapp.net")[0]}`;
          MUT.groupUpdateSubject(idgrup, `${body.slice(9)}`)
          reply(txtlang.namegcchanged())
        break
	default:
        if (isGroup && isSimi && budy != undefined) {
	  console.log(budy)
	  muehe = await simih(budy)
          console.log(muehe)
          reply(muehe)
        } else {
          console.log(color('[ERROR]','red'), 'Unregistered Command from', color(sender.split('@')[0]))
        }
      }
    } catch (e) {
      console.log('Error : %s', color(e, 'red'))
    }
  })
}
startsBaileysBot()
