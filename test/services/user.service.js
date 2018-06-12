const chai = require('chai'),
    chaiHttp = require('chai-http'),
    should = chai.should(),
    db = require('../../lib/db'),
    Service = require('../../services/user.service'),
    Profile = require('../../models/profile'),
    mongoose = require('mongoose');

describe('User, profile models test',()=> {
    it('user, profile create', (done) => {
        db();
        const service = new Service(),
            params = [
            'somepass23',
            'bob@gmail.com',
            '+380949507777'
        ];
        service.user_create(params)
            .then(user => {
                console.dir(user);
                done();
            })
            .catch(e => {
                console.dir(e);
                done();
            })
    });
    it('user, promises', (done) => {
        db();
        const service = new Service(),
            params = [
                'somepass23',
                'bib@gmail.com',
                '+380949507774'
            ];
        service.user_create(params)
            .then(user => {
                console.dir(user);
                done();
            })
            .catch(e => {
                console.dir(e);
                done();
            })
    });
    it('user_auth_create_email', (done) => {
        const service = new Service(),
            params = [
                '5a9808f0e912b9481e15deb8',
                'mykola_borodyn@ecoengineer.in.ua'
            ];
        service.user_auth_create_email(params)
            .then(user => {
                console.dir(user);
                done();
            })
            .catch(e => {
                console.dir(e);
                done();
            })
    });
    it('user_auth_create_email via http', done => {

    })
});