'use strict';

module.exports = [
    'server',
    'connections',
    'models',
    'services',
    'mycro-error',
    require('../../../index'),
    require('../hooks/error'),
    'policies',
    'controllers',
    'routes',
    'start'
];
