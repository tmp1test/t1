const models = require('../models');
const cache = require('../services').cache;

exports.getList = async function (ctx, next) {
  let options = {
    limit: ctx.state.limit,
    offset: ctx.state.offset,
    filter: ctx.request.query
  };

  let cachedValue = cache.get(options);

  if (cachedValue !== void 0) {
    ctx.body = cachedValue;
    return;
  }

  let r = await models.books.getList(options);
  cache.add(options, r);

  ctx.body = r;
};

exports.getById = async function (ctx, next) {
  let book = await models.books.getById(ctx.state.id);

  if (!book) {
    ctx.throw(404, 'Not found');
  }

  ctx.body = book;
};

exports.create = async function (ctx, next) {
  ctx.body = await models.books.create(ctx.request.body);
};

exports.update = async function (ctx, next) {
  let id = ctx.state.id;
  let book = await models.books.updateById(id, ctx.request.body);

  if (!book) {
    ctx.throw(404, 'Not found');
  }

  ctx.body = book;
};

exports.remove = async function (ctx, next) {
  let id = ctx.params.id;

  let isRemoved = await models.books.removeById(id);

  if (!isRemoved) {
    ctx.throw(404, 'Not found');
  }

  ctx.status = 204;
};