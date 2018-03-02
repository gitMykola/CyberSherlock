const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema,
    PhoneModelSchema = new Schema({
        owner: {type: Schema.Types.ObjectId, index: true, ref: 'User'},
        phone: {type: String, index: true},
        primary: {type: Boolean, default: false},
        status: {type: Boolean, default: false},
        code: {type: String, default: '000000'},
        created: {type: Date, index: true, default: Date.now()}
    });
module.exports = mongoose.model('Phone', PhoneModelSchema);