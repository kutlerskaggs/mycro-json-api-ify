/*jshint expr:true */
'use strict';

const async = require('async');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const moment = require('moment');
const sinon = require('sinon');
const _ = require('lodash');

describe('[service] rest', function() {
    let Rest;

    before(function() {
        Rest = mycro.services.rest;
    });

    describe('{parse}', function() {

        describe('#filter()', function() {

            it('should correctly convert values', function(done) {
                let req = httpMocks.createRequest({
                    query: {
                        filter: {
                            first: {
                                $startsWith: 'Bob'
                            },
                            createdAt: {
                                $gte: {
                                    $date: moment(new Date('01/01/2015')).toDate().toISOString()
                                },
                                $lt: {
                                    $date: moment(new Date('01/01/2016')).toDate().toISOString()
                                }
                            },
                            $or: [
                                {
                                    loginAttempts: {
                                        $gte: {
                                            $int: '3'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                });

                Rest.parse.filter(req, {}, function(err, parsed) {
                    if (err) {
                        console.error(err);
                    }
                    // top level
                    expect(err).to.not.exist;

                    // filter - first
                    expect(parsed).to.have.property('first').that.is.an('object').with.property('$regex');
                    let re = parsed.first.$regex;
                    expect(_.isRegExp(re)).to.equal(true);
                    expect('Bobby').to.match(re);
                    expect('billy').to.not.match(re);
                    expect('Ricky Bobby').to.not.match(re);

                    // filter - createdAt
                    expect(parsed).to.have.property('createdAt').that.is.an('object');
                    expect(parsed.createdAt).to.have.property('$gte').that.is.a('date');
                    expect(parsed.createdAt).to.have.property('$lt').that.is.a('date');

                    // filter - or
                    expect(parsed).to.have.property('$or').that.is.an('array').with.lengthOf(1);

                    // filter - or clause 1
                    let clause = parsed.$or[0];
                    expect(clause).to.be.an('object');
                    expect(clause).to.have.property('loginAttempts').that.have.property('$gte')
                    .that.equals(3);
                    done();
                });
            });


            it('should allow for blacklisting fields', function(done) {
                let req = httpMocks.createRequest({
                    query: {
                        filter: {
                            first: {
                                $startsWith: 'Bob'
                            },
                            createdAt: {
                                $gte: {
                                    $date: moment(new Date('01/01/2015')).toDate().toISOString()
                                },
                                $lt: {
                                    $date: moment(new Date('01/01/2016')).toDate().toISOString()
                                }
                            },
                            $or: [
                                {
                                    loginAttempts: {
                                        $gte: {
                                            $int: '3'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                });

                Rest.parse.filter(req, {
                    filter: {
                        blacklist: ['loginAttempts']
                    }
                }, function(err, parsed) {
                    expect(err).to.be.an('object');
                    expect(err).to.have.property('detail', `Filtering on field 'loginAttempts' is forbidden`);
                    done();
                });
            });


            it('should allow for whitelisting fields', function(done) {
                let req = httpMocks.createRequest({
                    query: {
                        filter: {
                            first: {
                                $startsWith: 'Bob'
                            },
                            createdAt: {
                                $gte: {
                                    $date: new Date('01/01/2015').toISOString()
                                },
                                $lt: {
                                    $date: new Date('01/01/2016').toISOString()
                                }
                            },
                            $or: [
                                {
                                    loginAttempts: {
                                        $gte: {
                                            $int: '3'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                });

                Rest.parse.filter(req, {
                    filter: {
                        whitelist: ['first', 'createdAt']
                    }
                }, function(err, parsed) {
                    expect(err).to.be.an('object');
                    expect(err).to.have.property('detail', `Filtering on field 'loginAttempts' is forbidden`);
                    done();
                });
            });


            it('should correctly parse deeply nested filter object', function(done) {
                let req = httpMocks.createRequest({
                    query: {
                        filter: {
                            loginAttempts: [{
                                $int: '3'
                            }, {
                                $int: '4'
                            }, {
                                $int: '5'
                            }],
                            $or: [{
                                $createdAt: {
                                    $gte: {
                                        $date: new Date('01/01/2015').toISOString()
                                    },
                                    $lt: {
                                        $date: new Date('01/01/2016').toISOString()
                                    }
                                },
                                $and: [{
                                    _id: [{
                                        $objectId: '507f1f77bcf86cd799439011'
                                    }, {
                                        $objectId: '507f191e810c19729de860ea'
                                    }]
                                }]
                            }]
                        }
                    }
                });
            });


            it('should allow for the interception of values');
            it('should allow for fields to be mapped to new fields (id to _id, some-field to someField)');
        });
    });
});
