'use strict';

const async = require('async');
const err = require('./err');
const joi = require('joi');
const moment = require('moment');
const _ = require('lodash');

function isExpression(value) {
    if (_.isObject(value) && !_.isDate(value)) {
        return true;
    }
    return false;
}

module.exports = function(service) {
    return {
        /**
         * Parse an object expression. Apply any custom modifiers.
         * @param  {String} field - field name
         * @param  {*} expression - expression to parse
         * @param  {Function} cb
         */
        applyModifier(field, expression, cb) {
            const self = this;
            if (!isExpression(expression)) {
                return async.setImmediate(function() {
                    cb(null, expression);
                });
            }
            let keys = Object.keys(expression);
            async.reduce(keys, {}, function(result, modifierName, fn) {
                let modifier = _.get(service, `modifiers.${modifierName}`);
                let value = expression[modifierName];
                if (!modifier || modifier === false)  {
                    return async.setImmediate(function() {
                        fn(err.badRequest(`Undefined/Forbidden modifier found in filter parameters: '${modifierName}'`));
                    });
                }
                async.waterfall([
                    function applyNestedModifier(_fn) {
                        if (!isExpression(value)) {
                            return async.setImmediate(function() {
                                _fn(null, value);
                            });
                        }
                        self.applyModifier(field, value, _fn);
                    },

                    function _applyModifier(processed, _fn) {
                        if (modifier === true) {
                            return async.setImmediate(function() {
                                result[modifierName] = processed;
                                _fn(null, result);
                            });
                        } else if (_.isFunction(modifier)) {
                            modifier(field, processed, function(err, r) {
                                if (err) {
                                    return _fn(err);
                                }
                                if (!isExpression(r)) {
                                    return _fn(null, r);
                                }
                                _.extend(result, r);
                                _fn(null, result);
                            });
                        } else {
                            return async.setImmediate(function() {
                                _fn(err.serverError(`Invalid modifier defined for '${modifierName}'. must be a boolean or function`));
                            });
                        }
                    }
                ], fn);
            }, cb);
        },


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
                let shouldWhitelist = options._shouldWhitelist;


                // verify key is allowed
                if (!shouldWhitelist && options._shouldBlacklist && options.blacklist.indexOf(key) !== -1) {
                    return async.setImmediate(function() {
                        fn(err.badRequest(`Filtering on field '${key}' is forbidden`));
                    });
                }

                // if key is a logical operator, process values as clauses
                if (logicalOperators.indexOf(key) !== -1) {
                    // ensure value is an array
                    if (!_.isArray(value)) {
                        return async.setImmediate(function() {
                            fn(err.badRequest(`Logical operator ${key}'s value must be an array`));
                        });
                    }

                    // process array of clauses
                    return async.map(value, function(_clause, _fn) {
                        self.clause(_clause, options, _fn);
                    }, function(err, normalized) {
                        if (err) {
                            return fn(err);
                        }
                        result[key] = normalized;
                        return fn(null, result);
                    });
                }

                if (options._shouldWhitelist && options.whitelist.indexOf(key) === -1) {
                    return async.setImmediate(function() {
                        fn(err.badRequest(`Filtering on field '${key}' is forbidden`));
                    });
                }

                // otherwise, assume key is an expression
                self.expression(key, value, function(err, normalized) {
                    if (err) {
                        return fn(err);
                    }
                    result[key] = normalized;
                    return fn(null, result);
                });
            }, cb);
        },


        /**
         * Parse an expression
         * @param  {String} field - the current field
         * @param  {Object|Object[]|String|String[]} expression
         * @param  {Object} options
         * @param  {Function} cb
         */
        expression(field, expression, cb) {
            const self = this;

            if (isExpression(expression)) {
                return self.applyModifier(field, expression, cb);
            }

            if (_.isArray(expression)) {
                return async.map(expression, function(e, _fn) {
                    self.expression(field, e, _fn);
                }, function(err, normalized) {
                    if (err) {
                        return cb(err);
                    }
                    cb(null, {
                        $in: normalized
                    });
                });
            }

            return async.setImmediate(function() {
                cb(null, expression);
            });
        },


        /**
         * Allow interception of values by this library config
         * @param  {String} field - field name
         * @param  {String} value - the value as parsed from the query string
         * @param  {Function} cb
         */
        value(field, value, cb) {

        }
    };
};
