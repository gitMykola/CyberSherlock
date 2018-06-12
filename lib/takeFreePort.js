const http = require('http');

module.exports = (pool, Log) => {
    return new Promise( (resolve, reject) => {
        const test = (pt) => {
            if (pt > pool[1]) reject('Free port out off pool.');
            const server = http.createServer();
            server.listen(pt);
            server.on('error', err => {
                Log(err.message);
                if (err.code === 'EADDRINUSE') {
                    test(++pt);
                } else {
                    reject('Listening error.');
                }
            });
            server.once('listening', () => {
                server.close();
                resolve(pt);
            })
        };
        test(pool[0]);
    })
};