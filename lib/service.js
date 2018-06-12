module.exports = {
    /**
     * @summary Init common service object
     */
   init: function(
       service,
       appRoot = '../',
       config = {},
       models = ['user', 'email', 'phone'],
       libs = ['log', 'db', 'utils']) {
       const self = this;
       models.forEach(model => self[model] = require(appRoot + 'models/' + model));
       libs.forEach(lib => self[lib] = require(appRoot + 'lib/' + lib));
       this.dbState = !this.db ? false : this.db.connect({
           db: config.db,
           log: this.log || console.log
       });//TODO make some event to emmit db error state to owner service object
       service = Object.assign(service, this);
   },
    /**
     * @summary Check service state
     * @return boolean - service state (1 - Ok, 0 - Not working)
     */
   state: function () {
        return this.dbState;
   },
   setKey: function (key) {
        this._key = key;
    }
};