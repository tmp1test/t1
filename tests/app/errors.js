describe('Errors', () => {
  const assert = require('assert');
  const _ = require('lodash');
  const request = require("request");

  let config = require('../../config/config.json').app;
  if (!_.isObject(config)) {
    config = {};
  }
  const apiUrl = `http://${config.host || "localhost"}:${config.port || 3000}`

  describe('Tests', () => {
    describe('GET /error', () => {
      it('should get 500 "Internal server error"', (done) => {
        request({
          url: `${apiUrl}/error`,
          json: true
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 500);
          assert.strictEqual(typeof body, "object");
          assert.strictEqual(typeof body.error, "string");
          assert.strictEqual(body.error, "Internal server error");
  
          done();
        });
      });
    });

    describe('GET /error2', () => {
      it('should get 404 "Not found"', (done) => {
        request({
          url: `${apiUrl}/error2`,
          json: true
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 404);
          assert.strictEqual(typeof body, "object");
          assert.strictEqual(typeof body.error, "string");
          assert.strictEqual(body.error, "Not found");
  
          done();
        });
      });
    });
    
  });

});
