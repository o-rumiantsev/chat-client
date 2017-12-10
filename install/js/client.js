'use strict';

const net = require('net');
const fs = require('fs');
const readline = require('readline');
const cli = require(__dirname + '/cli.js');
const configDir = '/home/.chat-client/usr/bin/config/config.json';

cli();

if (!global.start) return;

const socket = new net.Socket();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ''
});

let username = '';
getUsername();

function getUsername() {
  const config = fs.readFileSync(configDir, 'utf8');
  const uinfo = JSON.parse(config);
  if (uinfo['user']) {
    username += uinfo['user'];
    getRoom();
  } else setUsername(uinfo);
}

function setUsername(uinfo) {
  rl.question('Username: ', (name) => {
    username += name;
    uinfo['user'] = username;
    fs.writeFile(configDir, JSON.stringify(uinfo, null, 2), (err) => {
      if (err) console.error(err.message);
    });
    getRoom();
  });
}

function getRoom() {
  rl.question('Room: ', (room) => {
    connect(room);
  });
}

function connect(room) {
  socket.connect(global.options, () => {
    socket.write(`###Room###${room}|User ${username} connected`);
  });
}


socket.on('close', () => {
  console.log('================= Connection closed =================');
  rl.close();
});

socket.setEncoding('utf8');
socket.on('data', (msg) => {
  console.log(msg);
  rl.prompt();
});

function sendEndMsg() {
  socket.end(`User ${username} disconnected`);
  rl.prompt = () => '';
}

function sendMsg(line) {
  const msg = `${username}: ` + line;
  socket.write(msg);
}

rl.on('line', (line) => {
  if (line === 'exit') {
    sendEndMsg();
  } else if (line !== '') {
    sendMsg(line);
  }
  rl.prompt();
});
