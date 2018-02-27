function Media () {
    this.result = 'Media service Ok.';
}
Media.prototype.media_state = function (params) {
    return new Promise(resolve => {
        resolve(this.result);
    })
};

module.exports = Media;