'use strict';

var mycro = require('./app');
mycro.start(function(err) {
    if (err) {
        mycro.log('error', 'there was an error starting app:', err);
    } else {
        mycro.log('info', 'app started successfully');
    }
});
