module.exports = {
  config: {
    nama: "pay",
    penulis: "Range",
    kuldown: 10,
    peran: 0,
    tutor: "pay <id> <jumlah>"
  },

  Alya: async function ({ api, event, args, getData, setData, getAllData }) {
    try {
      const { senderID, threadID, messageID } = event;
      const targetFakeID = parseInt(args[0]);
      const amount = parseInt(args[1]);
      if (!targetFakeID || !amount) return api.sendMessage("Format tidak valid. Gunakan:\npay <fakeID penerima> <jumlah>", threadID, messageID);
      if (isNaN(targetFakeID) || isNaN(amount) || amount <= 0) return api.sendMessage("Harap masukkan ID dan jumlah yang valid. Jumlah harus lebih dari 0.", threadID, messageID);
      const senderData = await getData(senderID);
      if (!senderData || !senderData.money) {
        return api.sendMessage(
          "Data Anda tidak ditemukan. Pastikan Anda memiliki akun yang valid.",
          threadID,
          messageID
        );
      }
      if (senderData.money < amount) return api.sendMessage(`Anda tidak memiliki cukup uang. Saldo Anda: ${senderData.money}.`, threadID, messageID);
      const allUsers = await getAllData();
      const receiverEntry = Object.entries(allUsers).find(
        ([realID, userData]) => userData.fakeID === targetFakeID
      );
      if (!receiverEntry) return api.sendMessage("ID penerima tidak ditemukan. Pastikan ID yang Anda masukkan benar.", threadID, messageID);
      const [receiverRealID, receiverData] = receiverEntry;
      senderData.money -= amount;
      receiverData.money = (receiverData.money || 0) + amount;
      await setData(senderID, senderData);
      await setData(receiverRealID, receiverData);      
       const userInfo = api.getUserInfo(receiverRealID);
      api.sendMessage(
        `Berhasil mengirim ${amount} money ke ${userInfo[receiverRealID].name} dengan ID : ${targetFakeID}`,
        threadID,
        messageID
      );

      api.sendMessage(
        `Anda menerima ${amount} money dari ${userInfo[senderID].name}. Saldo Anda sekarang: ${receiverData.money}.`,
        receiverRealID, 
        messageID
      );
    } catch (error) {
      console.error("Terjadi kesalahan dalam proses pembayaran:", error.message);
      return api.sendMessage(
        "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi nanti.",
        event.threadID,
        event.messageID
      );
    }
  }
};
