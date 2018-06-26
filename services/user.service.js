/**
 * @summary User service class
 */
function User (appRoot) {
    this._init(appRoot);
}
/**
 * @summary Init class
 */
User.prototype._init = function (appRoot) {
    this.name = 'user';
    this.config = require(appRoot + '/config');
    require(appRoot + '/lib/service').init(
        this,
        {
            appRoot: appRoot,
            config: this.config,
            models: ['user', 'phone', 'email', 'profile', 'task'],
            libs: ['log', 'db', 'utils']
        });
    this.randomSTR = require('randomstring');
    this.google = this.config.auth.google;
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
            this.utils.verifyParams(pars)
                .then(() => {
                    if (pars.email && pars.phone) {
                        return resolve(this
                            ._create_user_local_with_email_phone(pars));
                    } else if (pars.email) {
                        return resolve(this
                            ._create_user_local_with_email_(pars));
                    } else return resolve(this
                        ._create_user_local_with_phone(pars));
                })
                .catch(e => reject(e))
        } catch (e) {
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
        }
    })
};
User.prototype.user_create_facebook = function (params) {};
/**
 * @summary Create new user with google.
 * @params [
 *          string, google user id
 *          string, google user access token
 *          string, google user email
 *          string(options), google user name
 *          ] Array - input params.
 * @return Promise(
 *                  resolve - user object
 *                  | reject - error object
 *              )
 */
