const path = require('path');
global.appRoot = path.resolve(__dirname + '/../../');
const chai = require('chai');
const expect = chai.expect;
const Email = require(appRoot + '/services/email.service');
const emailService = new Email(appRoot);
const testData = require(appRoot + '/test/testData.json');

describe('Email test',async () => {
    it('send email', async () => {
        const params = [
                '5b212d12423457734dbf7852',
                testData.user.email,
                'kreFgn'
            ];
        const confirmEmail = service.email_send_confirmation_email(params)
    });
});