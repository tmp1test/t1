const db = require('../services').db;

/**
 * Создает таблицу
 */
exports.createTable = async function () {
  let connection = await db.getConnection();
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`authors\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY(id),
      UNIQUE KEY (name),
      FULLTEXT \`authors_ft_name\` (\`name\`)
    ) ENGINE=INNODB
  `);

  connection.release();
  return true;
}

/**
 * Удаляет таблицу
 */
exports.drop = async function () {
  let connection = await db.getConnection();

  await db.query('DROP TABLE IF EXISTS `authors`');
  connection.release();

  return true;
};

/**
 * Очищает таблицу
 */
exports.clear = async function () {
  let connection = await db.getConnection();
  
  await db.query('DELETE FROM `authors`');
  connection.release();

  return true;
};

/**
 * Возвращает айдишки случайных авторов
 * @param {number} limit - лимит
 */
exports.getRandomList = async function (limit) {
  let connection = await db.getConnection();

  // лимит можно ограничить, но в контексте теста это не важно
  // также как и скорость запроса
  let r = await connection.execute('SELECT `id`, `name` FROM `authors` ORDER BY RAND() LIMIT ?', [limit]);

  connection.release();

  return r[0];
};

/**
 * Вставляет переданный массив авторов в таблицу и возвращает количество вставленных записей
 * @param {Object} items - массив авторов
 */
exports.seed = async function (items) {
  let l = items.length;

  let replacements = [];
  let values = [];

  for (let i = 0; i < l; i++) {
    values.push(`(?)`);
    replacements.push(items[i].name);
  }

  
  let query = 'INSERT IGNORE INTO `authors` (`name`) VALUES ' + values.join(",");

  let connection = await db.getConnection();
  let r = await connection.execute(query, replacements);

  connection.release();

  return r[0].affectedRows;
}

/**
 * Возвращает автора по айди
 * @param {number} id - айди
 */
exports.getById = async function (id) {
  let connection = await db.getConnection();

  let r = await connection.execute('SELECT `id`, `name` FROM `authors` WHERE `id` = ?', [id]);

  connection.release();

  return r[0][0] || null;
};

/**
 * Возвращает автора по имени
 * @param {string} name - имя автора
 */
exports.getByName = async function (name) {
  let connection = await db.getConnection();

  let r = await connection.execute('SELECT `id`, `name` FROM `authors` WHERE `name` = ?', [name]);

  connection.release();

  return r[0][0] || null;
};