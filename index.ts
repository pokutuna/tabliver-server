/// <reference path="modules/DefinitelyTyped/node/node.d.ts" />
/// <reference path="modules/DefinitelyTyped/express/express.d.ts" />

import express = require('express');
import events  = require('events');
var app = express();

class TabLive {
    liveId: string;
    eventEmitter: events.EventEmitter;
    lastMessage: Object;

    static checkInterval: number = 10 * 60 * 1000; // 10 min
    pingTimer: number;

    constructor(name: string) {
        this.eventEmitter = new events.EventEmitter();
    }
}

class TabLiveContainer {
    container: { [liveId:string]: TabLive };

    constructor() {
        this.container = {};
    }

    exists(liveId: string): boolean {
        return this.container[liveId] ? true : false;
    }

    get(liveId: string): TabLive {
        return this.container[liveId];
    }

    register(liveId: string, live: TabLive) {
        this.container[liveId] = live;
    }

    remove(liveId: string): void {
        if (this.exists(liveId)) {
            // this.get(liveId).close();
            this.container[liveId] = undefined;
        }
    }
}

var container = new TabLiveContainer();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'));

// TODO middleware-lize to extend express.Response
function sse(req: express.Request, res: express.Response) {
    var heartbeatInterval: number = 50 * 1000;
    var timer = setInterval(function() { res.write(':\n\n') }, heartbeatInterval);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    res.write(':\n\n');

    req.on('close', function() {
        clearTimeout(timer);
    });
}

app.post('/new/:liveId', function(req, res) {
    var liveId = req.params.liveId;
    if (container.exists(liveId)) return res.status(403).send('duplicate liveId');

    sse(req, res);
    var live = new TabLive(liveId);
    container.register(live.liveId, live);

    req.on('close', function() {
        container.remove(live.liveId);
    });
});

app.post('/live/:liveId', function(req, res) {
    var liveId = req.params.liveId;
});

app.get('/live/:liveId', function(req, res) {
    var liveId = req.params.liveId;
    sse(req, res);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
