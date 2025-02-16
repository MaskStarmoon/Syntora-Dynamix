/* HADY ZEN'IN edit by Range */

 const express = require('express');
 const app = express();
 const axios = require('axios');
 const login = require("./hady-zen/alya-fca");
 const { warna, font, logo } = require("./hady-zen/log.js");
 const fs = require("fs");
 const path = require("path");
 const akun = fs.readFileSync('akun.txt', 'utf8');
 const { log_bhs, code_bhs } = require('./bahasa/bahasa');
 const { awalan, nama, admin, proxy, port, notifKey, setting } = require('./config.json');
 global.Syntora = {};
 global.Syntora.config = require("./config.json");
 const { kuldown } = require('./hady-zen/kuldown');
 const { getData, createData, setData } = require('./database/db-konek.js');
 Syntora.getData = getData;
 Syntora.setData = setData;

async function notifErr(notif) { 
  try { 
 const oreki = `# 𝗡𝗼𝘁𝗶𝗳𝗶𝗸𝗮𝘀𝗶\n\nNama: ${nama}\nPesan: ${notif}`;
 const { data } = await axios.get(`https://api.callmebot.com/facebook/send.php?apikey=${notifKey}&text=${encodeURIComponent(oreki)}`);
   console.log(logo.cmds + 'Notifikasi berhasil: ' + data);
  } catch (futaro) {
   console.log(logo.error + 'Kamu belum menyetel notifkey atau notifkey tidak valid.');
  }
}

async function loadC() {
  fs.readFileSync('config.json');
}
setInterval(function() { loadC(); }, 30000);
if (!akun || akun.length < 0) { console.log(logo.error + 'Harap masukkan cookie terlebih dahulu.'); }
const zen = { host: proxy, port: port };
login({appState: JSON.parse(akun, zen)}, setting, (err, api) => {
   if(err) { 
	   console.log(logo.error + `Terjadi kesalahan saat login: ${err.message}`);
	   notifErr(`Terjadi kesalahan saat login: ${err.message}`);
   }
	
   api.setOptions({listenEvents: true});
console.log(logo.login + 'Mulai menerima pesan dari pengguna.');
	  
   api.listenMqtt(async (err, event) => {
   const body = event.body;
   const real_id = event.senderID;
try {
      const userData = await Syntora.getData(real_id);
      if (userData && userData.banned === 1) {
        console.log(logo.warn + `User ${real_id} dibanned, tidak merespons.`);
        return;
      }
      } catch (error) {
     //skip console.error(logo.error + error.message);
      }
try {
    if (body && body.toLowerCase()) {
        const existingData = await getData(real_id);
        if (existingData) {
        console.log(logo.info + `Data untuk user ${real_id} sudah ada, skip pembuatan data baru.`);
        } else {
        const newData = await createData(real_id);
        console.log(logo.info + "Data berhasil dibuat:\n", newData);
      }
    }
  } catch (error) {
    console.error(logo.error + "Terjadi kesalahan:", error.message);
  }
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
    await Alya({ api, event, args, bhs, getData: Syntora.getData, setData: Syntora.setData });
    return;
}
if ((config.peran == 2 || config.peran == 1) && admin.includes(event.senderID) || config.peran == 0) {
    await Alya({ api, event, args, bhs, getData: Syntora.getData, setData: Syntora.setData });
    return;
} else if (config.peran == 1 && ff.includes(event.senderID) || config.peran == 0) {
    await Alya({ api, event, args, bhs, getData: Syntora.getData, setData: Syntora.setData });
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
