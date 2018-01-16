const fs = require('fs'),
    config = require('../assets/config.json'),
    path = require('path');

module.exports = {
    log:function (message, cat) {
        if (!config.app.mode) {
            message = message || '';
            cat = (cat === 0) ? 'err' : cat ? 'test' : '';
            if (config.app.log.console) console.dir(message);
            const p = path.join(__dirname, '/Log');
            fs.existsSync(p) || fs.mkdirSync(p);
            if (config.app.log.file) fs.appendFile(__dirname + '/Log' + '/' + cat + 'log.txt',
                '\n' + new Date() + '\n' + message, {},
                err => {
                    if (err) console.log(err)
                })
        }
    }
};