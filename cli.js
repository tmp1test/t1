(async () => {
  process.env.DEBUG = process.env.DEBUG || '1test';

  const path = require('path');
  const fs = require('fs');
  const debug = require('debug')('1test');

  let command = 'unknown';
  let method = 'unknown';

  try {
    let args = process.argv.slice(2);

    if (!args.length) {
      throw new Error('Nothing to run');
    }
  
    command = args.shift();
    method = args.shift() || 'unknown';
  
    let file = path.join(__dirname, 'commands', command + '.js');
  
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      throw new Error('Command not found')
    }
  
    let cmd = require(file);
    if (!cmd || typeof cmd !== 'object') {
      throw new Error('Incorrect command file');
    }
  
    if (typeof cmd[method] !== 'function') {
      throw new Error('Method not found');
    }

    let res = await cmd[method].apply(cmd, args);

    debug(`DONE\t${command}\t${method}\t${res ? JSON.stringify(res) : ''}`);
    process.exit(0);
  } catch (err) {
    debug(`ERROR\t${command}\t${method}\t${err.message}\t${err.stack.replace(/[\r\n]/g)}`);
    process.exit(1);
  }

})();
