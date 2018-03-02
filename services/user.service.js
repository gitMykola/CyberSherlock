const config = require('../assets/config'),
      Log = require('../lib/log'),
      Db = require('../lib/db'),
      XHR = require('../lib/xhr'),
      RandomString = require('randomstring'),
      Users = require('../models/user'),
      Emails = require('../models/email'),
      Phones = require('../models/phone'),
      Profiles = require('../models/profile'),
      Tasks = require('../models/task');
function User () {
    this._init();
}
User.prototype._init = function () {
    this.name = 'user';
    this.log = Log;
    this.db = Db;
    this.dbState = this.db.connect({
            db: config.db,
            log: this.log
        });
    this.xhr = XHR;
    this.randomSTR = RandomString;
    this.user = Users;
    this.email = Emails;
    this.phone = Phones;
    this.profile = Profiles;
    this.task = Tasks;
};
/**
* @summary Check service state
* @return boolean - service state (1 - Ok, 0 - Not working)
*/
User.prototype.state = function () {
  return this.dbState;
};
/**
 * @summary Create new user.
 * @params [
 *          password - string,
 *          email/third - string, email - client email/ third - enum('facebook', 'google', 'linked')
 *          phone/id - string, phone - client phone number, id - third id
 *          ] Array - input params.
 * @return {string} string - translated key value.
 */
