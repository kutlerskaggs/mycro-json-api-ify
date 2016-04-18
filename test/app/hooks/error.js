'use strict';

const async = require('async');
const _ = require('lodash');

module.exports = function(done) {
    const mycro = this;

    mycro.services.error.get = function(name, detail) {
        let error = _.get(mycro, `_config.errors.${name}`) || {
            title: 'Undefined Error',
            detail: `Unable to locate error with title: ${name}`
        };
        error = _.cloneDeep(error);
        _.defaults(error, { detail });
        return error;
    };

    mycro.services.error.responseHandler = function(res, error) {
        let Json = mycro.services.json;
        let payload = Json.serializeError(error);
        let status = _.get(payload, 'meta.status');
        delete payload.meta;
        res.json(status, payload);
    };

    async.setImmediate(done);
};
