#!/usr/bin/env node
var prerender = require('./lib');

var server = prerender({
    chromeLocation: '/usr/bin/chromium-browser',
    chromeFlags: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--headless',
        '--remote-debugging-port=9222'
    ]
});

server.use(prerender.sendPrerenderHeader());
server.use(prerender.browserForceRestart());
server.use(prerender.addMetaTags());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

const port = process.env.PORT || 3000;
server.start({ port });


