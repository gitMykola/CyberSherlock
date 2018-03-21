const config = require('../config'),
    Log = require('../lib/log'),
    Utils = require('../lib/utils'),
    Db = require('../lib/db'),
    Mailer = require('nodemailer'),
    Users = require('../models/user'),
    Emails = require('../models/email'),
    Phones = require('../models/phone');

function Email () {
    this._init();
}
Email.prototype._init = function () {
    this.name = 'email';
    this.log = Log;
    this.db = Db;
    this.dbState = this.db.connect({
        db: config.db,
        log: this.log
    });
    this.mailer = Mailer;
    this.emailConfig = config.email;
    this.user = Users;
    this.email = Emails;
    this.phone = Phones;
    this.utils = Utils;
};
/**
 * @summary Check service state
 * @return boolean - service state (1 - Ok, 0 - Not working)
 */
Email.prototype.state = function () {
    return this.dbState;
};
/**
 * @summary Send email confirmation code
 * @params - [
 *              id - string, user id
 *              email - string, user email
 *              code - string - email confirmation code
 *          ] - Array of input params
 * @return boolean - service state (1 - Ok, 0 - Not working)
 */
Email.prototype.email_send_confirmation_email = function (params) {
    return new Promise((resolve, reject) => {
        const pars = {};
        pars.id = params[0] || '';
        pars.email = params[1] || '';
        pars.code = params[2] || '';
        this.utils.verifyParams(pars)
            .then(() => {
                return this.user.findOne({_id: new this.db.id(pars.id)});
            })
            .then(user => {
                if (user) {
                    return this.email.findOne({
                        email: pars.email,
                        owner: user._id,
                        status: false
                    });
                } else {
                    return reject('No user with id: ' + pars.id);
                }
            })
            .then(eml => {
                if (eml) {
                    return this._send({
                        from: this.emailConfig.defaultSenderEmail,
                        to: pars.email,
                        subject: 'Cyber Sherlock email confirmation.',
                        text: 'Code: ' + pars.code,
                        html: '<h3>Code: ' + pars.code + '<h3>'
                    })
                } else {
                    return reject('No unconfirmed email: ' + pars.email + ' in database!');
                }
            })
            .then(resp => {
                if (resp) {
                    return resolve(resp);
                } else {
                    return reject('Email not sended.');
                }
            })
            .catch(e => {
                return reject(e);
            })
    })
};
Email.prototype._send = function (email) {
    return new Promise( (resolve, reject) => {
        const transport = this.mailer.createTransport({
            host: this.emailConfig.smtpHost,
            port: this.emailConfig.smtpPort,
            secure: this.emailConfig.smtpSecure,
            auth:{
                user: this.emailConfig.smtpUser,
                pass: this.emailConfig.smtpPass
            }
        });
        transport.verify((err, s) => {
            if (err) {
                return reject(err);
            } else {
                transport.sendMail(email, (err, info) => {
                    if(err) {
                        return reject('EmailService nodemailer sendMail error.');
                    } else {
                        return resolve('Message sent: '+info.response);
                    }
                })
            }
        });
    })
};
Email.prototype.setKey = function (key) {
    this.key = key;
};
module.exports = Email;