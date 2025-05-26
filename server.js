#!/usr/bin/env node

const prerender = require('./lib');
const puppeteer = require('puppeteer');

const server = prerender();

// Usa el puerto que Render asigna
const PORT = process.env.PORT || 10000;

// Instancia Puppeteer con flags para Render
server.use(prerender.browserMiddleware({
  chromeFlags: ['--no-sandbox', '--disable-setuid-sandbox']
}));

// Middleware de caché simple en memoria
const cache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

function getCacheKey(req) {
  return req.url;
}

function isCacheValid(entry) {
  return Date.now() - entry.timestamp < CACHE_DURATION_MS;
}

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

// Middlewares nativos
server.use(prerender.sendPrerenderHeader());
server.use(prerender.browserForceRestart());
// server.use(prerender.blockResources());
server.use(prerender.addMetaTags());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

// Iniciar servidor escuchando explícitamente en el puerto
server.start({ port: PORT, host: '0.0.0.0' });

