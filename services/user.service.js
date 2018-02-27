function User () {
    this.result = 'User service Ok.';
}
User.prototype.user_state = function (params) {
  return new Promise(resolve => {
      resolve(this.result);
  })
};

module.exports = User;