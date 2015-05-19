/// <reference path="modules/DefinitelyTyped/node/node.d.ts" />
/// <reference path="modules/DefinitelyTyped/express/express.d.ts" />

import express = require('express');
import events  = require('events');
var app = express();

interface Live {
    ev: events.EventEmitter,
}
var container: { [key:string]: Live } = {}

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'));

app.post('/live/:live_id', function(req, res) {
});

app.get('/live/:live_id', function(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'no-cache');
    res.write(':\n\n');

    var timer = setInterval(function() {res.write(':\n\n');
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
