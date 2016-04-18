'use strict';

const async = require('async');
const _ = require('lodash');

module.exports = function(mycro) {
    const Err = mycro.services.json;
    const Json = mycro.services.json;
    const Rest = mycro.services.rest;
    const Users = mycro.models.user;

    return {
        query(req, res) {
            async.waterfall([
                // parse the request for query instructions
                function parseConfig(fn) {
                    Rest.parse(req, {
                        template: 'mongoose',
                        filter: {
                            whitelist: [
                                'first', 'last', 'createdAt', 'loginAttempts'
                            ]
                        },
                        page: {
                            size: {
                                default: 20,
                                min: 1,
                                max: 100
                            }
                        }
                    }, Err.wrap('badRequest', fn));
                },

                // restrict results to
                function modifyFilters(instr, fn) {
                    if (!instr.$or) {
                        instr.$or = [];
                    }
                    instr.$or.push({
                        status: {
                            $eq: 'active'
                        }
                    });
                    async.setImmediate(function() {
                        fn(null, instr);
                    });
                },

                // perform query
                function execQuery(instr, fn) {
                    let limit = _.get(instr, 'page.size');
                    let pageNumber = _.get(instr, 'page.number') - 1;
                    let skip = limit * pageNumber;
                    Users.find(instr.filter, instr.fields, {
                        limit,
                        skip
                    }, Err.wrap(true, 'serverError', function(err, results) {
                        if (err) {
                            return fn(err);
                        }
                        if (!results || !results.length) {
                            err = Err.get('notFound');
                            return fn(err);
                        }
                        fn(null, results, instr);
                    }));
                },

                // serialize response
                function serializeResponse(results, instr, fn) {
                    Json.serialize('user', results, { req }, Err.wrap('serializeError', fn));
                }
            ], Err.interceptResponse(res, function(payload) {
                res.json(200, payload);
            }));
        }
    };
};
