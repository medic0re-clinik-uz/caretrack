const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('DB read error:', err);
    return { users: [], doctors: [], patients: [], illnesses: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('DB write error:', err);
    return false;
  }
};

module.exports = { readDB, writeDB };
