const chai = require('chai'),
    chaiHttp = require('chai-http'),
    should = chai.should(),
    app = require('../app'),
    Log = require('../lib/log');

chai.use(chaiHttp);

/***************************************************************
 * It's depend on mongod
 * */
describe('Api routes', () => {
    it('GET "/" should response object', done => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                Log(JSON.stringify(res.body), 1);
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            })
    });
    it('GET "/api" should response object', done => {
        chai.request(app)
            .get('/api')
            .end((err, res) => {
                Log(JSON.stringify(res.body), 1);
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            })
    });
});