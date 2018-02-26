const should = require('should'),
    Log = require('../../lib/log');

describe('Log test',()=> {
    it('Log', (done) => {
        Log('testing common log');
        Log('testing error log', 0);
        Log('testing test log', 1);
        done();
    })
});