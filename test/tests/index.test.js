/*jshint -W079 */
/*jshint expr:true */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
const supertest = require('supertest');

chai.use(sinonChai);

before(function(done) {
    process.chdir(__dirname + '/../app');
    const mycro = require('../app/app');
    
    mycro.start(function(err) {
        expect(err).to.not.exist;
        global.request = supertest.agent(mycro.server);
        global.mycro = mycro;
        done(err);
    });
});

describe('basic tests', function() {
    it('should not crash the mycro application', function(done) {
        request.get('/health')
        .set({
            'Accept-Version': '^1.0.0'
        })
        .expect(200)
        .end(done);
    });
});
