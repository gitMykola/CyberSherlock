function Phone (appRoot) {
    this._init(appRoot);
}
Phone.prototype._init = function (appRoot) {
    this.name = 'phone';
    this.config = require(appRoot + 'config');
    require(appRoot + 'lib/service').init(this, appRoot, this.config);
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
Phone.prototype.phone_send_confirmation_viber = function (params) {
    return new Promise((resolve, reject) => {
        const pars = {};
        pars.id = params[0] || '';
        pars.phone = params[1] || '';
        pars.code = params[2] || '';
        this.utils.verifyParams(pars)
            .then(() => {
                return this.user.findOne({_id: new this.db.id(pars.id)});
            })
            .then(user => {
                if (user) {
                    return this.phone.findOne({
                        phone: pars.phone,
                        owner: user._id,
                        status: false
                    });
                } else {
                    return reject('No user with id: ' + pars.id);
                }
            })
            .then(phn => {
                if (phn) {
                    return this._send(phn.phone);
                } else {
                    return reject('No unconfirmed phone: ' + pars.phone + ' in database!');
                }
            })
            .then(resp => {
                if (resp) {
                    return resolve(resp);
                } else {
                    return reject('Phone not sended.');
                }
            })
            .catch(e => {
                return reject(e);
            })
    })
};
Phone.prototype._send = function (phone) {
    return new Promise( (resolve, reject) => {
        this.log(phone);
        resolve('Phone sent.');
    })
};
module.exports = Phone;