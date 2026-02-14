
const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require('fs');
const axios = require("axios").create({
  httpsAgent: new (require("https").Agent)({
    rejectUnauthorized: true,
  }),
});
const fontPath = "./hady-zen/asset/ShortBaby.ttf";
const filePath = "./hady-zen/asset/status_ddw.png";
const fontUrl = "https://cdn.glitch.global/879acb21-cf87-407e-9394-5807551d147b/ShortBaby.ttf?v=1738030514024";
const { awalan } = global.config;
 
module.exports = { 
  config: { 
    nama: "ddw",
    penulis: "Range, Ian", 
    kuldown: 10,
    peran: 0,
    tutor: "Dynamix Dream World"
  }, 
 
  Alya: async function ({ api, event, args, getData, setData, getAllData }) { 
    const awal = args[0];
    const userID = event.senderID;
    const isAdmin = global.config.admin.includes(userID);
    let userData = await getData(userID);
    const statusTitle = await getTitle();
      console.log(statusTitle);
    const pilih = ["buat", "leveling", "party", "pvp", "dungeon", "status", "top"];
      
    // 1. Buat karakter dan pilih class
    if (awal === pilih[0]) {
      if (userData.charDDW) {
        return api.sendMessage("Kamu sudah memiliki karakter!", event.threadID, event.messageID);
      }
      const charName = args[1];
      const charClass = args[2];
      if (!charName || !["Warrior", "Mage", "Archer", "Assassin"].includes(charClass)) {
        return api.sendMessage("Gunakan format: /ddw buat [NamaKarakter] [Class]\nClass yang tersedia: Warrior, Mage, Archer, Assassin", event.threadID, event.messageID);
      }
      userData.charDDW = {
    charName: charName,
    charClass,
    charExp: 0,
    charCP: 0,
    charWeapon: charClass === "Warrior" ? "Pedang" :
                charClass === "Mage" ? "Tongkat Sihir" :
                charClass === "Archer" ? "Busur" : "Dagger",
    charWM: 0,
    charTitle: "-",
    charWins: 0,
    charLoses: 0,
    charRank: "Bronze",
    charTimeCreate: Date.now()
};
      await setData(userID, userData);
      return api.sendMessage(`🎮 Selamat Datang Di Dunia Dynamix Dream World (DDW)!\n👋 User ${charName}, Kamu pasti akan menjadi ${charClass} yang hebat suatu hari nanti!\n✨ Petualanganmu baru saja dimulai...`, event.threadID, event.messageID);
    }
 
    // 2. Leveling untuk mendapatkan money dan charExp
    else if (awal === pilih[1]) {
    if (!userData.charDDW) {
        // skip
      } else {
    const levelingCost = 100;
    if (!userData.money || userData.money < levelingCost) return api.sendMessage(`Kamu membutuhkan ${levelingCost} uang untuk melakukan leveling. Uang kamu saat ini: ${userData.money || 0}`, event.threadID, event.messageID);
 
    const expGained = Math.floor(Math.random() * 50) + 10;
    const moneyGained = Math.floor(Math.random() * 100) + 20;
    userData.money -= levelingCost;
    userData.charDDW.charExp += expGained;
    userData.charDDW.charCP = Math.floor(userData.charDDW.charExp / 4);
    userData.money = (userData.money || 0) + moneyGained;
 
    await setData(userID, userData);
    return api.sendMessage(`Leveling selesai!\nExp: +${expGained}\nCP: ${userData.charDDW.charCP}\nMoney: +${moneyGained}`, event.threadID, event.messageID);
      }
  }
 
    // 3. Membuat party sementara
    else if (awal === pilih[2]) {

    const action = args[1];
    const partyName = args.slice(2).join(" ");
    const data = await getData(userID);

    if (action === "create") {

        if (partyName.length > 10)
            return api.sendMessage("Nama party terlalu panjang.", event.threadID, event.messageID);

        if (data.charDDW[userID])
            return api.sendMessage("Kamu sudah memiliki party yang aktif.", event.threadID, event.messageID);

        const createdAt = Date.now();

        data.charDDW[userID] = {
            partyName,
            leader: userID,
            members: [userID],
            createdAt
        };

        await setData(userID, data);

        return api.sendMessage(`Party "${partyName}" berhasil dibuat!`, event.threadID, event.messageID);
    }

    else if (action === "leave") {

        if (!data.charDDW[userID])
            return api.sendMessage("Kamu tidak sedang berada dalam party.", event.threadID, event.messageID);

        const leaveCost = 15000;

        if (!data.money || data.money < leaveCost)
            return api.sendMessage(`Butuh ${leaveCost} uang untuk keluar party. Uang kamu: ${data.money || 0}`, event.threadID, event.messageID);

        const party = data.charDDW[userID];

        const leaderData = await getData(party.leader);

        leaderData.charDDW[party.leader].members =
            leaderData.charDDW[party.leader].members.filter(id => id !== userID);

        await setData(party.leader, leaderData);

        data.money -= leaveCost;
        delete data.charDDW[userID];

        await setData(userID, data);

        return api.sendMessage(`Kamu keluar dari party "${party.partyName}" (-15000 uang).`, event.threadID, event.messageID);
    }

    else if (action === "check") {

        if (!data.charDDW[userID])
            return api.sendMessage("Kamu tidak sedang dalam party.", event.threadID, event.messageID);

        const party = data.charDDW[userID];
        const memberList = party.members.map(id => `- ${id}`).join("\n");
        const userInfo = await api.getUserInfo(party.leader);
        const nameLeader = userInfo[party.leader].name;

        return api.sendMessage(
            `📜 Status Party:\nNama: ${party.partyName}\nLeader: ${nameLeader}\nAnggota:\n${memberList}`,
            event.threadID,
            event.messageID
        );
    }

    else {
        return api.sendMessage(
`Gunakan:
- ${awalan}ddw party create [nama]
- ${awalan}ddw party join [nama]
- ${awalan}ddw party leave
- ${awalan}ddw party check`,
        event.threadID, event.messageID);
    }
}
 
 
    // 4. Player vs Player (PvP)
    else if (awal === pilih[3]) {

    const targetID = args[1];
    const action = args[2];

    if (!targetID || action !== "start")
        return api.sendMessage(`Gunakan: ${awalan}ddw pvp <UserID> start`, event.threadID, event.messageID);

    if (!userData.charDDW)
        return api.sendMessage("Buat karakter dulu!", event.threadID, event.messageID);

    if (userData.charDDW.charCP < 5000)
        return api.sendMessage("Minimal 5000 CP untuk PvP!", event.threadID, event.messageID);

    const targetData = await getData(targetID);

    if (!targetData || !targetData.charDDW)
        return api.sendMessage("Target tidak punya karakter!", event.threadID, event.messageID);

    if (targetData.charDDW.charCP < 5000)
        return api.sendMessage("Target belum mencapai 5000 CP!", event.threadID, event.messageID);

    if (!global.pvpRequests) global.pvpRequests = {};

    const requestKey = `${userID}_${targetID}`;
    const reverseKey = `${targetID}_${userID}`;

    if (global.pvpRequests[reverseKey]) {

        delete global.pvpRequests[reverseKey];

        const myCP = userData.charDDW.charCP;
        const enemyCP = targetData.charDDW.charCP;

        const roll = Math.random() * (myCP + enemyCP);
        const winnerID = roll < myCP ? userID : targetID;
        const loserID = winnerID === userID ? targetID : userID;

        const reward = 2000;

        const winnerData = await getData(winnerID);
        const loserData = await getData(loserID);

        winnerData.charDDW.charWins++;
        loserData.charDDW.charLoses++;

        function getRank(wins) {
            if (wins >= 50) return "Mythic";
            if (wins >= 30) return "Diamond";
            if (wins >= 20) return "Platinum";
            if (wins >= 10) return "Gold";
            if (wins >= 5) return "Silver";
            return "Bronze";
        }

        winnerData.charDDW.charRank = getRank(winnerData.charDDW.charWins);
        loserData.charDDW.charRank = getRank(loserData.charDDW.charWins);

        winnerData.money += reward;
        loserData.money = Math.max(0, loserData.money - reward);

        await setData(winnerID, winnerData);
        await setData(loserID, loserData);

        return api.sendMessage(
`⚔ PvP Result ⚔

🏆 Winner: ${winnerData.charDDW.charName}
💰 +${reward} uang

💀 Loser: ${loserData.charDDW.charName}
💸 -${reward} uang`,
        event.threadID, event.messageID);
    }

    global.pvpRequests[requestKey] = true;

    return api.sendMessage(
`Tantangan dikirim ke ${targetID}.
Minta dia ketik:
${awalan}ddw pvp ${userID} start`,
    event.threadID, event.messageID);
}
    // 5. Memasuki Dungeon
    else if (awal === pilih[4]) {
    const dungeonName = args[1];
    if (!dungeonName) return api.sendMessage("Masukkan nama dungeon yang ingin kamu masuki.", event.threadID, event.messageID);
 
    const userData = await getData(userID);
    if (!userData.charDDW || !userData.charDDW[userID]) {
        return api.sendMessage("Kamu harus berada dalam party untuk masuk dungeon!", event.threadID, event.messageID);
    }
      const dungeonCost = 2500;
    if (!userData.money || userData.money < dungeonCost) return api.sendMessage(`Kamu membutuhkan ${dungeonCost} uang untuk melakukan leveling. Uang kamu saat ini: ${userData.money}`, event.threadID, event.messageID);
 
 
    const allData = await getAllData();
    if (!global.dungeonSessions) global.dungeonSessions = {};
 
    if (global.dungeonSessions[dungeonName]) {
        const dungeon = global.dungeonSessions[dungeonName];
 
        if (dungeon.isActive) return api.sendMessage("Dungeon sedang berlangsung, tunggu sesi berikutnya!", event.threadID, event.messageID);
 
        if (dungeon.totalPlayers < 20) {
            dungeon.parties.push(userData.charDDW[userID]);
            dungeon.totalPlayers += userData.charDDW[userID].members.length;
            userData.money -= dungeonCost;
            await setData(userID, userData);
            return api.sendMessage(`Party "${userData.charDDW[userID].partyName}" berhasil masuk ke dungeon "${dungeonName}"!`, event.threadID, event.messageID);
        } else {
            return api.sendMessage("Dungeon sudah penuh! Tunggu sesi berikutnya.", event.threadID, event.messageID);
        }
    }
 
    global.dungeonSessions[dungeonName] = {
        parties: [userData.charDDW[userID]], 
        totalPlayers: userData.charDDW[userID].members.length,
        isActive: false
    };
      
    userData.money -= dungeonCost;
    await setData(userID, userData);
    api.sendMessage(`Dungeon "${dungeonName}" dibuat dan party "${userData.charDDW[userID].partyName}" telah masuk!`, event.threadID, event.messageID);
 
    setTimeout(() => startDungeon(dungeonName), 30000);
}
 
    // 6. Menampilkan status karakter pengguna
    else if (awal === pilih[5]) {
      const char = userData.charDDW;
      const exp = char.charExp;
      const totalExp = exp + 100;
      let level = Math.floor(totalExp / 100);
      
      if (args[1] === "text") {

    const wins = char.charWins || 0;
    const loses = char.charLoses || 0;
    const totalMatch = wins + loses;
    const winRate = totalMatch > 0 ? ((wins / totalMatch) * 100).toFixed(1) : 0;

    return api.sendMessage(
`📊 STATUS KARAKTER

👤 Name: ${char.charName}
⚔ Class: ${char.charClass}
🏅 Rank: ${char.charRank}
⭐ Level: ${level}
💥 CP: ${char.charCP}

🏆 Win: ${wins}
💀 Lose: ${loses}
📈 Win Rate: ${winRate}%

🎖 Title: ${char.charTitle}`,
    event.threadID, event.messageID);
}
 
      try {
        const background = await loadImage("https://cdn.glitch.global/879acb21-cf87-407e-9394-5807551d147b/ddwStatus.png?v=1738029799975");
        const { width, height } = background;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        const sty = (200, 200);
 
        registerFont(fontPath, { family: "ShortBaby" });
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
 
        const paddingRight = 900;
        const rightX = canvas.width - paddingRight;
        ctx.fillStyle = "#ffffff";
        ctx.font = "80px ShortBaby"; 
        const title = "Status Karakter";
        const titleWidth = ctx.measureText(title).width;
        const titleX = rightX - titleWidth; 
        const titleY = 310;
        ctx.fillText(title, titleX, titleY);
 
        ctx.font = "80px ShortBaby";
        const infoStartY = 458;
        const infoSpacing = 125;
 
        ctx.fillText(`  ${char.charName}`, rightX - 200, infoStartY); 
        ctx.fillText(` ${char.charClass}`, rightX - 200, infoStartY + infoSpacing);
        ctx.fillText(` ${level}`, rightX - 200, infoStartY + (2 * infoSpacing));
        ctx.fillText(`${char.charExp}`, rightX - 200, infoStartY + (3 * infoSpacing));
        ctx.fillText(`      ${char.charWeapon}`, rightX - 200, infoStartY + (4 * infoSpacing));
        ctx.fillText(`             ${char.charCP}`, rightX - 200, infoStartY + (5 * infoSpacing));
 
        const expBarWidth = 600;
        const gerak = 1350;
        const samping = 150;
        const expPercentage = (char.charExp % 100) / 100;
        ctx.fillStyle = "#555555";
        ctx.fillRect(samping, gerak, expBarWidth, 30);
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(samping, gerak, expBarWidth * expPercentage, 30);
        fs.writeFileSync(filePath, canvas.toBuffer());
        api.sendMessage(
          {
            body: `📊 Status Karakter ${char.charName}`,
            attachment: fs.createReadStream(filePath),
          },
          event.threadID,
          event.messageID,
        );
      } catch (error) {
        api.sendMessage(
          "Terjadi kesalahan saat memuat status karakter.",
          event.threadID,
          event.messageID
        );
      }
      setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Terjadi kesalahan saat menghapus file:", err);
      } else {
        console.log("File gambar telah dihapus!");
      }
    });
  }, 4000)
      }
      }
    // 7. Menampilkan daftar Top berdasarkan Combat Power (charCP)
    else if (awal === pilih[6]) {
  const allUsers = await getAllData();
  const allCharacters = Object.values(allUsers)
    .filter(user => user.charDDW) 
    .map(user => ({
      charName: user.charDDW.charName,
      charCP: user.charDDW.charCP
    }));
  if (allCharacters.length === 0) return api.sendMessage("Belum ada karakter yang terdaftar di dunia ini.", event.threadID, event.messageID);
  const sortedCharacters = allCharacters.sort((a, b) => b.charCP - a.charCP);
  const topList = sortedCharacters.slice(0, 10)
    .map((char, index) => `${index + 1}. ${char.charName} - CP: ${char.charCP}`)
    .join("\n");
  api.sendMessage(`🏆 Top 10 Combat Power (CP):\n\n${topList}`, event.threadID, event.messageID);
} else {
  if (!userData.charDDW) { api.sendMessage("Daftarkan diri mu untuk bergabung ke dunia ini!, Gunakan /ddw buat", event.threadID, event.messageID); }
    api.sendMessage("Perintah tidak dikenali. Gunakan salah satu dari perintah berikut:\n- buat\n- leveling\n- party\n- pvp\n- dungeon\n- status\n- top", event.threadID, event.messageID);
    }
    async function startDungeon(dungeonName) {
    const dungeon = global.dungeonSessions[dungeonName];
    if (!dungeon || dungeon.isActive) return;
 
    dungeon.isActive = true;
    const partyCount = dungeon.parties.length;
    let duration = partyCount === 5 ? 10 : Math.floor(Math.random() * (10 - 5 + 1)) + 5;
 
    api.sendMessage(`Dungeon "${dungeonName}" telah dimulai! Waktu penyelesaian: ${duration} menit.`, event.threadID);
 
    setTimeout(async () => {
        completeDungeon(dungeonName);
    }, duration * 60000);
}
  async function completeDungeon(dungeonName) {
    const dungeon = global.dungeonSessions[dungeonName];
    if (!dungeon) return;
 
    let playerStats = [];
    let penalizedPlayers = new Set();
 
    for (const party of dungeon.parties) {
        for (const memberID of party.members) {
            const userData = await getData(memberID);
            if (!userData.charDDW || !userData.charDDW.charCP) continue;
            playerStats.push({
                memberID,
                CP: userData.charDDW.charCP,
                wins: userData.charDDW.wins || 0
            });
        }
    }
 
    playerStats.sort((a, b) => b.CP - a.CP);
    // Penalti EXP bagi top 10 CP tertinggi setelah menang 4-10 kali
    for (let i = 0; i < Math.min(10, playerStats.length); i++) {
        let player = playerStats[i];
        const userData = await getData(player.memberID);
        
        userData.charDDW.wins = userData.charDDW.wins + 1;
 
        if (userData.charDDW.wins >= Math.floor(Math.random() * (10 - 4 + 1)) + 4) {
            userData.charDDW.isDead = true;
            userData.charDDW.charExp = Math.max(0, userData.charDDW.charExp - 2500); // Kurangi 2500 EXP
            userData.charDDW.wins = 0; // Reset kemenangan setelah mati
            penalizedPlayers.add(player.memberID);
            api.sendMessage(`💀 Kamu telah kalah karena terlalu kuat! CP terlalu tinggi dan sudah bertahan ${userData.charDDW.wins} kali. EXP berkurang 2500.`, player.memberID);
        } else {
          penalizedPlayers.delete(player.memberID);
          
        }
 
        await setData(player.memberID, userData);
    }
 
    // Berikan reward seperti sebelumnya
    let expReward = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
    let moneyReward = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
    
    let totalCP = playerStats.reduce((sum, p) => sum + p.CP, 0);
 
    for (const player of playerStats) {
      if (penalizedPlayers.has(player.memberID)) continue;
        const userData = await getData(player.memberID);
        let expShare = Math.round((player.CP / totalCP) * expReward);
        let moneyShare = Math.round((player.CP / totalCP) * moneyReward);
 
        userData.charDDW.charExp += expShare;
        userData.money += moneyShare;
 
        await setData(player.memberID, userData);
        api.sendMessage(`🏆 Dungeon selesai! Kamu mendapat ${expShare} EXP dan ${moneyShare} uang.`, player.memberID);
    }
 
    api.sendMessage("🏰 Dungeon selesai! Semua hadiah telah dibagikan.", event.threadID);
    delete global.dungeonSessions[dungeonName];
}
    async function getTitle() {
    try {
        const allUsers = await getAllData();
        const allCharacters = Object.values(allUsers)
            .filter(user => user.charDDW)
            .map(user => ({
                userID: user.userID,
                charName: user.charDDW.charName,
                charCP: user.charDDW.charCP
            }));
 
        const sortedCharacters = allCharacters.sort((a, b) => b.charCP - a.charCP);
        const userIndex = sortedCharacters.findIndex(user => user.userID === userID);
        const topDDW = userIndex !== -1 && userIndex < 10 ? `#${userIndex + 1}` : "Tidak masuk top";
        const prompt = `Berikan satu title kepada user yang telah mendapatkan ${userData.charDDW.charExp} EXP dan ${userData.charDDW.charCP} Combat Power (CP) dan berada di ranking ${topDDW}, tandai title-nya dengan **.`;
        const response = await axios.get(`https://api-rangestudio.vercel.app/api/gemini?text=${encodeURIComponent(prompt)}&maxline?=10`);
        const fullText = response.data.answer.trim();
        const match = fullText.match(/\*([^*]+)\*/);
        const title = match ? match[1] : "-";
 
        userData.charDDW.charTitle = title;
        return await setData(userID, userData);    
    } catch (error) {
        console.log("Gagal mendapatkan title dari AI, menggunakan title default.", error.message);
    }
}
   }
};
