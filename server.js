#!/usr/bin/env node
var prerender = require('./lib');
var server = prerender();

// Esto es nuevo:
const port = process.env.PORT || 3618;
server.start({ port });

// --------------------
// CACHE EN MEMORIA
// --------------------
const cache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

function getCacheKey(req) {
  return req.url;
}

function isCacheValid(entry) {
  return Date.now() - entry.timestamp < CACHE_DURATION_MS;
}

// Middleware de caché
server.use({
  requestReceived: (req, res, next) => {
    const key = getCacheKey(req);
    const entry = cache.get(key);

    if (entry && isCacheValid(entry)) {
      console.log(`[CACHE] HIT: ${key}`);
      res.send(entry.html);
    } else {
      res.send = ((originalSend) => (html) => {
        console.log(`[CACHE] STORE: ${key}`);
        cache.set(key, { html, timestamp: Date.now() });
        originalSend.call(res, html);
      })(res.send);

      next();
    }
  }
});

// --------------------
// Middlewares nativos
// --------------------
server.use(prerender.sendPrerenderHeader());
server.use(prerender.browserForceRestart());
// server.use(prerender.blockResources());
server.use(prerender.addMetaTags());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

server.start();
