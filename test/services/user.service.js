const path = require('path');
global.appRoot = path.resolve(__dirname + '/../../');
const chai = require('chai');
const expect = chai.expect;
const User = require(appRoot + '/services/user.service');
const userService = new User(appRoot);
const testData = require(appRoot + '/test/testData.json');

describe('User service', async () => {
    it('user_create_local with email & phone', async () => {
        const user = await userService.user_create_local([
            testData.user.password,
            testData.user.email,
            testData.user.phone
        ]);
        // console.dir(user);
        expect(user).to.be.an('object')
            .that.have.all
            .keys(['status', 'user', 'sentPhoneConfirmation', 'sentEmailConfirmation']);
        expect(user).to.include({status: 'success'});
        expect(user.user).to.be.an('object')
            .that.have.all.keys(['id', 'email', 'phone']);
        return true;
    });
    it('user_create_local with email', async () => {
        const user = await userService.user_create_local([
            testData.user.password,
            testData.user.email
        ]);
        // console.dir(user);
        expect(user).to.be.an('object')
            .that.have.all
            .keys(['status', 'user', 'sentEmailConfirmation']);
        expect(user).to.include({status: 'success'});
        expect(user.user).to.be.an('object')
            .that.have.all.keys(['id', 'email']);
        return true;
    });
    it('user_create_local with phone', async () => {
        const user = await userService.user_create_local([
            testData.user.password,
            '',
            testData.user.phone
        ]);
        // console.dir(user);
        expect(user).to.be.an('object')
            .that.have.all
            .keys(['status', 'user', 'sentPhoneConfirmation']);
        expect(user).to.include({status: 'success'});
        expect(user.user).to.be.an('object')
            .that.have.all.keys(['id', 'phone']);
        return true;
    });
    it('_remove_user', async () => {
        const removedUser = await userService._remove_user({
            email: testData.user.email,
            phone: testData.user.phone,
            password: testData.user.password
        });
        // console.dir(removedUser);
        return true;
    });
});