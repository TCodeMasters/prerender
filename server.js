#!/usr/bin/env node
var prerender = require('./lib');

var server = prerender();

server.use(prerender.sendPrerenderHeader());
server.use(prerender.browserForceRestart());
// server.use(prerender.blockResources());
server.use(prerender.addMetaTags());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

const port = process.env.PORT || 3000;
server.start({ port });



