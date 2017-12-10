'use strict';

const fs = require('fs');
const cp = require('child_process');
const args = process.argv.splice(2);

const configDir = '/home/.chat-client/usr/bin/config/config.json';
const config = fs.readFileSync(configDir, 'utf8');
const uinfo = JSON.parse(config);

/* Reuired options and keys:
* default: <host> <port>
* 'change-username' - change username in config.json
* 'remove' - remove chat-client package
* 'update' - update to latest version
* '-v' - output version
* '--help' - output help
*/

function showVersion(packageName) {
  const cmd = `dpkg -l ${packageName} | tail -1 | tr -s ' ' | cut -d' ' -f3`;
  cp.exec(cmd, (err, stdout, stderr) => {
    if (err) throw err;
    process.stderr.write(stderr);
    process.stdout.write('v' + stdout);
  });
}

function showUsername() {
  const username = uinfo['user'];
  console.log(username);
}

global.start = false;

function cli() {
  switch (args[0]) {
    case 'change-username': {
      if (!args[1]) {
        console.log('ERRNOUSERNAME: Username argument required');
        return;
      } else {
        uinfo['user'] = args[1];
        const data = JSON.stringify(uinfo, null, 2);
        fs.writeFileSync(configDir, data, (err) => {
          if (err) console.error(err.message);
        });
      }
      break;
    }
    case 'show-username': {
      showUsername();
      break;
    }
    case 'remove': {
      cp.exec('dpkg -r chat-client');
      cp.exec('rm -r /home/.chat-client/');
      break;
    }
    case 'update': {
      cp.exec('/home/.chat-client/usr/bin/update', (err) => {
        if (err) console.error(err.message);
        else process.stdout.write('Updated successfully\n');
      });
      break;
    }
    case '-v': {
      showVersion('chat-client');
      break;
    }
    case '--help': {
      global.start = false;
      const help = fs.readFileSync('/home/.chat-client/usr/bin/help/help.txt');
      process.stdout.write(help.toString());
      break;
    }
    default: {
      if (!args[0] && !args[1]) {
        console.log(
          'Usage: chat-client <host> <port>\n' +
          'Type "chat-client --help" for aditional info'
        );
        return;
      }
      global.start = true;
      global.options = { host: args[0], port: args[1] };
    }
  }
}

module.exports = cli;
