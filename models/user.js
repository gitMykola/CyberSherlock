const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema,
    UserModelSchema = new Schema({
        name: {type: String, index: true},
        password: {
            salt: String,
            hash: String
        },
        created: {type: Date, index: true, default: Date.now()},
        status: {type: Number, index: true, enum: [0, 1, 2], default: 0}
    });
module.exports = mongoose.model('User', UserModelSchema);