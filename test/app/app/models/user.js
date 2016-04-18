'use strict';

module.exports = function(connection, Schema, name, mycro) {
    let schema = new Schema({
        first: {
            type: String,
            lowercase: true
        },
        last: {
            type: String,
            lowercase: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        loginAttempts: {
            type: Number,
            default: 0
        }
    }, {
        collection: 'users'
    });

    return connection.model(name, schema);
};
