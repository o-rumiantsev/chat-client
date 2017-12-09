'use strict';

const os = require('os');
const net = require('net');
const fs = require('fs');
const readline = require('readline');
const cli = require(__dirname + '/cli.js');
const PLATFORM = process.platform;

cli();

const socket = new net.Socket();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ''
});

let username = '';
getUsername();

function getUsername() {
  const config = fs.readFileSync('./config.json', 'utf8');
  const uinfo = JSON.parse(config);
  if (uinfo['user']) {
    username += uinfo['user'];
    getRoom();
  } else setUsername(uinfo);
};

function setUsername(uinfo) {
  rl.question('Username: ', (name) => {
    username += name;
    uinfo['user'] = username;
    fs.writeFile('./config.json', JSON.stringify(uinfo, null, 2), (err) => {
      if (err) console.error(err.message);
    });
    getRoom();
  });
};

function getRoom() {
  rl.question('Room: ', (room) => {
    connect(room);
  });
};

function connect(room) {
  socket.connect(global.options, () => {
    socket.write(`###Room###${room}|User ${username} connected`);
  });
};


socket.on('close', () => {
  console.log('================= Connection closed =================');
  rl.close();
})

socket.setEncoding('utf8');
socket.on('data', (msg) => {
  console.log(msg);
  rl.prompt();
});

function sendMsg(line) {
  let msg = '';
  if (PLATFORM.startsWith('win')) msg += `${username}: ` + line;
  else msg = `📨  ${username}: ` + line;
  socket.write(msg);
};


rl.on('line', (line) => {
  if (line === 'exit') {
    socket.end(`User ${username} disconnected`);
    rl.prompt = () => '';
  } else if (line !== '') {
    sendMsg(line);
  }
  rl.prompt();
});
