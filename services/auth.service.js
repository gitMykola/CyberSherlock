function Auth () {
    this.result = 'Auth service Ok.';
}
Auth.prototype.auth_state = function (params) {
    return new Promise(resolve => {
        resolve(this.result);
    })
};

module.exports = Auth;