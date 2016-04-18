'use strict';

const async = require('async');
const joi = require('joi');
const moment = require('moment');
const _ = require('lodash');

const badRequest = function(detail) {
    let error = {status: 400, title: 'Bad Request'};
    _.defaults(error, { detail });
    return error;
};
const serverError = function(detail) {
    let error = {status: 500, title: 'Server Error'};
    _.defaults(error, { detail });
    return error;
};

module.exports = {
    /**
     * Parse a filter clause. A clause is simple an object containing one or
     * more filter expressions
     * @param  {Object} clause
     * @param  {Object} options
     * @param  {Function} cb
     */
    clause(clause, options, cb) {
        const self = this;
        let logicalOperators = ['$or', '$and'];
        let keys = Object.keys(clause);

        async.reduce(keys, {}, function(result, key, fn) {
            let value = clause[key];

            // if key is a logical operator, process values as clauses
            if (logicalOperators.indexOf(key) !== -1) {
                // ensure value is an array
                if (!_.isArray(value)) {
                    return async.setImmediate(function() {
                        fn(badRequest(`Logical operator ${key}'s value must be an array`));
                    });
                }

                // process array of clauses
                return async.map(value, function(_clause, _fn) {
                    self.clause(_clause, options, _fn);
                }, function(err, processedClauses) {
                    if (err) {
                        return fn(err);
                    }
                    result[key] = processedClauses;
                    return fn(null, result);
                });
            }

            // otherwise, assume key is an expression
            self.expression(key, value, options, function(err, processedExpression) {
                if (err) {
                    return fn(err);
                }
                result[key] = processedExpression;
                return fn(null, result);
            });
        }, cb);
    },


    /**
     * Parse an expression
     * @param  {String} field - the current field
     * @param  {String|Object} expression
     * @param  {Object} options
     * @param  {Function} cb
     */
    expression(field, expression, options, cb) {
        const self = this;

        if (_.isObject(expression) && !_.isDate(expression)) {
            let keys = Object.keys(expression);

            return async.reduce(keys, {}, function(result, modifier, fn) {
                let value = expression[modifier];

                // check for nested expression, like {$gte: {$date: 'some-date-string'}}
                if (_.isObject(value) && !_.isDate(value)) {
                    return self.expression(field, value, options, function(err, processed) {

                    });
                }
            });
        }
    },


    /**
     * Parse request for query filter
     * @param  {Object} req
     * @param  {Object} [options]
     * @param  {Function} cb
     */
    filter(req, options, cb) {
        const self = this;
        // handle optional `options` argument
        if (_.isFunction(options)) {
            cb = options;
            options = {};
        }
        
        // lookup 'filter' query param
        let filter = _.get(req, 'query.filter');
        if (!filter || !_.isObject(filter)) {
            return async.setImmediate(function() {
                cb(null, {});
            });
        }
        // parse entire filter attribute as clause
        self.clause(filter, options, cb);
    }
};
