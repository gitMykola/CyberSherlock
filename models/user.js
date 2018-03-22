const mongoose = require('mongoose'),
    bcrypt   = require('bcrypt');
    mongoose.Promise = global.Promise;
const Schema = mongoose.Schema,
    UserModelSchema = new Schema({
        password: {type: String, index: true},
        name: {type: String, default: ''},
        facebook: {
            id: String,
            token: String,
            name: String
        },
        google: {
            id: String,
            token: String,
            name: String
        },
        linked: {
            id: String,
            token: String,
            name: String
        },
        twitter: {
            id: String,
            token: String,
            name: String
        },
        created: {type: Date, index: true, default: Date.now()},
        status: {type: Number, index: true, enum: [0, 1, 2], default: 0}
    });
UserModelSchema.methods.hash = (password) => {
    return new Promise ((resolve, reject) => {
        try {
            resolve(bcrypt.hashSync(password, 8));
        } catch (e) {
            reject(e.message);
        }
    })
};
UserModelSchema.methods.verifyPassphrase = (password, hash) => {
        try {
            return bcrypt.compareSync(password, hash);
        } catch (e) {
            return false;
        }
};
module.exports = mongoose.model('User', UserModelSchema);