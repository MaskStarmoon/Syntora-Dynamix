/* HADY ZEN'IN */

 const express = require('express');
 const app = express();
 const axios = require('axios');
 const login = require("./hady-zen/alya-fca");
 const { warna, font, logo } = require("./hady-zen/log.js");
 const fs = require("fs");
 const path = require("path");
 const akun = fs.readFileSync('akun.txt', 'utf8');
 const { log_bhs, code_bhs } = require('./bahasa/bahasa');
 const { awalan, nama, admin, proxy, port } = require('./config.json');
 const { kuldown } = require('./hady-zen/kuldown');

if (!akun || akun.length < 0) return console.log(logo.error + 'Harap masukkan cookie terlebih dahulu.');
const zen = { host: proxy, port: port };
login({appState: JSON.parse(akun, zen)}, (err, api) => {
   if(err) return console.log(logo.error + `Terjadi kesalahan saat login: ${err.message}`);
	
   api.setOptions({listenEvents: true});
console.log(logo.login + 'Mulai menerima pesan dari pengguna.');
	  
   api.listenMqtt((err, event) => {
   const body = event.body;
if (!body) return;
if (body.toLowerCase() == "prefix") return api.sendMessage(`✨ Awalan ${nama} adalah: [ ${awalan} ]`, event.threadID, event.messageID);
if (!body.startsWith(awalan) || body == " ") return console.log(logo.pesan + `${event.senderID} > ${body}`);
        const saveng = body.slice(awalan.length).trim().split(/ +/g);
        const cmd = saveng.shift().toLowerCase();
	   
            async function hady_cmd(cmd, api, event) {
       const pipi = body?.replace(`${awalan}${cmd}`, "")?.trim();
       const args = pipi?.split(' ');

	 try {
       const skibidi = await new Promise((resolve, reject) => { api.getThreadInfo(event.threadID, (err, info) => { if (err) reject(err); else resolve(info); }); });
       const fitri = skibidi.adminIDs.map(admin => admin.id);
       const ff = fitri.join(", ");
       const files = fs.readdirSync(path.join(__dirname, '/perintah'));
       for (const file of files) {
   if (file.endsWith('.js')) {
       const anime = path.join(path.join(__dirname, '/perintah'), file);
       const { config, Alya, bahasa } = require(anime);

   if (config && config.nama === cmd && typeof Alya === 'function') {
      console.log(logo.cmds + `Berhasil menjalankan perintah ${config.nama}.`);
       const bhs = function(veng) { 
	 return bahasa[code_bhs][veng];
       };	
   
   if (kuldown(event.senderID, config.nama, config.kuldown) == 'hadi') { 
	   
if (config.peran == 0 || !config.peran) {
    await Alya({ api, event, args, bhs });
    return;
}
if ((config.peran == 2 || config.peran == 1) && admin.includes(event.senderID) || config.peran == 0) {
    await Alya({ api, event, args, bhs });
    return;
} else if (config.peran == 1 && ff.includes(event.senderID) || config.peran == 0) {
    await Alya({ api, event, args, bhs });
    return;
} else { 
    api.setMessageReaction("❕", event.messageID);
}

  } else {
   api.setMessageReaction('⌛', event.messageID);
   }
  } 
 }
}
 } catch (error) {
   console.log(logo.error + 'Perintah error: ' + error.message);
 }
}
 hady_cmd(cmd, api, event);
 });
});

app.listen(port, () => { });
app.get('/', (req, res) => { 
 res.sendFile(path.join(__dirname, 'hady-zen', 'hadi.html'));
});

process.on('unhandledRejection', (reason) => {
	console.log(logo.error + 'Unhandled promise rejection:', reason.message);
});
process.on('uncaughtException', (err) => {
	console.log(logo.error + 'Uncaught exception:', err.message);
});
