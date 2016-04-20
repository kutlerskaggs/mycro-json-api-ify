'use strict';

const async = require('async');
const Serializer = require('json-api-ify');
const _ = require('lodash');

module.exports = function(config) {
    let options = config.options || {};
    const serializer = new Serializer(options);

    if (!config.types) {
        config.types = {};
    }

    serializer._initialize = function(done) {
        async.each(Object.keys(config.types), function(type, fn) {
            let typeConfig = config.types[type];
            let schemas = typeConfig.schemas || {};
            delete typeConfig.schemas;
            serializer.define(type, typeConfig, function(err) {
                if (err) {
                    return fn(err);
                }
                let schemaNames = Object.keys(schemas);
                if (!schemaNames.length) {
                    return fn();
                }
                async.each(schemaNames, function(schemaName, _fn) {
                    let schemaConfig = schemas[schemaName];
                    serializer.define(type, schemaName, schemaConfig, _fn);
                }, fn);
            });
        }, done);
    };

    return serializer;
};
