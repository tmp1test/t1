const mysql = require('mysql2/promise');
const _ = require('lodash');

let config = require('../config/config.json').database;
if (!_.isObject(config)) {
  config = {};
}

// Инстанс пула коннектов к базе данных
module.exports = mysql.createPool({
  connectionLimit: config.connectionLimit || 10,
  host: config.host || 'localhost',
  user: config.username || '',
  password: config.password || '',
  database: config.database || '',
  dateStrings: !!config.dateStrings
});
