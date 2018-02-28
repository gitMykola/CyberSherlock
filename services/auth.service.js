function Auth () {
    this.result = 'Auth service Ok.';
}
Auth.prototype.auth_state = function (params) {
    return new Promise(resolve => {
        resolve(this.result);
    })
};
Auth.prototype.auth_auth = function (params) {
    return new Promise(resolve => {
        this.result = params[0] === '123'
            ? {auth: true}
            : {auth: false, message: 'token wrong.'};
        resolve(this.result);
    })
};

module.exports = Auth;