const express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    routes = require(__dirname + '/routes/router'),
    cors = require('cors'),
    config = require(__dirname + '/assets/config.json'),
    fs = require('fs'),
    morgan = require('morgan'),
    rfs = require('rotating-file-stream'),
    Log = require('./lib/log');
    //db = require('./lib/db');

const services = config.services;
const { fork } = require('child_process');
for (let i = 0; i < services.length; i++) {
    services[i].instance = fork(__dirname + '/services/'
    + services[i].script);
    services[i].instance.on('data', data => {
        let msg = JSON.parse(data);
        if (msg.state === 'start')
            console.log('Service ' + services[i].name + ' start. \n ' + msg.message);
        if (msg.state === 'stop') {
            console.log(msg.message);
            setTimeout(() => {
                console.log('Try start again...');
            }, 20 * 1000);
        }
    });
}

const logPath = __dirname + '/Log';
fs.existsSync(logPath) || fs.mkdirSync(logPath);
const accessLogStream = rfs('access.log',
    {
        interval: '1d',
        path: logPath
    });
// Connect to MongoDB
//db();
app.use(morgan('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    Log(err.message, 0);
    res.json({
        jsonrpc: '2.0',
        error: {
            code: -32600,
            message: 'Invalid Request'
        },
        id: null
    });
});
module.exports = app;