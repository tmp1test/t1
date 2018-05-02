const db = require('../services').db;
const types = require('../services').types;
const _ = require('lodash');
const moment = require('moment');
const authorsModel = require('./authors');

/**
 * Создает таблицу
 */
exports.createTable = async function () {
  let connection = await db.getConnection();

  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`books\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`title\` varchar(255) NOT NULL,
      \`description\` text NOT NULL,
      \`image\` varchar(255) NOT NULL,
      \`author_id\` int(11) NOT NULL,
      \`date\` date NOT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY(id),
      FOREIGN KEY (author_id) REFERENCES authors(id) ON UPDATE CASCADE ON DELETE CASCADE,
      UNIQUE KEY (author_id, title),
      INDEX \`books_title\` (\`title\`),
      FULLTEXT \`books_ft_title\` (\`title\`),
      FULLTEXT \`books_ft_description\` (\`description\`),
      INDEX \`books_image\` (\`image\`),
      INDEX \`books_date\` (\`date\`)
    ) ENGINE=INNODB
  `);

  connection.release();

  return true;
};

/**
 * Удаляет таблицу
 */
exports.drop = async function () {
  let connection = await db.getConnection();

  await connection.query('DROP TABLE IF EXISTS `books`');
  connection.release();

  return true;
};

/**
 * Вставляет переданный массив книг в таблицу и возвращает количество вставленных записей
 * @param {Object} items - массив книг
 */
exports.seed = async function (items) {
  let l = items.length;

  let replacements = [];
  let values = [];

  for (let i = 0; i < l; i++) {
    values.push(`(?, ?, ?, ?, ?)`);
    replacements.push(items[i].title, items[i].date, items[i].authorId, items[i].description, items[i].image);
  }

  let query = 'INSERT IGNORE INTO `books` (`title`, `date`, `author_id`, `description`, `image`) VALUES ' + values.join(",");

  let connection = await db.getConnection();
  let r = await connection.query(query, replacements);

  connection.release();

  return r[0].affectedRows;
};

/**
 * Получение списка книг
 * @param {Object} options - объект опций
 * @param {number} options.limit - лимит
 * @param {number} options.offset - смещение
 * @param {Object} options.filter - объект фильтра
 * @param {string} options.filter.order - сортировка
 * @param {string} options.filter.title - условие по тайтлу
 * @param {string} options.filter.description - условие по описанию
 * @param {string} options.filter.image - условие по картинке
 * @param {string} options.filter.date - условие по дате
 * @param {string} options.filter.author - условие по автору
 */
exports.getList = async function (options) {
  if (_.isObject.options) {
    options = {};
  }
  
  let filter = _.isObject(options.filter) ? options.filter : {};
  let order = this.getOrder(filter.order);

  let replacements = [];
  let join = '';
  if (filter.author && typeof filter.author === 'string') {
    join = `AND MATCH(a.name) AGAINST (?)`;
    replacements.push(filter.author);
  }

  let parts = [];
  if (filter.date && typeof filter.date === 'string') {
    parts.push('b.date = ?');
    replacements.push(filter.date);
  }

  if (filter.image && typeof filter.image === 'string') {
    parts.push('b.image = ?');
    replacements.push(filter.image);
  }

  if (filter.title && typeof filter.title === 'string') {
    parts.push('MATCH(b.title) AGAINST (?)');
    replacements.push(filter.title);
  }

  if (filter.description && typeof filter.description === 'string') {
    parts.push('MATCH(b.description) AGAINST (?)');
    replacements.push(filter.description);
  }

  let where = parts.length ? `WHERE ${parts.join(" AND ")}` : '';

  let query = `
    SELECT 
      b.id AS id, b.title AS title, b.description AS description, b.image AS image, b.date AS date, a.name AS author
    FROM \`books\` b
    INNER JOIN \`authors\` a ON a.id = b.author_id ${join}
    ${where}
    ${order ? `ORDER BY ${order}` : ``}
    LIMIT ${options.limit || 20}
    OFFSET ${options.offset || 0}
  `;

  let connection = await db.getConnection();
  let r = await connection.execute(query, replacements);

  connection.release();

  return r[0];
};

/**
 * Получение книги по айди
 * @param {number} id - айди книги
 */
exports.getById = async function (id) {
  let connection = await db.getConnection();

  let r = await connection.execute(`
    SELECT 
      b.id AS id, b.title AS title, b.description AS description, b.image AS image, b.date AS date, a.name AS author
    FROM \`books\` b
    INNER JOIN \`authors\` a ON a.id = b.author_id
    WHERE b.id = ?
    LIMIT 1
  `, [id]);

  connection.release();

  return r[0][0] || null;
};

