const controllers = require('../controllers');

module.exports = function (router) {
  router
    .get(
      '/error', 
      controllers.error.generate
    );
};