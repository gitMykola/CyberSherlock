//Import the mongoose module
const config = require('../assets/config.json'),
    Log = require('./log'),
    mongoose = require('mongoose');
    mongoDB = 'mongodb://'
        + config.db.user + ':'
        + config.db.password + '@'
        + config.db.host + '/'
        + config.db.name;
const funcDB = () => {
    mongoose.connect(mongoDB, {
        useMongoClient: true
    });
// Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise;
//Get the default connection
    const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
    db.on('error', e =>
        Log('Database connection error. ' + e.toString(), 0));
};

module.exports = funcDB;
