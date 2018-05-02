const fs = require('fs');
const path = require('path');

let items = {};

fs.readdirSync(__dirname).filter((file) => {
  return file.endsWith('.js') > 0 && file !== 'index.js' && fs.statSync(path.join(__dirname, file)).isFile();
}).forEach(function (file) {
  items[file.split('.')[0]] = require(path.join(__dirname, file));
});

module.exports = items;