User.prototype.user_create_google = function (params) {
    return new Promise((resolve, reject) => {
        try {
            const pars = {};
            pars.g_id = params[0] || '';
            pars.g_at = params[1] || '';
            pars.email = params[2] || '';
            if (params[3] && params[3].length) pars.name = params[3];
            this.utils.verifyParams(pars)
                .then(() => {
                        return resolve(this
                            ._create_user_google(pars));
                })
                .catch(e => {
                    return reject(e)
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
User.prototype.user_create_linked = function () {};
User.prototype.user_create_twitter = function () {};
/**
 * @summary Create new user with email.
 * @params [
 *          password - string, user password
 *          email - string, user email
 *          ] Array - input params.
 * @return Promise(
 *                  resolve - {
 *                  sentEmailConfirmation: boolean, ok/not ok
 *                  }
 *              )
 */
User.prototype.user_auth_create_email = function (params) {
    return new Promise( (resolve, reject) => {
        try {
            const pars = {};
            pars.id = params[0];
            pars.email = params[1];
            this.utils.verifyParams(pars)
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
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
        }
    })
};
/**
 * @summary Create new user with phone.
 * @params [
 *          password - string, user password
 *          phone - string, user phone number
 *          ] Array - input params.
 * @return Promise(
 *                  resolve - {
 *                  sentPhoneConfirmation: boolean, ok/not ok
 *                  }
 *              )
 */
User.prototype.user_auth_create_phone = function (params) {
    return new Promise( (resolve, reject) => {
        try {
            const pars = {};
            pars.id = params[0];
            pars.phone = params[1];
            this.utils.verifyParams(pars)
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
            this.log(e.message, 0);
            return reject({
                code: 32609,
                message: ''
            });
        }
    })
};
User.prototype.user_auth_update = function (params) {
    return new Promise(resolve => {
        this.result = 'User updated';
        resolve(this.result);
    })
};
User.prototype._create_user_local_with_email = function (pars) {
    return new Promise( (resolve, reject)=> {
        const newUser = new this.user(),
            newEmail = new this.email();
        this.email.find({
            email: pars.email,
            status: true
        })
            .then(emails => {
                    if (emails && emails.length > 0) {
                        return reject({
                            code: 32621,
                            message: 'Email busy.'
                        });
                    } else if (emails && emails.length === 0) {
                        newEmail.primary = true;
                        return newUser.hash(pars.password);
                    } else {
                        this.log('Database error with email:' + pars.email, 0);
                        return reject({
                            code: 32620
                        });
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
            .catch(e => {
                return reject(e)
            });
    })
};
User.prototype._create_user_local_with_email_ = async function (pars) {
        const newUser = new this.user(),
            newEmail = new this.email();
        const emails = await this.email.find({
            email: pars.email,
            status: true
        });
        if (emails.length !== 0) {
            if (emails.length > 0) {
                throw new this.errors.userError(`Email ${pars.email} busy`);
            } else {
                throw new this.errors.serviceError(`Email ${pars.email} error`);
            }
        } else {
            newEmail.primary = true;
            newUser.password = await newUser.hash(pars.password);
            const user = await newUser.save();
            newEmail.owner = newUser._id;
            newEmail.email = pars.email;
            newEmail.code = this.randomSTR.generate(6);
            await newEmail.save();
            const emailConfirmation = await this._send_email_confirmation(
                newUser._id,
                newEmail.email,
                newEmail.code
            );
            return Object.assign({
                status: 'success',
                user: {
                    id: newUser._id,
                    email: newEmail.email
                }
            }, emailConfirmation);
        }
};
User.prototype._create_user_local_with_phone = function (pars) {
    return new Promise( (resolve, reject)=> {
        const newUser = new this.user(),
            newPhone = new this.phone();
        this.phone.find({
            phone: pars.phone,
            status: true
        })
            .then(phones => {
                if (phones && phones.length > 0) {
                    return reject({
                            code: 32622,
                            message: 'Phone busy.'
                        });
                } else if (phones && phones.length === 0) {
                    newPhone.primary = true;
                    return newUser.hash(pars.password);
                } else {
                    this.log('Database error with phone:' + pars.phone, 0);
                    return reject({
                        code: 32620
                    });
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
            .catch(e => {
                return reject(e)
            });
    })
};
User.prototype._create_user_local_with_email_phone = function (pars) {
    return new Promise( (resolve, reject)=> {
        const newUser = new this.user(),
            newEmail = new this.email(),
            newPhone = new this.phone();
        this.email.find({
            email: pars.email,
            status: true
        })
            .then(emails => {
                if (emails && emails.length > 0) {
                    return reject({
                            code: 32621,
                            error: 'Email busy.'
                        });
                } else if (emails && emails.length === 0) {
                    newEmail.primary = true;
                    return this.phone.find({
                        phone: pars.phone,
                        status: true
                    });
                } else {
                    this.log('Database error with email:' + pars.email, 0);
                    return reject({
                        code: 32620
                    });
                }
            })
            .then(phones => {
                if (phones && phones.length > 0) {
                    return reject({
                            code: 32622,
                            error: 'Phone busy.'
                        });
                } else if (phones && phones.length === 0) {
                    newPhone.primary = true;
                    return newUser.hash(pars.password);
                } else {
                    this.log('Database error with phone:' + pars.phone, 0);
                    return reject({
                        code: 32620
                    });
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
                                    id: newUser._id.toString(),
                                    email: newEmail.email
                                }
                            }, resph);
                        })
                        .then(resp => {
                            this._send_email_confirmation(
                                newUser._id.toString(),
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
            .catch(e => {
                return reject(e)
            });
    })
};
User.prototype._create_user_google = function (pars) {
    return new Promise( (resolve, reject)=> {
        const newUser = new this.user(),
            newEmail = new this.email();
        this.utils.verifyGoogleAccessToken(pars)
            .then(gresult => {
                if (!gresult) {
                    return reject();
                } else {
                    return this.user.aggregate()
                        .lookup({
                            from: 'emails',
                            localField: '_id',
                            foreignField: 'owner',
                            as: 'emails' })
                        .project({
                            _id: 1,
                            google: 1,
                            emails: {
                                email: 1,
                                status: 1,
                                primary: 1
                            },
                            status: 1,
                            profiles: 1
                        })
                        .match({
                            $or: [
                                {'google.id': pars.g_id},
                                {
                                    emails: {
                                        $elemMatch: {
                                            email: pars.email,
                                            status: true
                                        }
                                    }
                                }
                            ]
                        })
                        .exec();
                }
            })
            .then(users => {
                if (users && users.length > 0) {
                    return reject({
                            code: 32624,
                            error: 'Google id or email busy.'
                        });
                } else if (users && users.length === 0) {
                    newEmail.primary = true;
                    newUser.google.token = pars.g_at;
                    newUser.google.id = pars.g_id;
                    newUser.google.name = pars.name || '';
                    return newUser.save();
                } else {
                    this.log('Database error with google id:' + pars.g_id, 0);
                    return reject({
                        code: 32623
                    });
                }
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
                    return this._send_email_confirmation(
                        newUser._id,
                        newEmail.email,
                        newEmail.code
                    )
                } else return reject();
            })
            .then(sent => {
                if (sent) {
                    return resolve(Object.assign({
                        status: 'success',
                        user: {
                            id: newUser._id,
                            email: newEmail.email
                        }
                    }, sent));
                } else return reject();
            })
            .catch(e => reject(e));
    })
};
User.prototype._send_email_confirmation = function (id, email, code) {
   return new Promise( (resolve) => {
       this.utils.sendToService({
           id:"user_service",
           method: "email_send_confirmation_email",
           params: [
               id,
               email,
               code
               ]
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
        this.utils.sendToService({
            id:"user_service",
            method: "phone_send_confirmation_viber",
            params: [
                id,
                phone,
                code
                ]
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
User.prototype._remove_user = async function(params) {
        try {
            const self = this;
            if (! await self.utils.verifyParams(params)) return false;
            if(!params.id) {
                if(!params.email || !params.phone) {
                    this.utils.log('_remove_user not accept params '
                        + JSON.stringify(params) , 1);
                    return false;
                } else {
                    const remEmails = await self.email.find({email: params.email});
                    const remPhones = await self.phone.find({phone: params.phone});
                    remEmails.forEach(email => {
                        remPhones.forEach(phone => {
                            if (phone.owner.toString() === email.owner.toString()) {
                                params.id = phone.owner.toString();
                            }
                        })
                    });
                }
            }
            await self.user.deleteOne({_id: params.id});
            await self.email.deleteMany({owner: params.id});
            await self.phone.deleteMany({owner: params.id});
            await self.profile.deleteMany({user: params.id});
            return true;
        } catch (error) {
            this.utils.log(error, 0);
            return false;
        }
};

module.exports = User;