User.prototype.user_create_local = function (params) {
    return new Promise((resolve, reject) => {
        try {
            const pars = {};
            pars.password = params[0] || '';
            if (params[1] && params[1].length) pars.email = params[1];
            if (params[2] && params[2].length) pars.phone = params[2];
            this._paramsVerify(pars)
                .then(() => {
                    if (pars.email && pars.phone) {
                        return resolve(this
                            ._create_user_local_with_email_phone(pars));
                    } else if (pars.email) {
                        return resolve(this
                            ._create_user_local_with_email(pars));
                    } else return resolve(this
                        ._create_user_local_with_phone(pars));
                })
                .catch(e => reject({
                    status: false,
                    error: e
                }))
        } catch (e) {
            reject(e.message);
        }
    })
};
User.prototype.user_auth_create_email = function (params) {
    return new Promise( (resolve, reject) => {
        try {
            const pars = {};
            pars.id = params[0];
            pars.email = params[1];
            this._paramsVerify(pars)
                .then(() => {
                    return this.user.find({
                        _id: new this.db.id(pars.id)
                    });
                })
                .then(user => {
                    if (user && user.length) {
                        return this.email.find().or([
                            {
                                owner: new this.db.id(pars.id),
                                email: pars.email
                            },
                            {
                                email: pars.email,
                                status: true
                            }
                        ]);
                    } else {
                        return reject ('User id:' + pars.id + ' not exists!');
                    }
                })
                .then(existEml => {
                    if (existEml && existEml.length === 0) {
                        const newEmail = new this.email();
                        newEmail.owner = new this.db.id(pars.id);
                        newEmail.email = pars.email;
                        newEmail.code = this.randomSTR.generate(6);
                        return newEmail.save();
                    } else {
                        return reject('Email: ' + pars.email + ' busy!');
                    }
                })
                .then(eml => {
                    if (eml) {
                        return resolve(this._send_email_confirmation(
                            pars.id,
                            eml.email,
                            eml.code
                        ));
                    } else {
                        return reject('Email create error.');
                    }
                })
                .catch(e => {
                    return reject(e);
                })
        } catch (e) {
            return reject(e)
        }
    })
};
User.prototype.user_auth_create_phone = function (params) {
    return new Promise( (resolve, reject) => {
        try {
            const pars = {};
            pars.id = params[0];
            pars.phone = params[1];
            this._paramsVerify(pars)
                .then(() => {
                    return this.user.find({
                        _id: new this.db.id(pars.id)
                    });
                })
                .then(user => {
                    if (user && user.length) {
                        return this.phone.find().or([
                            {
                                owner: new this.db.id(pars.id),
                                phone: pars.phone
                            },
                            {
                                phone: pars.phone,
                                status: true
                            }
                        ]);
                    } else {
                        return reject ('User id:' + pars.id + ' not exists!');
                    }
                })
                .then(existPhn => {
                    if (existPhn && existPhn.length === 0) {
                        const newPhone = new this.phone();
                        newPhone.owner = new this.db.id(pars.id);
                        newPhone.phone = pars.phone;
                        newPhone.code = this.randomSTR.generate(6);
                        return newPhone.save();
                    } else {
                        return reject('Phone: ' + pars.phone + ' busy!');
                    }
                })
                .then(phn => {
                    if (phn) {
                        return resolve(this._send_phone_confirmation(
                            pars.id,
                            phn.phone,
                            phn.code
                        ));
                    } else {
                        return reject('Phone create error.');
                    }
                })
                .catch(e => {
                    return reject(e);
                })
        } catch (e) {
            return reject(e)
        }
    })
};
User.prototype._create_user_local_with_email = function (pars) {
    return new Promise( (resolve, reject)=> {
        const newUser = new this.user(),
            newEmail = new this.email();
        this.email.find({email: pars.email})
            .then(emails => {
                if (emails.length > 0) {
                    let confirmed = null;
                    emails.forEach(eml => {
                        if (eml.status) confirmed = true;
                    });
                    if (confirmed) {
                        return reject({
                            status: false,
                            error: 'Email busy.'
                        });
                    } else return newUser.hash(pars.password);
                } else {
                    newEmail.primary = true;
                    return newUser.hash(pars.password);
                }
            })
            .then(hash => {
                newUser.password = hash;
                return hash ? newUser.save() : reject();
            })
            .then(user => {
                if (user) {
                    newEmail.owner = newUser._id;
                    newEmail.email = pars.email;
                    newEmail.code = this.randomSTR.generate(6);
                    return newEmail.save();
                } else return reject();
            })
            .then(email => {
                if (email) {
                    this._send_email_confirmation(
                        newUser._id,
                        newEmail.email,
                        newEmail.code
                    )
                        .then(resp => {
                            return resolve(Object.assign({
                                status: 'success',
                                user: {
                                    id: newUser._id,
                                    email: newEmail.email
                                }
                            }, resp));
                        })
                        .catch(e => {
                            return reject(e);
                        });
                } else return reject();
            })
            .catch(e => reject(e));
    })
};
User.prototype._create_user_local_with_phone = function (pars) {
    return new Promise( (resolve, reject)=> {
        const newUser = new this.user(),
            newPhone = new this.phone();
        this.phone.find({phone: pars.phone})
            .then(phones => {
                if (phones.length > 0) {
                    let confirmed = null;
                    phones.forEach(phn => {
                        if (phn.status) confirmed = true;
                    });
                    if (confirmed) {
                        return reject({
                            status: false,
                            error: 'Email busy.'
                        });
                    } else return newUser.hash(pars.password);
                } else {
                    newPhone.primary = true;
                    return newUser.hash(pars.password);
                }
            })
            .then(hash => {
                newUser.password = hash;
                return hash ? newUser.save() : reject();
            })
            .then(user => {
                if (user) {
                    newPhone.owner = newUser._id;
                    newPhone.phone = pars.phone;
                    newPhone.code = this.randomSTR.generate(6);
                    return newPhone.save();
                } else return reject();
            })
            .then(phone => {
                if (phone) {
                    this._send_phone_confirmation(
                        newUser._id,
                        newPhone.phone,
                        newPhone.code
                    )
                        .then(resp => {
                            return resolve(Object.assign({
                                status: 'success',
                                user: {
                                    id: newUser._id,
                                    phone: newPhone.phone
                                }
                            }, resp));
                        })
                        .catch(e => {
                            return reject(e);
                        });
                } else return reject();
            })
            .catch(e => reject(e));
    })
};
User.prototype._create_user_local_with_email_phone = function (pars) {
    return new Promise( (resolve, reject)=> {
        const newUser = new this.user(),
            newEmail = new this.email(),
            newPhone = new this.phone();
        this.email.find({email: pars.email})
            .then(emails => {
                if (emails.length > 0) {
                    let confirmed = null;
                    emails.forEach(eml => {
                        if (eml.status) confirmed = true;
                    });
                    if (confirmed) {
                        return reject({
                            status: false,
                            error: 'Email busy.'
                        });
                    } else return this.phone.find({
                        phone: pars.phone
                    });
                } else {
                    newEmail.primary = true;
                    return this.phone.find({
                        phone: pars.phone
                    });
                }
            })
            .then(phones => {
                if (phones.length > 0) {
                    let confirmed = false;
                    phones.forEach(phn => {
                        if (phn.status) confirmed = true;
                    });
                    if (confirmed) {
                        return reject({
                            status: false,
                            error: 'Phone busy.'
                        });
                    } else return newUser.hash(pars.password);
                } else {
                    newPhone.primary = true;
                    return newUser.hash(pars.password);
                }
            })
            .then(hash => {
                newUser.password = hash;
                return hash ? newUser.save() : reject();
            })
            .then(user => {
                if (user) {
                    newEmail.owner = newUser._id;
                    newEmail.email = pars.email;
                    newEmail.code = this.randomSTR.generate(6);
                    return newEmail.save();
                } else return reject();
            })
            .then(email => {
                if (email) {
                    newPhone.owner = newUser._id;
                    newPhone.phone = pars.phone;
                    newPhone.code = this.randomSTR.generate(6);
                    return newPhone.save();
                } else return reject();
            })
            .then(phone => {
                if (phone) {
                    this._send_phone_confirmation(
                        newUser._id,
                        newPhone.phone,
                        newPhone.code
                    )
                        .then(resph => {
                            return Object.assign({
                                status: 'success',
                                user: {
                                    id: newUser._id,
                                    email: newEmail.email
                                }
                            }, resph);
                        })
                        .then(resp => {
                            this._send_email_confirmation(
                                newUser._id,
                                newEmail.email,
                                newEmail.code
                            )
                                .then(respe => {
                                    resp.user.phone = newPhone.phone;
                                    return resolve(Object
                                        .assign(resp, respe));
                                })
                                .catch(e => {
                                    return reject(e);
                                });
                        })
                        .catch(e => {
                            return reject(e);
                        });
                } else return reject();
            })
            .catch(e => reject(e));
    })
};
User.prototype._send_email_confirmation = function (id, email, code) {
   return new Promise( (resolve) => {
       this.xhr({
           url: 'http://localhost:3080',
           body: {
               jsonrpc: "2.0",
               id:"user_service",
               method: "email_send_confirmation_email",
               params: [
                   id,
                   email,
                   code
               ]
           }
       })
           .then(resp => {
               return resolve({sentEmailConfirmation: true
               });
           })
           .catch(err => {
               return resolve({
                   sentEmailConfirmation: false
               });
           });
   });
};
User.prototype._send_phone_confirmation = function (id, phone, code) {
    return new Promise( (resolve) => {
        this.xhr({
            url: 'http://localhost:3080',
            body: {
                jsonrpc: "2.0",
                id:"user_service",
                method: "phone_send_confirmation_viber",
                params: [
                    id,
                    phone,
                    code
                ]
            }
        })
            .then(resp => {
                return resolve({sentPhoneConfirmation: true
                });
            })
            .catch(err => {
                return resolve({
                    sentPhoneConfirmation: false
                });
            });
    });
};
User.prototype._create_user_third = function (params) {
    return new Promise((resolve, reject) => {})
};
User.prototype.user_auth_update = function (params) {
    return new Promise(resolve => {
        this.result = 'User updated';
        resolve(this.result);
    })
};
User.prototype._paramsVerify = function (params) {
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

module.exports = User;