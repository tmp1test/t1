const qs = require('querystring');
const crypto = require('crypto');
const _ = require('lodash');

let config = require('../config/config.json').cache;
if (!_.isObject(config)) {
  config = {};
}

// ttl в секундах для записи кеша
let ttl;

// внутренний кеш
let _cache = {};

// Объект кеша на данный момент в единственном экземпляре
// Поэтому мы можем просто использовать ttl и _cache из общей области видимости

/**
 * Класс кеша
 */
class Cache {

  /**
   * Конструктор
   * @param {number} ttlValue - время жизни ключа кеша в секундах
   */
  constructor(ttlValue) {
    ttl = ttlValue || 10;
  }

  /**
   * Возвращает хеш
   * @param {Object} options - объект на основе которого строится ключ
   */
  getKey(options) {
    if (!options) {
      return '';
    }

    return crypto.createHash('sha1').update(qs.stringify(options) || '').digest('hex') || '';
  }

  /**
   * Возвращает кешированное значение
   * @param {Object} options - объект на основе которого строится ключ
   */
  get(options) {
    // текущее время в секундах
    let now = +new Date().getTime() / 1000;
    
    let k = this.getKey(options);
    let v = _cache[k];

    if (v === void 0) {
      return v;
    }

    // проверяем ttl
    if (v.expiredAt < now) {
      delete _cache[k];
      return void 0;
    }

    return v.data;
  }

  /**
   * Сохраняет данные в кеше
   * @param {Object} options  - объект на основе которого строится ключ
   * @param {*} data - данные, которые будут сохранены в кеше
   */
  add(options, data) {
    let expiredAt = (+new Date().getTime() / 1000) + ttl;
    let k = this.getKey(options);

    _cache[k] = {
      expiredAt: expiredAt,
      data: data
    };

    return true;
  }

  /**
   * Автоочистка кеша
   */
  expire() {
    let now = +new Date().getTime() / 1000;

    for (let k in _cache) {
      if (!_cache.hasOwnProperty(k)) {
        continue;
      }

      if (_cache[k].expiredAt < now) {
        delete _cache[k];
      }
    }
  }
}

let cache = new Cache(config.ttl || 10);

// запускаем автоочистку кеша
function expire () {
  cache.expire();

  setTimeout(expire, ttl);
}

setTimeout(expire, ttl);

// Экспортируем объект кеша
module.exports = cache;