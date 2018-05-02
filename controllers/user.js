exports.getByToken = async function (ctx, next) {
  // проверяем авторизацию (токен, куки и т.д.)
  // ...

  // ctx.state.user = ...
  await next();
};

exports.checkAcl = async function (ctx, next) {
  // проверяем права
  await next();
};