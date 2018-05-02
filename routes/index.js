const fs = require('fs');
const path = require('path');

let isInited = false;

exports.init = async (router) => {
  if (isInited) {
    return false;
  }

  isInited = true;

  // Инициализируем роуты
  fs.readdirSync(__dirname).filter((file) => {
    return file.endsWith('.js') > 0 && file !== 'index.js' && fs.statSync(path.join(__dirname, file)).isFile();
  }).forEach(function (file) {
    require(path.join(__dirname, file))(router);
  });
};