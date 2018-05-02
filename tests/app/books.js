describe('Books', () => {
  const assert = require('assert');
  const _ = require('lodash');
  const request = require("request");
  const qs = require('querystring');
  const moment = require('moment');

  const models = require('../../models');
  const cmd = require('../../commands/sql');
  const random = require('../../services/').random;

  let config = require('../../config/config.json').app;
  if (!_.isObject(config)) {
    config = {};
  }
  const apiUrl = `http://${config.host || "localhost"}:${config.port || 3000}`

  let authorList;

  before(async () => {
    await cmd.drop();
    await cmd.quick(1000, 1000);

    authorList = await models.authors.getRandomList(10);
  });

  after(async () => {
    await cmd.drop();
    await cmd.sync();
  });

  describe('Tests', () => {
    const today = moment().format('YYYY-MM-DD');

    describe('GET /books', () => {
      let orders = ['id', 'title', 'description', 'auhtor', 'date', 'image'];

      orders.forEach((order) => {
        let v = qs.stringify({
          limit: random.getInt(1, 1000),
          offset: random.getInt(0, 100),
          order: models.books.getOrder(order)
        });

        it(`should get 200 and book list for ${v}`, (done) => {
          request({
            url: `${apiUrl}/books?${v}`,
            json: true
          }, (err, response, body) => {
            assert.strictEqual(err, null);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(body instanceof Array, true);

            body.forEach(item => {
              assert.strictEqual(typeof item, 'object');
              assert.strictEqual(typeof item.id, 'number');
              assert.strictEqual(typeof item.title, 'string');
              assert.strictEqual(typeof item.description, 'string');
              assert.strictEqual(typeof item.author, 'string');
              assert.strictEqual(typeof item.date, 'string');
              assert.strictEqual(typeof item.image, 'string');
              assert.strictEqual(typeof item.created_at, 'undefined');
              assert.strictEqual(typeof item.updated_at, 'undefined');
            });

            done();
          });
        });
      });


    });

    describe('GET /books/:id', () => {
      let book;

      let mock = {
        title: random.getWord(25),
        description: random.getWord(50),
        image: random.getImage(),
        date: today
      };

      let author;
      before(async () => {
        author = authorList[random.getInt(0, authorList.length - 1)];
        mock.author_id = author.id;

        book = await models.books.create(mock);
      });

      it('should get 200 and book object', (done) => {
        request({
          url: `${apiUrl}/books/${book.id}`,
          json: true
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 200);
          assert.strictEqual(typeof body, 'object');
          assert.strictEqual(typeof body.id, 'number');
          assert.strictEqual(body.id, book.id);
          assert.strictEqual(typeof body.title, 'string');
          assert.strictEqual(body.title, book.title);
          assert.strictEqual(typeof body.description, 'string');
          assert.strictEqual(body.description, book.description);
          assert.strictEqual(typeof body.author, 'string');
          assert.strictEqual(body.author, author.name);
          assert.strictEqual(typeof body.date, 'string');
          assert.strictEqual(body.date, book.date);
          assert.strictEqual(typeof body.image, 'string');
          assert.strictEqual(body.image, book.image);
          assert.strictEqual(typeof body.created_at, 'undefined');
          assert.strictEqual(typeof body.updated_at, 'undefined');

          done();
        });
      });

      it('should get 400 "id should be positive" for id=0', (done) => {
        request({
          url: `${apiUrl}/books/0`,
          json: true
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 400);
          assert.strictEqual(typeof body, "object");
          assert.strictEqual(typeof body.error, "string");
          assert.strictEqual(body.error, "id should be positive");
  
          done();
        });
      });

      it('should get 404 "Not found" for id=9999999', (done) => {
        request({
          url: `${apiUrl}/books/9999999`,
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

      it('should get 404 "Not found" for id=example', (done) => {
        request({
          url: `${apiUrl}/books/example`,
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
    //

    describe('POST /books', () => {
      let mock = {
        title: random.getWord(30),
        description: random.getWord(30),
        image: random.getImage(),
        date: today
      };

      let duplicateMock = {
        title: random.getWord(31),
        description: random.getWord(31),
        image: random.getImage(),
        date: today
      };

      let author;

      before(async () => {
        author = authorList[random.getInt(0, authorList.length - 1)];
        duplicateMock.author_id = author.id;

        await models.books.create(duplicateMock);
      });

      it('should get 200 and new book object', (done) => {
        mock.author_id = author.id;

        request({
          method: 'POST',
          url: `${apiUrl}/books/`,
          json: true,
          body: mock
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 200);
          assert.strictEqual(typeof body, 'object');
          assert.strictEqual(typeof body.id, 'number');
          assert.strictEqual(typeof body.title, 'string');
          assert.strictEqual(body.title, mock.title);
          assert.strictEqual(typeof body.description, 'string');
          assert.strictEqual(body.description, mock.description);
          assert.strictEqual(typeof body.author, 'string');
          assert.strictEqual(body.author, author.name);
          assert.strictEqual(typeof body.date, 'string');
          assert.strictEqual(body.date, mock.date);
          assert.strictEqual(typeof body.image, 'string');
          assert.strictEqual(body.image, mock.image);
          assert.strictEqual(typeof body.created_at, 'undefined');
          assert.strictEqual(typeof body.updated_at, 'undefined');

          done();
        });
      });

      it('should get 400 and error "Duplicate entry"', (done) => {
        request({
          method: 'POST',
          url: `${apiUrl}/books/`,
          json: true,
          body: duplicateMock
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 400);
          assert.strictEqual(typeof body, "object");
          assert.strictEqual(typeof body.error, "string");
          assert.strictEqual(body.error, "Duplicate entry");
  
          done();
        });
      });

      it('should get 400 and validation error "Incorrect book title', (done) => {
        request({
          method: 'POST',
          url: `${apiUrl}/books`,
          json: true
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 400);
          assert.strictEqual(typeof body, "object");
          assert.strictEqual(typeof body.error, "string");
          assert.strictEqual(body.error, "Incorrect book title");
  
          done();
        });
      });
    });

    describe('PUT /books/:id', () => {
      let book;

      let mock = {
        title: random.getWord(25),
        description: random.getWord(50),
        image: random.getImage(),
        date: today
      };

      let duplicateMock = {
        title: random.getWord(31),
        description: random.getWord(31),
        image: random.getImage(),
        date: today
      };

      let updatedMock = {
        title: random.getWord(25),
        description: random.getWord(50),
        image: random.getImage(),
        date: today
      };

      let author;
      let updatedAuthor;

      before(async () => {
        author = authorList[random.getInt(0, authorList.length - 1)];
        mock.author_id = author.id;

        updatedAuthor = authorList[random.getInt(0, authorList.length - 1)];
        updatedMock.author = updatedAuthor.name;
        duplicateMock.author_id = updatedAuthor.id;

        book = await models.books.create(mock);
        await models.books.create(duplicateMock);
      });

      it('should get 200 and updated book object', (done) => {
        request({
          method: "PUT",
          url: `${apiUrl}/books/${book.id}`,
          json: true,
          body: updatedMock
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 200);
          assert.strictEqual(typeof body, 'object');
          assert.strictEqual(typeof body.id, 'number');
          assert.strictEqual(body.id, book.id);
          assert.strictEqual(typeof body.title, 'string');
          assert.strictEqual(body.title, updatedMock.title);
          assert.strictEqual(typeof body.description, 'string');
          assert.strictEqual(body.description, updatedMock.description);
          assert.strictEqual(typeof body.author, 'string');
          assert.strictEqual(body.author, updatedAuthor.name);
          assert.strictEqual(typeof body.date, 'string');
          assert.strictEqual(body.date, updatedMock.date);
          assert.strictEqual(typeof body.image, 'string');
          assert.strictEqual(body.image, updatedMock.image);
          assert.strictEqual(typeof body.created_at, 'undefined');
          assert.strictEqual(typeof body.updated_at, 'undefined');

          done();
        });
      });

      it('should get 400 and error "Duplicate entry"', (done) => {
        request({
          method: 'PUT',
          url: `${apiUrl}/books/${book.id}`,
          json: true,
          body: duplicateMock
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 400);
          assert.strictEqual(typeof body, "object");
          assert.strictEqual(typeof body.error, "string");
          assert.strictEqual(body.error, "Duplicate entry");
  
          done();
        });
      });

      it('should get 400 "id should be positive" for id=0', (done) => {
        request({
          method: "PUT",
          url: `${apiUrl}/books/0`,
          json: true,
          body: mock
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 400);
          assert.strictEqual(typeof body, "object");
          assert.strictEqual(typeof body.error, "string");
          assert.strictEqual(body.error, "id should be positive");
  
          done();
        });
      });

      it('should get 404 "Not found" for id=9999999', (done) => {
        request({
          method: "PUT",
          url: `${apiUrl}/books/9999999`,
          json: true,
          body: mock
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 404);
          assert.strictEqual(typeof body, "object");
          assert.strictEqual(typeof body.error, "string");
          assert.strictEqual(body.error, "Not found");
  
          done();
        });
      });

      it('should get 404 "Not found" for id=example', (done) => {
        request({
          method: "PUT",
          url: `${apiUrl}/books/example`,
          json: true,
          body: mock
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
    //

    describe('DELETE /books/:id', () => {
      let book;

      let mock = {
        title: random.getWord(25),
        description: random.getWord(50),
        image: random.getImage(),
        date: today
      };

      let author;
      before(async () => {
        author = authorList[random.getInt(0, authorList.length - 1)];
        mock.author_id = author.id;
        
        book = await models.books.create(mock);
      });

      it('should get 204 and remove book object', (done) => {
        request({
          method: "DELETE",
          url: `${apiUrl}/books/${book.id}`,
          json: true,
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 204);
          assert.strictEqual(typeof body, 'undefined');

          done();
        });
      });

      it('should get 404 and error "Not found"', (done) => {
        request({
          method: 'DELETE',
          url: `${apiUrl}/books/${book.id}`,
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

      it('should get 400 "id should be positive" for id=0', (done) => {
        request({
          method: "DELETE",
          url: `${apiUrl}/books/0`,
          json: true
        }, (err, response, body) => {
          assert.strictEqual(err, null);
          assert.strictEqual(response.statusCode, 400);
          assert.strictEqual(typeof body, "object");
          assert.strictEqual(typeof body.error, "string");
          assert.strictEqual(body.error, "id should be positive");
  
          done();
        });
      });

      it('should get 404 "Not found" for id=9999999', (done) => {
        request({
          method: "DELETE",
          url: `${apiUrl}/books/9999999`,
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

      it('should get 404 "Not found" for id=example', (done) => {
        request({
          method: "DELETE",
          url: `${apiUrl}/books/example`,
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

    //

  });

});
