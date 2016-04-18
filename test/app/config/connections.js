'use strict';

const mongooseAdapter = require('mycro-mongoose');

module.exports = {
    mongo: {
        adapter: mongooseAdapter,
        config: {
            url: 'mongodb://localhost:27017/mycro-json-api-ify'
        }
    }
};
