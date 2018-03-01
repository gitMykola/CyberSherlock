const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema,
    EmailModelSchema = new Schema({
        owner: {type: Schema.Types.ObjectId, ref: 'User'},
        email: {type: String, index: true},
        status: {type: Boolean, index: true, default: false},
        code: {type: String, index: true},
        created: {type: Date, index: true, default: Date.now()}
    });
module.exports = mongoose.model('Email', EmailModelSchema);