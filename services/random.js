const possible = "abcdefghijklmnopqrstuvwxyz";
let possibleLen = possible.length;

let protocols = ['http', 'https'];
let extenstions = ['png', 'jpg', 'jpeg', 'gif'];

/**
 * Возвращает случайное целое число в диапазоне от min до max
 * @param {number} min - минимум
 * @param {number} max - максимум
 */
exports.getInt = function getInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Возвращает случайное слово (просто набор букв, но для теста подойдет)
 * @param {number} len - длина слова
 */
exports.getWord = function getWord (len) {
  let text = "";
  
  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possibleLen));
  }

  return text;
};

/**
 * Возвращает случайное слово, у которого первая буква заглавная
 * @param {number} len - длина слова
 */
exports.getCapitalizedWord = function (len) {
  let word = this.getWord(len);

  return word[0].toUpperCase() + word.slice(1);
};

/**
 * Возвращает случайный тайтл
 * @param {number} len - количество слов
 */
exports.getTitle = function (len) {
  let words = [];
  for (let i = 0; i < len; i++) {
    if (i === 0) {
      words.push(this.getCapitalizedWord(this.getInt(2, 20)));
      continue;
    }

    words.push(this.getCapitalizedWord(this.getInt(3, 20)));
  }

  return words.join(" ");
};

/**
 * Возвращает случайное описание
 * @param {number} len - количество слов
 */
exports.getDescription = function (len) {
  let words = [];
  for (let i = 0; i < len; i++) {
    if (i === 0) {
      words.push(this.getCapitalizedWord(this.getInt(1, 20)));
      continue;
    }

    words.push(this.getCapitalizedWord(this.getInt(1, 20)));
  }

  return words.join(" ") + ".";
};

/**
 * Возвращает случайное изображение
 */
exports.getImage = function () {
  let protocol = protocols[this.getInt(0, protocols.length - 1)];
  let extenstion = extenstions[this.getInt(0, extenstions.length - 1)];

  return `${protocol}://${this.getWord(this.getInt(3,12))}.${this.getWord(this.getInt(2,5))}/${this.getWord(this.getInt(1,20))}.${extenstion}`;
};