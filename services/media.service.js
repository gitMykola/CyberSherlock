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
    this.name = 'media';
    this.config = require(appRoot + 'config');
    require(appRoot + 'lib/service').init(
        this,
        {
            appRoot: appRoot,
            config: this.config,
            models: ['user', 'phone', 'email', 'profile', 'task', 'media'],
            libs: ['log', 'db', 'utils']

        });
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
        try {
            const self = this;
            const data = JSON.parse(params[0]);
            let newMedia = {};
            this.utils.verifyParams(data)
                .then(() => {
                    newMedia = new self.media(data);
                    return newMedia.save();
                })
                .then(media => {
                    if(!media) {
                        return reject(false);
                    } else {
                        self.utils.sendToService({
                            method: 'monitor_new_media',
                            params: [{
                                id: newMedia._id,
                                user: data.user,
                                location: data.location,
                                category: data.category,
                                created: data.created,
                                filename: data.filename,
                                url: data.url,
                                direction: data.direction
                            }]
                        })
                            .catch(err => {
                                self.log(err, 0);
                            });
                        return  resolve({
                            id: newMedia._id,
                        });
                    }
                })
                .catch(err => {console.dir(err);
                    return reject(err);
                });
        } catch (error) {console.dir(error);
            return reject(error);
        }
    })
};
module.exports = Media;