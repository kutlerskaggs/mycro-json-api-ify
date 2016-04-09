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

    // instantiate a new service, add it to services, and run the
    // initializer method
    let service = require('./services/json')(mycro);
    mycro.services.json = service;
    service._initialize(done);
};
