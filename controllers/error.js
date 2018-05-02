exports.generate = async (ctx, next) => {
  let a = 42;

  a[0] = (void 0).length;

  ctx.body = {
    number: a
  };
};