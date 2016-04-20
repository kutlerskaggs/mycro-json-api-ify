'use strict';

const async = require('async');
const err =  require('./err');
const moment = require('moment');
const normalize = require('./normalize');
const _ = require('lodash');


/**
 * Coerce a string into a date
 * @param  {String} field - field name
 * @param  {String} value - value to coerce
 * @param  {Function} cb - callback
 */
const $date = function(field, value, cb) {
    let _value = moment(value);
    if (!_value.isValid()) {
        return async.setImmediate(function() {
            cb(err.badRequest(`'$date' modifier receivied invalid date`));
        });
    }
    async.setImmediate(function() {
        cb(null, _value.toDate());
    });
};


/**
 * Coerce a string into a valid ending regular expression
 * @param  {String} field - field name
 * @param  {String} value - value to coerce
 * @param  {Function} cb - callback
 */
const $endsWith = function(field, value, cb) {
    if (!_.isString(value)) {
        return async.setImmediate(function() {
            cb(err.badRequest(`'$endsWith' modifier requires a string value`));
        });
    }
    let $regex = new RegExp(`*${value}$`);
    return async.setImmediate(function() {
        cb(null, {
            $regex
        });
    });
};


/**
 * Coerce a string into a float
 * @param  {String} field - field name
 * @param  {String} value - value to coerce
 * @param  {Function} cb - callback
 */
const $float = function(field, value, cb) {
    let _value = parseFloat(value);
    if (isNaN(_value)) {
        return async.setImmediate(function() {
            cb(err.badRequest(`'$int' modifier receivied invalid integer`));
        });
    }
    async.setImmediate(function() {
        cb(null, _value);
    });
};


/**
 * Coerce a string into an integer
 * @param  {String} field - field name
 * @param  {String} value - value to coerce
 * @param  {Function} cb - callback
 */
const $int = function(field, value, cb) {
    let _value = parseInt(value);
    if (isNaN(_value)) {
        return async.setImmediate(function() {
            cb(err.badRequest(`'$int' modifier received invalid integer`));
        });
    }
    async.setImmediate(function() {
        cb(null, _value);
    });
};


/**
 * Negate the outcome of an expression
 * @param  {String} field - field name
 * @param  {String} value - value to coerce
 * @param  {Function} cb - callback
 */
const $not = function(field, value, cb) {
    if (!(_.isObject(value) && !_.isDate(value))) {
        return async.setImmediate(function() {
            cb(err.badRequest(`'$not' modifier requires an expression value`));
        });
    }
    normalize.expression(field, value, {}, function(err, $not) {
        if (err) {
            return cb(err);
        }
        cb(null, { $not });
    });
};


/**
 * Coerce a string into a valid regular expression
 * @param  {String} field - field name
 * @param  {String} value - value to coerce
 * @param  {Function} cb - callback
 */
const $regex = function(field, value, cb) {
    if (!_.isString(value)) {
        return async.setImmediate(function() {
            cb(err.badRequest(`'$regex' modifier requires a string value`));
        });
    }
    let $regex = new RegExp(value);
    return async.setImmediate(function() {
        cb(null, {
            $regex
        });
    });
};


/**
 * Coerce a string into a valid starting regular expression
 * @param  {String} field - field name
 * @param  {String} value - value to coerce
 * @param  {Function} cb - callback
 */
const $startsWith = function(field, value, cb) {
    if (!_.isString(value)) {
        return async.setImmediate(function() {
            cb(err.badRequest(`'$startsWith' modifier requires a string value`));
        });
    }
    let $regex = new RegExp(`^${value}*`);
    return async.setImmediate(function() {
        cb(null, {
            $regex
        });
    });
};

_.extend(module.exports, {
    $date,
    $endsWith,
    $float,
    $int,
    $regex,
    $startsWith
});
