function User () {
    this.result = 'User service Ok.';
    this.user = require('../models/user');
    this.profile = require('../models/profile');
    this.email = require('../models/email');
    this.phone = require('../models/phone');
}
User.prototype.user_state = function (params) {
  return new Promise(resolve => {
      resolve(this.result);
  })
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
                   return this.user.findOne({email: pars.email})
                       .then(user => {
                           if (user) {
                               reject('Email busy.');
                               return user;
                           } else {
                               if (!pars.phone) {
                                   return null;
                               } else {
                                   return this.user.findOne({phone: pars.phone})
                               }
                           }
                       })
                       .catch(e => {
                           reject(e);
                           return e;
                       });
               } else {
                   return this.user.findOne({phone: pars.phone});
               }
           })
           .then(user => {
               if (user) {
                   reject('Phone busy.');
                    return false;
               } else {
                   return newUser.hash(pars.password);
               }
           })
           .then(hash => {
               if (!hash) {
                   return reject('Hash error');
               } else {
                   newUser.password = hash;
                   if (pars.email) newUser.email = pars.email;
                   if (pars.phone) newUser.phone = pars.phone;
                   return newUser.save();
               }
           })
           .then(user => {
               if (user) {
                   if (pars.email) {
                       const newEmail = new this.email();
                       newEmail.owner = user._doc._id;
                       newEmail.email = user._doc.email;
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
                   return resolve(Object.assign(pars, {id: obj._doc.owner}));
               } else {
                   return null;
               }
           })
           .catch(e => reject(e));
   });
};
User.prototype._create_user_third = function (params) {
    return new Promise((resolve, reject) => {})
};
User.prototype._user_by_email = function (email) {
    return new Promise((resolve, reject) => {
        this.user.findOne({email: email})
            .then(user => resolve(user))
            .catch(e => reject(e));
    })
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
                return value.length >= 8 && value.length < 256;
            },
            email: (value) => {
                return value.length < 256
                && value.match
                    (/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
            },
            phone: (value) => {
                return value.length < 256
                && value.match
                    (/^\(*\+*[1-9]{0,3}\)*-*[1-9]{0,3}[-. /]*\(*[2-9]\d{2}\)*[-. /]*\d{3}[-. /]*\d{4} *e*x*t*\.* *\d{0,4}$/);
            },
            third: (value) => {
                return value.length > 0 && value.length < 50;
            },
            id: (value) => {
                return value.length > 0 && value.length < 256;
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