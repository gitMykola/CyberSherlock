/**
 * @summary Media service class
 */
function Media (appRoot) {
    this._init(appRoot);
}
/**
 * @summary Init class
 */
Media.prototype._init = function (appRoot) {
    this.name = 'user';
    this.config = require(appRoot + 'config');
    require(appRoot + 'lib/service').init(
        this,
        appRoot,
        this.config,
        ['user', 'phone', 'email', 'profile', 'task', 'media'],
        ['log', 'db', 'xhr', 'utils']);
    this.randomSTR = require('randomstring');
};
/**
 * @summary Create new media.
 * @params [
 *          media: {
 *
 *          } - Media data
 *          ] Array - input params.
 * @return {string} string - translated key value.
 */
Media.prototype.media_auth_create = function(params) {
    return new Promise((resolve, reject) => {
        console.dir(params);
        return resolve('Media service OK!');
    })
};
module.exports = Media;