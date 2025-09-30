import { createServer } from 'http';
import { readFileSync } from 'fs';

const server = createServer((req, res) => {
  console.log(`Receiving a request for ${req.url}`);
  switch (req.url) {
    case '/':
    case '/index.html': {
      res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
      res.end(readFileSync('./index.html'));
      break;
    }
    case '/main.mjs': {
      res.writeHead(200, { 'Content-Type': 'text/javascript;charset=utf-8' });
      res.end(readFileSync('./main.mjs'));
      break;
    }
    case '/data.json': {
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(readFileSync('./data.json'));
      break;
    }
    case '/firefox-failing.json': {
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(readFileSync('./firefox-failing.json'));
      break;
    }
    case '/chrome-failing.json': {
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(readFileSync('./chrome-failing.json'));
      break;
    }
    case '/chromeBidiOnly-failing.json': {
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(readFileSync('./chromeBidiOnly-failing.json'));
      break;
    }
  }
});

export const start = (port = 9001) => {
  server.listen(port);
  return new Promise((resolve) => {
    server.on('listening', () => {
      resolve();
    });
  });
};

export const stop = () => {
  return new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });
};
