describe('Books', () => {
  const assert = require('assert');
  const moment = require('moment');
  const _ = require('lodash');

  const models = require('../../models');
  const cmd = require('../../commands/sql');
  const random = require('../../services/').random;

  const today = moment().format('YYYY-MM-DD');
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
    describe('books.validate', () => {

      let mocks = [{
        error: 'Incorrect book object'
      }, {
        error: 'Incorrect book title',
        data: {}
      }, {
        error: 'Incorrect book title',
        data: {
          title: 0
        }
      }, {
        error: 'Incorrect book title',
        data: {
          title: ''
        }
      }, {
        error: 'Incorrect book title',
        data: {
          title: random.getWord(256)
        }
      }, {
        error: 'Incorrect book description',
        data: {
          title: random.getWord(25)
        }
      }, {
        error: 'Incorrect book description',
        data: {
          title: random.getWord(25),
          description: ''
        }
      }, {
        error: 'Incorrect book description',
        data: {
          title: random.getWord(25),
          description: ''
        }
      }, {
        error: 'Incorrect book image',
        data: {
          title: random.getWord(25),
          description: random.getWord(50)
        }
      }, {
        error: 'Incorrect book image',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: 0
        }
      }, {
        error: 'Incorrect book image',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: ''
        }
      }, {
        error: 'Incorrect book image',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: random.getWord(256)
        }
      }, {
        error: 'Incorrect book date',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: random.getImage()
        }
      }, {
        error: 'Incorrect book date',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: random.getImage(),
          date: 0
        }
      }, {
        error: 'Incorrect book date',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: random.getImage(),
          date: ''
        }
      }, {
        error: 'Incorrect book date',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: random.getImage(),
          date: '0001-01-001'
        }
      }, {
        error: 'Incorrect book author',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: random.getImage(),
          date: today
        }
      }, {
        error: 'Incorrect book author',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: random.getImage(),
          date: today,
          author: 1
        }
      }, {
        error: 'Incorrect book author',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: random.getImage(),
          date: today,
          author: ''
        }
      }, {
        error: 'Incorrect book author',
        data: {
          title: random.getWord(25),
          description: random.getWord(50),
          image: random.getImage(),
          date: today,
          author: random.getWord(20)
        }
      }];

      mocks.forEach((mock) => {
        it(`should return ${mock.error} for ${mock.data ? JSON.stringify(mock.data) : '{}'}`, async () => {
          try {
            await models.books.validate(mock.data);
          } catch (err) {
            assert.strictEqual(err.message, mock.error);
          }
        });
      });
    });

    describe('books.getList', () => {
      let orders = ['id', 'title', 'auhtor', 'date', 'image'];
      let conditions = [{}, {
        title: random.getWord(3)
      }, {
        description: random.getWord(3)
      }, {
        image: random.getImage()
      }, {
        date: today
      }, {
        author: random.getWord(3)
      }, {
        author: random.getWord(3),
        title: random.getWord(3),
        description: random.getWord(3),
        date: today,
        image: random.getImage()
      }];

      conditions.forEach((condition) => {
        orders.forEach((order) => {
          let v = {
            limit: random.getInt(1, 1000),
            offset: random.getInt(0, 100),
            filter: _.extend({
              order: models.books.getOrder(order)
            }, condition)
          };;

          it(`should get book list ${JSON.stringify(v)}`, async () => {
            let items = await models.books.getList(v);

            assert.strictEqual(items instanceof Array, true);
            assert.strictEqual(items.length <= v.limit, true);
            items.forEach(item => {
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
          });
        });
      });
    });

    describe('books.create', () => {
      let mock = {
        title: random.getWord(25),
        description: random.getWord(50),
        image: random.getImage(),
        date: today
      };

      it('should create new book', async () => {
        let author = authorList[random.getInt(0, authorList.length - 1)];
        mock.author_id = author.id;

        let r = await models.books.create(mock);

        assert.strictEqual(typeof r, 'object');
        assert.strictEqual(typeof r.id, 'number');
        assert.strictEqual(typeof r.title, 'string');
        assert.strictEqual(r.title, mock.title);
        assert.strictEqual(typeof r.description, 'string');
        assert.strictEqual(r.description, mock.description);
        assert.strictEqual(typeof r.image, 'string');
        assert.strictEqual(r.image, mock.image);
        assert.strictEqual(typeof r.date, 'string');
        assert.strictEqual(r.date, mock.date);
        assert.strictEqual(typeof r.author, 'string');
        assert.strictEqual(r.author, author.name);
      });

      it('should get error ER_DUP_ENTRY', async () => {
        try {
          await models.books.create(mock);
        } catch (err) {
          assert.strictEqual(err.code, 'ER_DUP_ENTRY');
        }
      });

    });

    describe('books.updateById', () => {
      let mock = {
        title: random.getWord(30),
        description: random.getWord(30),
        image: random.getImage(),
        date: today
      };

      let id;
      before(async () => {
        mock.author_id = authorList[random.getInt(0, authorList.length - 1)].id;
        let r = await models.books.create(mock);

        id = r.id;
      });

      let updMock = {
        title: random.getWord(32),
        description: random.getWord(32),
        image: random.getImage(),
        date: moment().add(-1, 'day').format('YYYY-MM-DD')
      };

      it('should update book', async () => {
        let author = authorList[random.getInt(0, authorList.length - 1)];
        updMock.author_id = author.id;

        let r = await models.books.updateById(id, updMock);

        assert.strictEqual(typeof r, 'object');
        assert.strictEqual(typeof r.id, 'number');
        assert.strictEqual(r.id, id);
        assert.strictEqual(typeof r.title, 'string');
        assert.strictEqual(r.title, updMock.title);
        assert.strictEqual(typeof r.description, 'string');
        assert.strictEqual(r.description, updMock.description);
        assert.strictEqual(typeof r.image, 'string');
        assert.strictEqual(r.image, updMock.image);
        assert.strictEqual(typeof r.date, 'string');
        assert.strictEqual(r.date, updMock.date);
        assert.strictEqual(typeof r.author, 'string');
        assert.strictEqual(r.author, author.name);
      });

      it('should get null when record not found', async () => {
        let r = await models.books.updateById(999999999, updMock);

        assert.strictEqual(r, null);
      });
    });

    describe('books.removeById', () => {
      let mock = {
        title: random.getWord(40),
        description: random.getWord(40),
        image: random.getImage(),
        date: today
      };

      let id;
      before(async () => {
        mock.author_id = authorList[random.getInt(0, authorList.length - 1)].id;
        let r = await models.books.create(mock);

        id = r.id;
      });

      it('should remove book and return true', async () => {
        let r = await models.books.removeById(id);

        assert.strictEqual(typeof r, 'boolean');
        assert.strictEqual(r, true);
      });

      it('should get false when record not found', async () => {
        let r = await models.books.removeById(id);

        assert.strictEqual(typeof r, 'boolean');
        assert.strictEqual(r, false);
      });
    });
    // 

  });

});
