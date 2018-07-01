/**
 * @summary Auth service class
 *
 * @dependency ['jsonwebtoken']
 *
 */
function Auth (appRoot) {
    this._init(appRoot);
}
/**
 * @summary Init class
 */
Auth.prototype._init = function (appRoot) {
    this.config = require(appRoot + '/config');
    require(appRoot + '/lib/service').init(this, {
        appRoot: appRoot,
        config: this.config,
        models: ['user', 'email', 'phone'],
        libs: ['log', 'db', 'utils']
    });
    this.name = 'auth';
    this.jwt = require('jsonwebtoken');
    this.tokenExp = this.config.auth.tokenExp;
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
            const pars = {},
            verUser = new this.user;
            let result = {};
            pars.password = params[0];
            pars.email = params[1];
            this.utils.verifyParams(pars)
                .then(() => {
                    return this.user.aggregate()
                        .lookup({
                            from: 'emails',
                            localField: '_id',
                            foreignField: 'owner',
                            as: 'emails' })
                        .project({
                            _id: 1,
                            name: 1,
                            password: 1,
                            emails: {
                                email: 1,
                                primary: 1
                            },
                            status: 1
                        })
                        .match({
                            emails: {$elemMatch: {
                                    email: pars.email,
                                    primary: true
                                }}
                        })
                        .exec()
                })
                .then(users => {
                    try {
                        if (users) {
                            const authUser = users.filter(user => verUser
                                .verifyPassphrase(pars.password, user.password) === true);
                            if (authUser.length === 1) {
                                result = {
                                    user: {
                                        id: authUser[0]._id.toString(),
                                        email: authUser[0].emails[0].email,
                                        name: authUser[0].name,
                                        status: authUser[0].status
                                    }
                                };
                                return this._getJWT(authUser[0]._id);
                            } else {
                                return reject({
                                    code: 32606,
                                    message: 'No matches.'
                                });
                            }
                        } else {
                            return reject();
                        }
                    } catch (e) {
                        return reject();
                    }
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
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
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
            const pars = {},
            verUser = new this.user;
            let result = {};
            pars.password = params[0];
            pars.phone = params[1];
            this.utils.verifyParams(pars)
                .then(() => {
                    return this.user.aggregate()
                        .lookup({
                            from: 'phones',
                            localField: '_id',
                            foreignField: 'owner',
                            as: 'phones' })
                        .project({
                            _id: 1,
                            name: 1,
                            password: 1,
                            phones: {
                                phone: 1,
                                primary: 1
                            },
                            status: 1
                        })
                        .match({
                            phones: {$elemMatch: {
                                    phone: pars.phone,
                                    primary: true
                                }}
                        })
                        .exec()
                })
                .then(users => {
                    try {
                        if (users) {
                            const authUser = users.filter(user => verUser
                                .verifyPassphrase(pars.password, user.password) === true);
                            if (authUser.length === 1) {
                                result = {
                                    user: {
                                        id: authUser[0]._id.toString(),
                                        phone: authUser[0].phones[0].phone,
                                        name: authUser[0].name,
                                        status: authUser[0].status
                                    }
                                };
                                return this._getJWT(authUser[0]._id);
                            } else {
                                return reject({
                                    code: 32606,
                                    message: 'No matches.'
                                });
                            }
                        } else {
                            return reject();
                        }
                    } catch (e) {
                        return reject();
                    }
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
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
        }
    });
};
Auth.prototype.auth_facebook_login = function (params) {};
/**
 * @summary Authorize google user wia id & access token.
 * @params [
 *          g_id - string, google user id
 *          g_at - string, google user access token
 *          ] Array - input params.
 * @return Promise(
 *                  resolve - {
     *                  result: {
     *                          user: {
             *                      id: string,
             *                      email: string,
             *                      name: string,
             *                      status: boolean,
             *                      token: string
             *                      }
     *                      }
 *                  }
 *              )
 */
Auth.prototype.auth_google_login = function (params) {
    return new Promise( (resolve, reject) => {
        try {
            const pars = {};
            let result = {};
            pars.g_id = params[0];
            pars.g_at = params[1];
            this.utils.verifyParams(pars)
                .then(() => {
                    return this.utils.verifyGoogleAccessToken(pars.g_at, pars.g_id);
                })
                .then(res => {
                    if (res) {
                        return this.user.aggregate()
                            .lookup({
                                from: 'emails',
                                localField: '_id',
                                foreignField: 'owner',
                                as: 'emails' })
                            .match({'google.id': pars.g_id})
                            .project({
                                _id: 1,
                                google: 1,
                                status: 1,
                                emails: {
                                    email: 1,
                                    primary: 1
                                }
                            })
                            .exec();
                    } else reject ();
                })
                .then(users => {
                    if (users) {
                        if (users.length === 0) {
                            return reject({
                                code: 32610,
                                message: 'User not exists.'
                            });
                        } else if (users.length === 1 && users[0].emails.length > 0) {
                            result = {
                                    user: {
                                        id: users[0]._id.toString(),
                                        name: users[0].google.name,
                                        email: users[0].emails[0].email,
                                        status: users[0].status
                                    }
                                };
                            return this.user.update({'google.id': pars.g_id}, { $set: {
                                    'google.token': pars.g_at
                                }});
                        } else {
                            this.utils.log('Database error with google id:' + pars.g_id, 0);
                            return reject({
                                code: 32611
                            });
                        }
                    } else {
                        return reject();
                    }
                })
                .then(updt => {
                    if (updt && updt.ok === 1) {
                        return this._getJWT(result.user.id);
                    } else {
                        this.utils.log('Database error with update google token:' + pars.g_at
                            + ' in google user id:' + pars.g_id, 0);
                        return reject({
                            code: 32615
                        });
                    }
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
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
        }
    });
};
Auth.prototype.auth_linked_login = function (params) {};
Auth.prototype.auth_twitter_login = function (params) {};
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
        try {console.dir(params);
            const pars = {};
            pars.token = params[0];
            pars.id = params[1];
            this.utils.verifyParams(pars)
                .then(() => {
                    return this._verifyJWT(pars.token);
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
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
        }
    })
};
Auth.prototype._getJWT = function (id) {
    return new Promise( (resolve, reject) => {
        try {
            const token = this.jwt.sign({
                id: id
            }, this._key, {
                expiresIn: this.tokenExp
            });
            resolve(token);
        } catch (e) {
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
        }
    })
};
Auth.prototype._verifyJWT = function (token) {
    return new Promise( (resolve, reject) => {
        try {
            this.jwt.verify(token, this._key, (err, data) => {
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
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
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
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
        }
    });
};

module.exports = Auth;