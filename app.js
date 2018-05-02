process.env.DEBUG = process.env.DEBUG || '1test';

const _ = require('lodash');
const Koa = require('koa');
const Router = require('koa-router');
var bodyParser = require('koa-bodyparser');

const types = require('./services/types');

let app = new Koa();
let router = new Router();

const debug = require('debug')('1test');
let appConfig = require('./config/config.json').app;
if (!_.isObject(appConfig)) {
  appConfig = {};
}

// простенький лог
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method}\t${ctx.url}\t${ctx.request.rawBody || "-"}\t${ctx.status}\t${(ms/1000).toFixed(3)}s`);
});

// обработка ошибок
app.use(async (ctx, next) => {
  try {
    await next();

    const status = ctx.status || 404;
    if (status === 404) {
        ctx.throw(404, "Not found");
    }
  } catch (err) {
    if (err instanceof types.ValidationError) {
      ctx.status = 400;
    } else if (err.code === "ER_DUP_ENTRY") {
      ctx.status = 400;
      err.message = "Duplicate entry";
    } else {
      ctx.status = err.status || 500;
    }

    // прячем 5xx ошибки от обычного пользователя
    ctx.body = {
      error: ctx.status >= 500 ? 'Internal server error' : err.message
    };
    
    ctx.app.emit('error', err, ctx);
  }
});

// костыль для json
// не нашел способа от него избавиться
app.use(async (ctx, next) => {
  ctx.type = "json";
  await next();
});

// лог ошибок
// выводим только 5xx ошибки
// далее можем настроить, например, логстеш для создания алертов по ним
app.on('error', (err, ctx) => {
  if (ctx.status >= 500) {
    debug(`FATAL\t${err.message}\t${err.stack.replace(/[\r\n]/g, '')}`);
  }
});

app.use(bodyParser());

// инициализируем роуты
require('./routes').init(router);
app.use(router.routes());

// запускаем приложение
app.listen({
  host: appConfig.host || "localhost",
  port: appConfig.port || 3000
}, () => {
  debug(`DEBUG\tListening http://${appConfig.host}:${appConfig.port}`)
});