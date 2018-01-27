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
            if (config.app.log.file) {
                const d = new Date(),
                dl = d.getFullYear() +
                    ((d.getMonth() < 9) ? '0' +
                        (d.getMonth() + 1) : (d.getMonth() + 1)) +
                    ((d.getDay() < 9) ? '0' +
                        d.getDay() : d.getDay());
                    fs
                    .appendFile(__dirname + '/Log' + '/' +
                        cat + '___' + dl +'___log.txt',
                    '\n' + d + '____' + message, {},
                    err => {
                        if (err) console.log(err)
                    })
                }
        }
    }
};