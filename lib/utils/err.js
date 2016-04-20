'use strict';

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

_.extend(module.exports, {
    badRequest,
    serverError
});
