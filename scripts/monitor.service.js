/**
 * @summary Monitor service class
 */
function Monitor (appRoot) {
    this._init(appRoot);
}
/**
 * @summary Init class
 */
Monitor.prototype._init = function (appRoot) {
    this.name = 'monitor';
    this.config = require(appRoot + 'config');
    require(appRoot + 'lib/service').init(
        this,
        {
            appRoot: appRoot,
            config: this.config,
            models: ['user', 'phone', 'email', 'profile', 'task', 'media'],
            libs: ['log', 'db', 'utils', 'takeFreePort']
        });
    this.randomSTR = require('randomstring');
    this._initSocket();
};
Monitor.prototype._initSocket = function() {
    const self = this;
    self.socketStatus = false;
    self.server = require('http').createServer();
    self.io = require('socket.io')(self.server);
    self.io.on('connection', self._onConnect);
    self.server.on('error', self._serverError);
    self.server.on('listening', self._serverListenning);
    self.takeFreePort(self.config.services.portPool, self.log)
        .then(freePort => {
            self.socketPort = freePort;
            self.server.listen(freePort);
        })
        .catch()
};
Monitor.prototype._serverError = function(error) {
    this.log(error, 0);
    this.socketStatus = false;
};
Monitor.prototype._serverListenning = function() {
    this.log('Monitor listenning port ' + this.socketPort);
    this.socketStatus = true;
};
Monitor.prototype.monitor_get_status = function() {
    return this.socketStatus;
};
Monitor.prototype.state = function() {
    return new Promise((resolve, reject) => {
        const self = this;
        return setTimeout(() => {
            return self.socketStatus ? resolve({port: self.socketPort}) : reject();
        }, 30*1000);
    })
};
Monitor.prototype._onConnect = function(client) {
    client.on('event', this._clientMessage);
    this.io.on('disconnect', this._onDisconnect);
};
Monitor.prototype._onDisconnect = function() {};
Monitor.prototype._clientMessage = function(msg) {};
/**
 * @summary Born new media.
 * @params [
 *          media: {
 *
 *          } - Media data
 *          ] Array - input params.
 * @return {status} Boolean - emmit status.
 */
Monitor.prototype.monitor_auth_get_port = function() {
    return this.socketPort;
};
/**
 * @summary Broadcast 'New medias'.
 * @params [
 *          media: {
 *
 *          } - Media data
 *          ] Array - input params.
 * @return {status} Boolean - emmit status.
 */
Monitor.prototype.monitor_new_media = function(params) {
    return new Promise((resolve, reject) => {
        try {
            const self = this;
            params.forEach(media => {
                this.io.emit('broadcast', media);
            });
            return resolve();
        } catch (error) {
            return reject(error);
        }
    })
};
/**
 * @summary Take medias from poligon.
 * @params {
 *      poligon: [
 *          point: {
 *              lat: number,
 *              lng: number
 *          },
 *          ...
 *      ] - selected location area,
 *      period: [
 *          time: number,
 *          ...
 *      ] - selected time frame
 *  }
 * @return {medias} Media[] - return medias from poligon.
 */
Monitor.prototype.monitor_get_medias = function(params) {
    return new Promise((resolve, reject) => {
        try {
            const self = this;
            self.utils.verifyParams(params)
                .then(() => {
                    if(params.polygon.length > 2) {
                        return self._getMediaFromPoligon(params);
                    } else {
                        return (typeof params.polygon[1] === 'number') ?
                            self._getMediaFromSircle(params)
                            : self._getMediaFromSquare(params) ;
                    }
                })
                .then(medias => {
                    return medias ? resolve(medias) : reject();
                })
                .catch(err => {
                    return reject(err);
                })
        } catch (error) {
            return reject(error);
        }
    })
};
Monitor.prototype._getMediaFromSquare = function(params) {};
Monitor.prototype._getMediaFromSircle = function(params) {};
Monitor.prototype._getMediaFromPoligon = function(params) {};
module.exports = Monitor;