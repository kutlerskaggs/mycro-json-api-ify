/*jshint expr:true */
'use strict';

const async = require('async');
const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const moment = require('moment');
const sinon = require('sinon');
const _ = require('lodash');

describe('[service] rest', function() {
    describe('#parse()', function() {
        it('should correctly convert values', function(done) {
            let req = httpMocks.createRequest({
                query: {
                    filter: {
                        first: {
                            $startsWith: 'Bob'
                        },
                        createdAt: {
                            $gte: {
                                $date: moment('01/01/2015').toDate().toISOString()
                            },
                            $lt: {
                                $date: moment('01/01/2016').toDate().toISOString()
                            }
                        },
                        $or: [
                            {
                                loginAttempts: {
                                    $gte: {
                                        $int: parseInt(3).toString()
                                    }
                                }
                            }
                        ]
                    }
                }
            });

            mycro.services.rest.parse(req, {
                filter: {
                    rules: [
                        {
                            field: 'first',
                            rule(value, field, modifiers) {
                                return {
                                    field: field,
                                    modifiers: modifiers,
                                    value: value.toLowerCase()
                                };
                            }
                        },
                        {
                            modifier: '$startsWith',
                            rule(value, field, modifiers) {
                                let newModifiers = modifiers.map(function(modifier) {
                                    if (modifier === '$startsWith') {
                                        return '$regex';
                                    }
                                    return modifier;
                                });
                                let newValue = new RegExp(`^${value}*`);
                            }
                        }
                    ]
                }
            }, function(err, parsed) {
                // top level
                expect(err).to.not.exist;
                expect(parsed).to.be.an('object').that.has.all.keys('filter', 'page', 'sort', 'fields');

                // filter - first
                expect(parsed.filter).to.have.property('first').that.is.an('object').with.property('$regex');
                let re = parsed.filter.first.$regex;
                expect(_.isRegExp(re)).to.equal(true);
                expect('Bobby').to.match(re);
                expect('bob').to.match(re);
                expect('billy').to.not.match(re);

                // filter - createdAt
                expect(parsed.filter).to.have.property('createdAt').that.is.an('object');
                expect(parsed.filter.createdAt).to.have.property('$gte').that.is.a('date');
                expect(parsed.filter.createdAt).to.have.property('$lt').that.is.a('date');

                // filter - or
                expect(parsed.filter).to.have.property('$or').that.is.an('array').with.lengthOf(1);

                // filter - or clause 1
                let clause = parsed.filter.$or[0];
                expect(clause).to.be.an('object');
                expect(clause).to.have.property('loginAttempts').that.have.property('$gte')
                .that.equals(3);
            });
        });
    });
});
