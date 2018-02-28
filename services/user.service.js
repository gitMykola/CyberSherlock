function User () {
    this.result = 'User service Ok.';
}
User.prototype.user_state = function (params) {
  return new Promise(resolve => {
      resolve(this.result);
  })
};
User.prototype.user_update = function (params) {
    return new Promise(resolve => {
        this.result = 'User updated';
        resolve(this.result);
    })
};

module.exports = User;