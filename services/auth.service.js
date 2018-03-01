const config = require('../assets/config'),
    Log = require('../lib/log'),
    Db = require('../lib/db'),
    Users = require('../models/user'),
    Emails = require('../models/email'),
    Phones = require('../models/phone');

function Auth () {
    this._init();
}
Auth.prototype._init = function () {
    this.name = 'auth';
        this.log = Log;
        this.db = Db;
        this.dbState = this.db.connect({
            db: config.db,
            log: this.log
        });
        this.user = Users;
        this.email = Emails;
        this.phone = Phones;
};
/**
 * @summary Check service state
 * @return boolean - service state (1 - Ok, 0 - Not working)
 */
Auth.prototype.state = function () {
    return this.db;
};
Auth.prototype.auth_auth = function (params) {
    return new Promise(resolve => {
        this.result = params[0] === '123'
            ? {auth: true}
            : {auth: false, message: 'token wrong.'};
        resolve(this.result);
    })
};

module.exports = Auth;