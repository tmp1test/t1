const moment = require('moment');
const models = require('../models');
const random = require('../services').random;
const config = require('../config/config.json').database || {};

const debug = require('debug')('1test');

if (!config.database) {
  throw new Error('Incorrect config');
}

const step = 1000;

/**
 * Быстрая инициализация базы данных
 * @param {number} totalBooks - количество книг, которые необходимо добавить в базу
 * @param {number} totalAuthors  - количество авторов, которые необходимо добавить в базу
 */
exports.quick = async function (totalBooks, totalAuthors) {
  await this.sync();
  return await this.seed(totalBooks, totalAuthors);
};

/**
 * Синхронизация структуры базы данных
 */
exports.sync = async function () {
  await models.authors.createTable();
  await models.books.createTable();

  return true;
};

/**
 * Вставка данных в таблицы
 * @param {number} totalBooks - количество книг, которые необходимо добавить в базу
 * @param {number} totalAuthors  - количество авторов, которые необходимо добавить в базу
 */
exports.seed = async function (totalBooks, totalAuthors) {
  // простенькая проверка
  totalAuthors = parseInt(totalAuthors)
  if (isNaN(totalAuthors) || totalAuthors < 0) {
    totalAuthors = 10000;
  }

  // вставляем авторов
  await insertAuthors(totalAuthors);

  // простенькая проверка
  totalBooks = parseInt(totalBooks)
  if (isNaN(totalBooks) || totalBooks < 0) {
    totalBooks = 100000;
  }

  // вставляем книги
  await insertBooks(totalBooks)

  return true;
};

/**
 * Удаление таблиц
 */
exports.drop = async () => {
  await models.authors.createTable();
  await models.authors.clear();
  await models.books.drop();
  await models.authors.drop();

  return true;
};

/**
 * Вставка авторов
 * @param {number} total - количество авторов, которые необходимо добавить в базу
 */
async function insertAuthors(total) {
  if (total === 0) {
    return total;
  }

  debug(`Remaining authors: ${total}`);

  let l = total > step ? step : total;

  let items = [];

  for (let i = 0; i < l; i++) {
    items.push({
      name: random.getCapitalizedWord(random.getInt(5, 20)) + " " + random.getCapitalizedWord(random.getInt(3, 20))
    });
  }

  let count = await models.authors.seed(items);

  // учитываем возможность дубликатов
  return await insertAuthors(total - count);
}

/**
 * Вставка книг
 * @param {number} total - количество книг, которые необходимо добавить в базу
 */
async function insertBooks(total) {
  if (total === 0) {
    return total;
  }

  debug(`Remaining books: ${total}`);

  let l = total > step ? step : total;

  let items = [];

  let authors = await models.authors.getRandomList(l);
  if (authors.length < l) {
    l = authors.length;
  }

  for (let i = 0; i < l; i++) {
    items.push({
      authorId: authors[i >= l ? i % l : i].id,
      date: moment().add(-random.getInt(1, 365), 'days').format('YYYY-MM-DD'),
      title: random.getTitle(random.getInt(1, 5)),
      description: random.getDescription(random.getInt(10, 50)),
      image: random.getImage()
    });
  }

  let count = await models.books.seed(items);

  return await insertBooks(total - count);
}