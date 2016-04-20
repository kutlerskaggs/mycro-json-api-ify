'use strict';

const async = require('async');
const joi = require('joi');
const moment = require('moment');
const _ = require('lodash');

module.exports = function(service) {
    return {
        /**
         * Parse request for query filter
         * @param  {Object} req
         * @param  {Object} options
         * @param  {Function} cb
         */
        filter(req, options, cb) {
            const self = this;
            // lookup 'filter' query param
            let filter = _.get(req, 'query.filter');

            // if no filter parameter found, we can end here
            if (!filter || !_.isObject(filter)) {
                return async.setImmediate(function() {
                    cb(null, {});
                });
            }

            let fOptions = options.filter || {};
            if (fOptions.whitelist && fOptions.whitelist.length) {
                fOptions._shouldWhitelist = true;
            } else if (fOptions.blacklist && fOptions.blacklist.length) {
                fOptions._shouldBlacklist = true;
            }

            // parse entire filter attribute as clause
            service.normalize.clause(filter, fOptions, cb);
        }
    };
};
