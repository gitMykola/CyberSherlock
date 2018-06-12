const should = require('should'),
    db = require('../../lib/db'),
    Service = require('../../services/email.service'),
    mongoose = require('mongoose');

describe('Email test',()=> {
    it('send email', (done) => {
        db();
        const service = new Service(),
            params = [
                '5a9808f0e912b9481e15deb8',
                'mykola_borodyn@ecoengineer.in.ua',
                'kreFgn'
            ];
        service.email_send_confirmation_email(params)
            .then(user => {
                console.dir(user);
                done();
            })
            .catch(e => {
                console.dir(e);
                done();
            })
    });
});