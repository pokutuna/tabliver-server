/// <reference path="modules/DefinitelyTyped/node/node.d.ts" />
/// <reference path="modules/DefinitelyTyped/express/express.d.ts" />
var express = require('express');
var events = require('events');
var app = express();
var TabLive = (function () {
    function TabLive(name) {
        this.eventEmitter = new events.EventEmitter();
    }
    TabLive.checkInterval = 10 * 60 * 1000; // 10 min
    return TabLive;
})();
var TabLiveContainer = (function () {
    function TabLiveContainer() {
        this.container = {};
    }
    TabLiveContainer.prototype.exists = function (liveId) {
        return this.container[liveId] ? true : false;
    };
    TabLiveContainer.prototype.get = function (liveId) {
        return this.container[liveId];
    };
    TabLiveContainer.prototype.register = function (liveId, live) {
        this.container[liveId] = live;
    };
    TabLiveContainer.prototype.remove = function (liveId) {
        if (this.exists(liveId)) {
            this.get(liveId).close();
            this.container[liveId] = undefined;
        }
    };
    return TabLiveContainer;
})();
var container = new TabLiveContainer();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
// TODO middleware-lize to extend express.Response
function sse(req, res) {
    var heartbeatInterval = 50 * 1000;
    var timer = setInterval(function () {
        res.write(':\n\n');
    }, heartbeatInterval);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    res.write(':\n\n');
    req.on('close', function () {
        clearTimeout(timer);
    });
}
app.post('/new/:liveId', function (req, res) {
    var liveId = req.params.liveId;
    if (container.exists(liveId))
        return res.status(403).send('duplicate liveId');
    sse(req, res);
    var live = new TabLive(liveId);
    container.register(live.liveId, live);
    req.on('close', function () {
        container.remove(live.liveId);
    });
});
app.post('/live/:liveId', function (req, res) {
    var liveId = req.params.liveId;
});
app.get('/live/:liveId', function (req, res) {
    var liveId = req.params.liveId;
    sse(req, res);
});
app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
