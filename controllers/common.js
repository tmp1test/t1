exports.getLimitAndOffset = async function (ctx, next) {
  let offset = parseInt(ctx.request.query.offset);
  if (isNaN(offset) || offset < 0) {
    offset = 0;
  }

  let limit = parseInt(ctx.request.query.limit);
  if (isNaN(limit) || limit <= 0) {
    limit = 20;
  } else if (limit > 1000) {
    limit = 1000;
  }

  ctx.state.limit = limit;
  ctx.state.offset = offset;

  await next();
};

exports.getId = async function (ctx, next) {
  let id = parseInt(ctx.params.id);
  if (isNaN(id) || id < 1) {
    ctx.throw(400, 'id should be positive');
  }

  ctx.state.id = id;
  await next();
};