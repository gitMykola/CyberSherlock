const should = require('should'),
    db = require('../../lib/db'),
    path = require('path'),
    crypto = require('crypto');

describe('Database connection test',()=> {
    it('db', (done) => {
        db();
        done();
        })
});