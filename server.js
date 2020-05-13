const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  console.log(`Receiving a request for ${req.url}`);
  switch (req.url) {
    case '/':
    case '/index.html': {
      res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
      res.end(fs.readFileSync('./index.html'));
      break;
    }
    case '/main.mjs': {
      res.writeHead(200, { 'Content-Type': 'text/javascript;charset=utf-8' });
      res.end(fs.readFileSync('./main.mjs'));
      break;
    }
    case '/expectations.json': {
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(fs.readFileSync('./expectations.json'));
      break;
    }
  }
});

const start = (port = 9001) => {
  server.listen(port);
  return new Promise((resolve, reject) => {
    server.on('listening', () => {
      resolve();
    });
  });
};

const stop = () => {
  return new Promise((resolve, reject) => {
    server.close(() => {
      resolve();
    });
  });
};

module.exports = {
  start,
  stop,
};
