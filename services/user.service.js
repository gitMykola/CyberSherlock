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
User.prototype.user_create = function (params) {
    return new Promise((resolve, reject) => {
        try {
            if (params[0].length > 0) {
                this._create_user_local(params)
                    .then(user => resolve(user))
                    .catch(e => reject(e));
            } else {
                this._create_user_third(params)
                    .then(user => resolve(user))
                    .catch(e => reject(e));
            }
        } catch (e) {
            reject(e.message);
        }
    })
};
User.prototype._create_user_local = function (params) {
   return new Promise((resolve, reject) => {
       const pars = {};
       pars.password = params[0];
       if (params[1].length) pars.email = params[1];
       if (params[2].length) pars.phone = params[2];
       const newUser = new this.user();
       this._paramsVerify(pars)
           .then(() => {
               if (pars.email) {
                   return this.email.find(
                               {
                                   email: pars.email,
                                   status: true
                               }
                           )
                       .then(eml => {
                           if (eml && eml.length === 0) {
                               if (pars.phone) {
                                   return this.phone.find(
                                       {
                                           phone: pars.phone,
                                           status: true
                                       }
                                   )
                               } else return true;
                           } else return reject('Email busy.');
                       })
                       .catch(e => {
                           return reject(e);
                       });
               } else return this.phone.find(
                           {
                               phone: pars.phone,
                               status: true
                           }
                       );
           })
           .then(phn => {
               if (phn && !phn.length) {
                   return newUser.hash(pars.password);
               } else {
                   return reject('Phone busy.');
               }
           })
           .then(hash => {
               if (hash) {
                   newUser.password = hash;
                   if (pars.email) newUser.email = pars.email;
                   if (pars.phone) newUser.phone = pars.phone;
                   return newUser.save();
               } else {
                   return reject('Hash error');
               }
           })
           .then(user => {
               if (user) {
                   if (pars.email) {
                       const newEmail = new this.email();
                       newEmail.owner = user._doc._id;
                       newEmail.email = user._doc.email;
                       newEmail.code = this.randomSTR.generate(6);
                       if (!pars.phone) {
                           return newEmail.save();
                       } else {
                           return newEmail.save()
                               .then(email => {
                                   const newPhone = new this.phone();
                                   newPhone.owner = user._doc._id;
                                   newPhone.phone = pars.phone;
                                   return newPhone.save();
                               })
                               .catch(e => {
                                   return reject(e)
                               })
                       }
                   } else {
                       const newPhone = new this.phone();
                       newPhone.owner = user._doc._id;
                       newPhone.phone = pars.phone;
                       return newPhone.save();
                   }
               } else {
                   return user;
               }
           })
           .then(obj => {
               if (obj) {
                   pars.id = obj._doc.owner.toString();
                   if (obj._doc.email) {
                       this._send_email_confirmation(
                                    pars.id,
                                    obj._doc.email,
                                    obj._doc.code
                                )
                           .then(resp => {
                               resolve (Object.assign(pars, resp));
                           })
                           .catch(e => {
                               resolve (Object.assign(pars, e));
                           });
                   } else return resolve(Object.assign(pars, {id: obj._doc.owner}));
               } else {
                   return null;
               }
           })
           .catch(e => reject(e));
   });
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
                            eml._doc.email,
                            eml._doc.code
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
               return resolve({sentEmailConfirmation: {
                       success: true,
                       err: null
                   }
               });
           })
           .catch(err => {
               return resolve({
                   sentEmailConfirmation: {
                       success: false,
                       err: err
                   }
               });
           });
   });
};
User.prototype.user_auth_create_phone = function (id, phone, code) {};
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