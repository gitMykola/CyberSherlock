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
User.prototype.user_create_local = async function (params) {
    const pars = {};
    pars.password = params[0] || '';
    if (params[1] && params[1].length > 0) pars.email = params[1];
    if (params[2] && params[2].length > 0) pars.phone = params[2];
    await this.utils.verifyParams(pars);
    if (pars.email && pars.phone) {
        return await this._create_user_local_with_email_phone(pars);
    } else if (pars.email) {
        return await this._create_user_local_with_email(pars);
    } else return await this._create_user_local_with_phone(pars);
};
User.prototype.user_create_facebook = async function (params) {};
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
User.prototype.user_create_google = async function (params) {
    const pars = {};
    pars.g_id = params[0] || '';
    pars.g_at = params[1] || '';
    pars.email = params[2] || '';
    if (params[3] && params[3].length) pars.name = params[3];
    await this.utils.verifyParams(pars);
    await this.utils.verifyGoogleAccessToken(pars.g_at, pars.g_id);
    await this._check_google_user_by_id_email(pars.g_id, pars.email);
    return await this._create_user_google(pars);
};
User.prototype.user_create_linked = async function () {};
User.prototype.user_create_twitter = async function () {};
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
User.prototype._create_user_local_with_email = async function (pars) {
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
User.prototype._create_user_local_with_phone = async function (pars) {
        const newUser = new this.user(),
            newPhone = new this.phone();
        const phones = await this.phone.find({
            phone: pars.phone,
            status: true
        });
        if (phones.length !== 0) {
            if(phones.length > 0) {
                throw new this.error.userError(`Phone ${pars.phone} busy`);
            } else {
                throw new this.error.serviceError(`Phone ${pars.phone} error`);
            }
        } else {
            newPhone.primary = true;
            newUser.password = await newUser.hash(pars.password);
            await newUser.save();
            newPhone.owner = newUser._id;
            newPhone.phone = pars.phone;
            newPhone.code = this.randomSTR.generate(6);
            await newPhone.save();
            const phoneConfirmation = await this._send_phone_confirmation(
                newUser._id,
                newPhone.phone,
                newPhone.code
            );
            return Object.assign({
                status: 'success',
                user: {
                    id: newUser._id,
                    phone: newPhone.phone
                }
            }, phoneConfirmation);
        }
};
User.prototype._create_user_local_with_email_phone = async function (pars) {
        const newUser = new this.user(),
            newEmail = new this.email(),
            newPhone = new this.phone();
        const emails = await this.email.find({
            email: pars.email,
            status: true
        });
        if (emails.length !== 0) {
            if(emails.length > 0) {
                throw new this.error.userError(`Email ${pars.phone} busy`);
            } else {
                throw new this.error.serviceError(`Email ${pars.phone} error`);
            }
        } else {
            newEmail.primary = true;
            const phones = await this.phone.find({
                phone: pars.phone,
                status: true
            });
            if (phones.length !== 0) {
                if(phones.length > 0) {
                    throw new this.error.userError(`Phone ${pars.phone} busy`);
                } else {
                    throw new this.error.serviceError(`Phone ${pars.phone} error`);
                }
            } else {
                newPhone.primary = true;
                newUser.password = await newUser.hash(pars.password);
                await newUser.save();
                newEmail.owner = newUser._id;
                newEmail.email = pars.email;
                newEmail.code = this.randomSTR.generate(this.config.email.codeLength);
                await newEmail.save();
                newPhone.owner = newUser._id;
                newPhone.phone = pars.phone;
                newPhone.code = this.randomSTR.generate(this.config.phone.codeLength);
                newPhone.save();
                const phoneConfirmation = await this._send_phone_confirmation(
                    newUser._id,
                    newPhone.phone,
                    newPhone.code
                );
                const emailConfirmation = await this._send_email_confirmation(
                    newUser._id.toString(),
                    newEmail.email,
                    newEmail.code
                );
                return Object.assign({
                    status: 'success',
                    user: {
                        id: newUser._id,
                        phone: newPhone.phone,
                        email: newEmail.email
                    }
                }, phoneConfirmation, emailConfirmation);
            }
        }
};
User.prototype._create_user_google = async function (pars) {
        const newUser = new this.user(),
            newEmail = new this.email();
            newEmail.primary = true;
            newUser.google.token = pars.g_at;
            newUser.google.id = pars.g_id;
            newUser.google.name = pars.name || '';
            await newUser.save();
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
User.prototype._check_google_user_by_id_email = async function(id, email) {
    try {
        const gUser = this.user.aggregate()
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
                    {'google.id': id},
                    {
                        emails: {
                            $elemMatch: {
                                email: email,
                                status: true
                            }
                        }
                    }
                ]
            })
            .exec();
        if (gUser.length !== 0) {
            throw new this.errors.userError('Google id or email busy.');
        } else {
            return true;
        }
    } catch (error) {
        throw new this.errors.serviceError('Database error with google id:' + pars.g_id + ' ' + error.message);
    }
};

module.exports = User;