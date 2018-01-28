const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema,
    ProfileModelSchema = new Schema({
        user: [{type: Schema.Types.ObjectId, ref: 'User'}],
        avatar: {type: Schema.Types.ObjectId},
        primaryEmail: {type: Schema.Types.ObjectId, index: true},
        rating: {type: Number, index: true},
        primaryPhone: {type: Schema.Types.ObjectId, index: true},
        lastIp: {type: Schema.Types.ObjectId, index: true},
        role: {type: Number, index: true, enum: [0, 1, 2, 3], default: 0},
        created: {type: Date, index: true, default: Date.now()}
    });
module.exports = mongoose.model('Profile', ProfileModelSchema);