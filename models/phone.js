const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema,
    PhoneModelSchema = new Schema({
        owner: {type: Schema.Types.ObjectId, ref: 'User'},
        phone: {type: String, index: true},
        status: {type: Boolean, index: true, default: false},
        code: {type: String, index: true},
        created: {type: Date, index: true, default: Date.now()}
    });
module.exports = mongoose.model('Phone', PhoneModelSchema);