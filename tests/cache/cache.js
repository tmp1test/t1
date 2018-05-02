describe('Cache', () => {
  const assert = require('assert');
  const _ = require('lodash')

  let config = require('../../config/config.json').cache;
  if (!_.isObject(config)) {
    config = {};
  }

  const cache = require('../../services/').cache;
  const random = require('../../services/').random;

  const debug = require('debug')('1test');

  describe('Tests', () => {
    describe('cache.getKey', () => {
      let v = {
        limit: random.getInt(1, 10),
        offset: random.getInt(1, 20),
        order: 'name'
      };

      it('should get key', () => {
        assert.strictEqual(typeof cache.getKey(v), "string");
      });
    });

    describe('cache.add', () => {
      let v = {
        uniq: random.getWord(50),
        limit: random.getInt(1, 10),
        offset: random.getInt(1, 20),
        order: 'name'
      };

      let data = {
        foo: 'bar'
      };

      it('should add data to cache', () => {
        assert.strictEqual(cache.add(v, data), true);
      });
    });

    describe('cache.get', () => {
      let v = {
        uniq: random.getWord(80),
        limit: random.getInt(1, 10),
        offset: random.getInt(1, 20),
        order: 'name'
      };

      let data = {
        foo: 'bar2'
      };

      before(() => {
        cache.add(v, data);
      });

      it('should get data', () => {
        let r = cache.get(v);
        assert.strictEqual(typeof r, "object");
        assert.deepEqual(r, data);
      });
    });

    describe('cache.get and expire', () => {
      let v = {
        uniq: random.getWord(100),
        limit: random.getInt(1, 10),
        offset: random.getInt(1, 20),
        order: 'name'
      };

      let data = {
        foo: 'bar3'
      };

      before(() => {
        cache.add(v, data);
      });

      it('should get undefined for expired cache', function (done) {
        let timeout = (config.ttl || 10);

        // таймаут для теста
        this.timeout((timeout + 0.5) * 1000);

        debug("Waiting for expired cache...");

        setTimeout(() => {
          let r = cache.get(v);
          assert.strictEqual(typeof r, "undefined");
          done();
        }, timeout * 1000);
        
      });
    });    
    // 

  });

});
