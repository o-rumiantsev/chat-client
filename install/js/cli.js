'use strict';

const args = process.argv.splice(2);

function cli() {
  global.options = {
    host: args[0],
    port: args[1]
  };
}

module.exports = cli;
