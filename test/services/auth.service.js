const path = require('path');
global.appRoot = path.resolve(__dirname + '/../../');
const chai = require('chai');
const expect = chai.expect;
const db = require(appRoot + '/lib/db');
const Auth = require(appRoot + '/services/auth.service');
const testData = require(appRoot + '/test/testData.json');

describe('Authorization service', () => {
    it('auth_local_email', done => {

    });
});