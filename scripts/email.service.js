function Email () {
    this.result = 'Email service Ok.';
}
Email.prototype.email_state = function (params) {
    return new Promise(resolve => {
        resolve(this.result);
    })
};

module.exports = Email;