'use strict';

const async = require('async');
const _ = require('lodash');

module.exports = function(mycro) {
    const Json = mycro.services.json;
    const Error = mycro.services.json;

    return {
        detail(req, res) {
            async.auto({
                config: function parseConfig(fn) {
                    Json.interpretRequest(req, {
                        schema: {
                            first: 'string',
                            last: 'string',
                            email: 'string',
                            createdAt: 'date'
                        }
                    }, Error.wrap('badRequest', fn));
                },

                query: ['config', function execQuery(fn, r) {
                    let config = r.config;

                }]
            });
        }
    };
};
