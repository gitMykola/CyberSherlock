let express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    config = require('../assets/config.json'),
    Log = require('../lib/log');
db = require('../lib/db');
// Connect to MongoDB
//db();
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', (req, res) => {
    res.json({result: 'Auth RPC', id: req.body.id});
});

let http = require('http');

app.set('port', 9000);
let server = http.createServer(app);
server.listen(9000);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    console.log(JSON.stringify({
        state: 'stop',
        message: error.code + ' ' + error.message
    }));
    process.exit(1);
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log(JSON.stringify({
        state: 'start',
        message: 'AUTH listening on ' + bind
    }));
}