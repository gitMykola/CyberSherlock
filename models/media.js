const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema,
    MediaModelSchema = new Schema({
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        location:
            {
                lat: {type: Number, index: true},
                lng: {type: Number, index: true}
            },
        category: Number,
        filename: {type: String, index: true},
        sha3: String,
        hash: {type: String, default: ''},
        url: {type: String, index: true},
        cost: Number,
        created: {type: Date, index: true, default: Date.now()},
        neuro: [Number],
        direction:
            {
                horizont: Number,
                vertical: Number
            }
    });
module.exports = mongoose.model('Media', MediaModelSchema);