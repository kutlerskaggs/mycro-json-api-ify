'use strict';

const async = require('async');
const _ = require('lodash');

module.exports = function mycro_json_api_ify(done) {
    const mycro = this;

    // ensure the native `services` hook as run prior to this hook
    if (!mycro.services) {
        return async.setImmediate(function() {
            done(new Error('Missing required dependency (services)'));
        });
    }

    async.parallel([
        // instantiate a new json service, add it to services, and run the
        // initializer method
        function(fn) {
            let jsonService = require('./services/json')(mycro);
            mycro.services.json = jsonService;
            jsonService._initialize(fn);
        },

        // instantiate a new rest service, add it to services, and run the
        // initializer method
        function(fn) {
            let restService = require('./services/rest')(mycro);
            mycro.services.rest = restService;
            restService._initialize(fn);
        }
    ], done);
};
