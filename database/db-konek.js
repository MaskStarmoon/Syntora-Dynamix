const axios = require('axios');
const BASE_URL = global.Syntora.config.dbUrl;

const getData = async (real_id = null) => {
  try {
    const url = real_id ? `${BASE_URL}${real_id}.json` : `${BASE_URL}.json`;
    const response = await axios.get(url);
    return response.data || (real_id ? null : {}); 
  } catch (error) {
    console.error('Gagal mendapatkan data:', error.message);
    throw error;
  }
};

const setData = async (real_id, data) => {
  try {
    await axios.put(`${BASE_URL}${real_id}.json`, data);
    return { success: true, message: 'Data berhasil disimpan.' };
  } catch (error) {
    console.error('Gagal menyimpan data:', error.message);
    throw error;
  }
};

const generateFakeID = async () => {
  try {
    const response = await axios.get(`${BASE_URL}.json`);
    let maxFakeID = 0;

    if (response.data) {
      Object.values(response.data).forEach(item => {
        if (item.fakeID && item.fakeID > maxFakeID) {
          maxFakeID = item.fakeID;
        }
      });
    }

    return maxFakeID + 1;
  } catch (error) {
    console.error('Gagal menghasilkan fakeID:', error.message);
    throw error;
  }
};

const createData = async (real_id) => {
  try {
    const fakeID = await generateFakeID();
    const name = "Unknown";
    const newData = {
      name,
      fakeID,
      exp: 0,
      money: 0,
      banned: 0
    };
    await setData(real_id, newData);
    return { success: true, message: 'Data berhasil dibuat.', data: newData };
  } catch (error) {
    console.error('Gagal membuat data baru:', error.message);
    throw error;
  }
};

module.exports = { getData, setData, createData };
