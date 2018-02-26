const should = require('should'),
    db = require('../../lib/db'),
    User = require('../../models/user'),
    Profile = require('../../models/profile'),
    mongoose = require('mongoose');

describe('User, profile models test',()=> {
    it('user, profile create', (done) => {
        db();
        User.findOne()
            .where({name: 'Nick'})
            .exec( (err, nick) => {
                if (err) console.log(err);
                else if (nick) {
                    console.log(nick.name);
                    pfind(nick._id);
                }
                    else {
                    User.create({
                        name: 'Nick',
                        password: {
                            salt: 'sadfsd',
                            hash: 'fsdfads'
                            }
                        }, (err, uNick) => {
                        if (err) console.log(err);
                        else pfind(uNick._id)
                    })
                }
            });
        const pfind = (id) => {
            Profile.findOne()
                .where({user: id})
                .exec( (err, nickpfile) => {
                    if (err) console.log(err);
                    else if (nickpfile) {
                        console.log(nickpfile.role);
                        done();
                    } else {
                        Profile.create({
                            user: id
                        },(err, npfile) => {
                            if (err) console.log(err);
                            else {
                                console.log(npfile.role + ' new');
                                done();
                            }
                        });
                    }
                });
        }
    });
    it('user, profile find', (done) => {
        db();
        /*Profile.deleteOne({_id: '5a6f829b3a8d897b7bdc5c6f'}, err => {
                console.log(err);
                done();
            });*/
        /*User.create({
            name: 'July',
            password: {
                salt: 'sdfasdfas',
                hash: 'sdgfvfghgjfghn'
            }
        });*/
        /*Profile.findOne()
            .populate('user')
            // .where({'user.name': 'Nick'})
            .exec((err, pFile) => {
                console.dir(pFile.user[0]._doc.name);
                pFile.find()
                    .where({'user.name': 'Nic'})
                    .exec( (err, ni) => {
                        console.dir(ni);
                        done();
                    })
            });*/
        User.aggregate([{
            $lookup: {
                from: 'profiles',
                localField: '_id',
                foreignField: 'user',
                as: 'profiles'
                }
            }, {
            $match: {name: 'Nick'}
        }])
            .then(pf => {
            pf.forEach(p => {
                console.dir(p);
            });
            done();
        });
        //done();
    });
});