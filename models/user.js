const mongoose = require('mongoose'),
    bcrypt   = require('bcrypt');
    mongoose.Promise = global.Promise;
const Schema = mongoose.Schema,
    UserModelSchema = new Schema({
        password: {type: String, index: true},
        email: {type: String, index: true},
        phone: {type: String, index: true},
        name: {type: String, index: true},
        facebook: {
            id: {type: String, index: true}
        },
        google: {
            id: {type: String, index: true}
        },
        linked: {
            id: {type: String, index: true}
        },
        twitter: {
            id: {type: String, index: true}
        },
        created: {type: Date, index: true, default: Date.now()},
        status: {type: Number, index: true, enum: [0, 1, 2], default: 0}
    });
UserModelSchema.methods.hash = (password) => {
    return new Promise ((resolve, reject) => {
        try {
            resolve(bcrypt.hashSync(password, 10));
        } catch (e) {
            reject(e.message);
        }
    })
};
UserModelSchema.methods.verifyPassword = (password) => {
    return new Promise ((resolve, reject) => {
        try {
            resolve(bcrypt.compareSync(password, this.password));
        } catch (e) {
            reject(e.message);
        }
    })
};
module.exports = mongoose.model('User', UserModelSchema);