/**
 * Валидация книги
 * @param {Object} book - объект книги
 * @param {string} book.title - название книги
 * @param {string} book.description - описание книги
 * @param {string} book.image - изображение
 * @param {string} book.date - дата в формате YYYY-MM-DD
 * @param {number} book.author - автор книги
 */
exports.validate = async function (book) {
  if (!_.isObject(book)) {
    throw new types.ValidationError('Incorrect book object');
  }

  // проверяем тайтл
  if (!book.title || typeof book.title !== 'string' || book.title.length > 255) {
    throw new types.ValidationError('Incorrect book title');
  }

  // проверяем описание
  if (!book.description || typeof book.description !== 'string') {
    throw new types.ValidationError('Incorrect book description');
  }

  // тут нужно проверить поле image
  // точного требования к изображению нет
  if (!book.image || typeof book.image !== 'string' || book.image.length > 255) {
    throw new types.ValidationError('Incorrect book image');
  }

  // проверяем дату
  if (!moment(book.date, 'YYYY-MM-DD', true).isValid()) {
    throw new types.ValidationError('Incorrect book date');
  }

  if (book.author_id && typeof book.author_id === 'number') {
    if (book.author_id < 1 || !Number.isInteger(book.author_id)) {
      throw new types.ValidationError('Incorrect author id');
    }

    let author = await authorsModel.getById(book.author_id);

    if (!author) {
      throw new types.ValidationError('Incorrect book author');
    }
  } else {
    // проверяем автора
    if (!book.author || typeof book.author !== 'string') {
      throw new types.ValidationError('Incorrect book author');
    }

    let author = await authorsModel.getByName(book.author);

    if (!author) {
      throw new types.ValidationError('Incorrect book author');
    }

    book.author_id = author.id;
  }

  return book;
};

/**
 * Получение сортировки для SQL-запроса
 * @param {string} order - сортировка (например, title desc или description asc)
 */
exports.getOrder = function (order) {
  if (!order || typeof order !== 'string') {
    return 'b.id asc';
  }

  let parts = order.split(" ");

  let orderParts = [];

  switch (parts[0].toLowerCase()) {
    case 'title':
      orderParts.push('b.title');
      break;
    case 'image':
      orderParts.push('b.image');
      break;
    case 'date':
      orderParts.push('b.date');
      break;
    case 'author':
      orderParts.push('a.name');
      break;
    default:
      orderParts.push('b.id');
  }

  if (parts[1] && parts[1].toLowerCase() === 'desc') {
    orderParts.push('desc');
  } else {
    orderParts.push('asc');
  }

  return orderParts.join(' ');
};

/**
 * Создание новой книги
 * @param {Object} book - объект книги
 * @param {string} book.title - название книги
 * @param {string} book.description - описание книги
 * @param {string} book.image - изображение
 * @param {string} book.date - дата в формате YYYY-MM-DD
 * @param {number} book.author_id - айдишка автора
 */
exports.create = async function (book) {
  book = await this.validate(book);

  let connection = await db.getConnection();
  let r = await connection.execute(`
    INSERT INTO \`books\`
      (\`title\`, \`description\`, \`image\`, \`date\`, \`author_id\`)
    VALUES (?, ?, ?, ?, ?)
  `, [book.title, book.description, book.image, book.date, book.author_id]);

  connection.release();

  let v = r[0].insertId ? await this.getById(r[0].insertId) : null;

  return v;
};

/**
 * Обновление книги по айдишке
 * @param {number} id - айди книги
 * @param {Object} book - объект книги
 * @param {string} book.title - название книги
 * @param {string} book.description - описание книги
 * @param {string} book.image - изображение
 * @param {string} book.date - дата в формате YYYY-MM-DD
 * @param {number} book.author_id - айдишка автора
 */
exports.updateById = async function (id, book) {
  book = await this.validate(book);

  let connection = await db.getConnection();

  let r = await connection.execute(`
    UPDATE \`books\` SET
      \`title\` = ?,
      \`description\` = ?,
      \`image\` = ?,
      \`date\` = ?,
      \`author_id\` = ?
    WHERE
      \`id\` = ?
  `, [book.title, book.description, book.image, book.date, book.author_id, id]);

  connection.release();

  return r[0].affectedRows > 0 ? await this.getById(id) : null;
};

/**
 * Удаление книги по айдишке
 * @param {number} id - айди книги
 */
exports.removeById = async function (id) {
  let connection = await db.getConnection();

  let r = await connection.execute('DELETE FROM `books` WHERE `id` = ?', [id]);

  connection.release();

  return r[0].affectedRows > 0;
};