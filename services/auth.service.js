const Jwt = require('jsonwebtoken'),
    config = require('../config'),
    Log = require('../lib/log'),
    Db = require('../lib/db'),
    Users = require('../models/user'),
    Emails = require('../models/email'),
    Phones = require('../models/phone');
/**
 * @summary Auth service class
 */
function Auth () {
    this._init();
}
/**
 * @summary Init class
 */
Auth.prototype._init = function () {
    this.name = 'auth';
    this.jwt = Jwt;
    this.tokenExp = config.auth.tokenExp;
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
/**
 * @summary Authorize local user wia email.
 * @params [
 *          password - string, user password
 *          email - string, user email
 *          ] Array - input params.
 * @return Promise(
 *                  resolve - {
 *                  auth: boolean, ok/not ok,
 *                  user: {
 *                      id: string,
 *                      email: string,
 *                      status: boolean,
 *                      token: string
 *                      }
 *                  }
 *              )
 */
Auth.prototype.auth_local_email = function (params) {
    return new Promise( (resolve, reject) => {
        try {
            const user = new this.user(),
                pars = {};
            pars.password = params[0];
            pars.email = params[1];
            this._paramsVerify(pars)
                .then(() => {
                    return this.email.find({
                        email: pars.email
                    }).populate({
                        path: 'owner',
                        select: 'password'
                    })
                })
                .then(emails => {
                    if (emails) {
                        return this._verifyPassword(pars.password, emails, 'email');
                    } else {
                        return reject('No matches.');
                    }
                })
                .then(pverf => {
                    if (pverf) {
                        result = pverf;
                        return this._getJWT(pverf.user.id);
                    } else return reject();
                })
                .then(token => {
                    if (token) {
                        result.user.token = token;
                        return resolve(result);
                    } else return reject();
                })
                .catch(e => {
                    return reject(e);
                })
        } catch (e) {
            return reject(e);
        }
    });
};
/**
 * @summary Authorize local user wia phone.
 * @params [
 *          password - string, user password
 *          phone - string, user email
 *          ] Array - input params.
 * @return Promise(
 *                  resolve - {
 *                  auth: boolean, ok/not ok,
 *                  user: {
 *                      id: string,
 *                      phone: string,
 *                      status: boolean,
 *                      token: string
 *                      }
 *                  }
 *              )
 */
Auth.prototype.auth_local_phone = function (params) {
    return new Promise( (resolve, reject) => {
        try {
            const user = new this.user(),
            pars = {};
            let result = {};
            pars.password = params[0];
            pars.phone = params[1];
            this._paramsVerify(pars)
                .then(() => {
                    return this.phone.find({
                        phone: pars.phone
                    }).populate({
                        path: 'owner',
                        select: 'password'
                    })
                })
                .then(phones => {
                    if (phones) {
                        return this._verifyPassword(pars.password, phones, 'phone');
                    } else {
                        return reject('No matches.');
                    }
                })
                .then(pverf => {
                    if (pverf) {
                        result = pverf;
                        return this._getJWT(pverf.user.id);
                    } else return reject();
                })
                .then(token => {
                    if (token) {
                        result.user.token = token;
                        return resolve(result);
                    } else return reject();
                })
                .catch(e => {
                    return reject(e);
                })
        } catch (e) {
            return reject(e);
        }
    });
};
Auth.prototype.auth_auth_facebook = function (params) {};
Auth.prototype.auth_auth_google = function (params) {};
Auth.prototype.auth_auth_linked = function (params) {};
Auth.prototype.auth_auth_twitter = function (params) {};
/**
 * @summary Authenticate user by token.
 * @params [
 *          token - string, JWT
 *          id - string, user id
 *          ] Array - input params.
 * @return Promise(
 *                  resolve - {
 *                  auth: boolean, ok/not ok
 *                  }
 *              )
 */
Auth.prototype.auth_authenticate = function (params) {
    return new Promise( (resolve, reject) => {
        try {
            const pars = {};
            pars.token = params[0];
            pars.id = params[1];
            this._paramsVerify(pars)
                .then(() => {
                    return this._verifyJWT(pars.token, pars.id);
                })
                .then(id => {
                    if (id) {
                        return (id.id && id.id === pars.id) ? resolve({
                            auth: true
                            })
                            : resolve({
                                auth: false,
                                message: id.err
                            });
                    } else return reject();
                })
                .catch(e => {
                    return reject(e);
                })
        } catch (e) {
            return reject(e);
        }
    })
};
Auth.prototype._getJWT = function (id) {
    return new Promise( (resolve, reject) => {
        try {
            const token = this.jwt.sign({
                id: id
            }, this.key, {
                expiresIn: this.tokenExp
            });
            resolve(token);
        } catch (e) {
            return reject(e);
        }
    })
};
Auth.prototype._verifyJWT = function (token, id) {
    return new Promise( (resolve, reject) => {
        try {
            this.jwt.verify(token, this.key, (err, data) => {
                if (err) {
                    return resolve({
                        err: err.message
                    });
                } else {
                    return resolve({
                        id:data.id
                    });
                }
            });
        } catch (e) {
            return reject(e);
        }
    })
};
Auth.prototype._verifyPassword = function (password, array, field) {
    return new Promise ( (resolve, reject) => {
        try {
            const authFunc = (i, arr) => {
                if (i < arr.length) {
                    arr[i].owner.verifyPassword(
                        password,
                        arr[i].owner.password
                    )
                        .then(auth => {
                            if (auth) {
                                const resp = {
                                    auth: true,
                                    user: {
                                        id: arr[i].owner._id,
                                        status: arr[i].status,
                                        token: ''
                                    }
                                };
                                resp.user[field] = arr[i][field];
                                return resolve(resp);
                            } else {
                                authFunc(++i, arr);
                            }
                        })
                        .catch(e => {
                            return reject(e)
                        });
                } else return reject('No matches.');
            };
            authFunc(0, array);
        } catch (e) {
            return reject(e);
        }
    });
};
Auth.prototype._paramsVerify = function (params) {
    return new Promise( (resolve, reject) => {
        const verify = {
            password: (value) => {
                return value && value.length >= 8 && value.length < 256;
            },
            email: (value) => {
                return value && value.length < 256
                    && value.match
                    (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
            },
            phone: (value) => {
                return value && value.length < 256
                    && value.match
                    (/^\(*\+*[1-9]{0,3}\)*-*[1-9]{0,3}[-. /]*\(*[2-9]\d{2}\)*[-. /]*\d{3}[-. /]*\d{4} *e*x*t*\.* *\d{0,4}$/);
            },
            third: (value) => {
                return value && value.length > 0 && value.length < 50;
            },
            id: (value) => {
                return value && value.length > 0 && value.length < 256;
            },
            token: (value) => {
                return value && value.length > 0 && value.length < 65000;
            }
        };
        try {
            const keys = Object.keys(params);
            for (let i = 0; i < keys.length; i++)
                if (!verify[keys[i]] || !verify[keys[i]](params[keys[i]]))
                    reject('Wrong field ' + keys[i]);
            resolve();
        } catch (e) {
            return reject(e.message);
        }
    })
};
Auth.prototype.setKey = function (key) {
    this.key = key;
};

module.exports = Auth;