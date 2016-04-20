'use strict';

const async = require('async');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectId;
const _ = require('lodash');

module.exports = function(mycro) {
    return function() {
        return {
            options: {
                baseUrl: 'https://www.example.com',
                id: '_id',
                links: {
                    self(resource, options) {
                        return options.baseUrl + options.requestPath + '/' + resource.id;
                    }
                },
                topLevelLinks: {
                    self(options) {
                        return options.baseUrl + options.requestPath;
                    }
                }
            },
            types: {
                user: {
                    requestPath: '/api/users',
                    blacklist: ['password'],
                    relationships: {
                        groups: generateRelationshipConfig('groups', 'group'),
                        posts: generateRelationshipConfig('posts', 'post')
                    },
                    schemas: {
                        'names-only': {
                            whitelist: ['first', 'last']
                        }
                    }
                },
                group: {
                    requestPath: '/api/groups',
                    relationships: {
                        users: generateRelationshipConfig('users', 'user')
                    }
                },
                post: {
                    requestPath: '/api/blog/posts',
                    relationships: {
                        author: generateRelationshipConfig('author', 'user'),
                        likes: generateRelationshipConfig('likes', 'user')
                    }
                }
            },
            rest: {
                filter: {
                    modifiers: {
                        $gt: true,
                        $gte: true,
                        $in: true,
                        $lt: true,
                        $lte: true,
                        $objectId(field, value, cb) {
                            const service = this;
                            if (!_.isString(value)) {
                                return async.setImmediate(function() {
                                    cb(service.errors.badRequest(`The '$objectId' modifier requires a string input`));
                                });
                            }
                        },
                        $ne: true,
                        $nin: true
                    }
                }
            }
        };
    };
};

function generateRelationshipConfig(attr, type, options) {
    if (!options) {
        options = {};
    }
    _.extend(options, {
        type: type,
        links: {
            self(resource, options) {
                return options.baseUrl + options.requestPath + '/' + resource.id + '/relationships/' + attr;
            },
            related(resource, options) {
                return options.baseUrl + options.requestPath + '/' + resource.id + '/' + attr;
            }
        }
    });
    return options;
}
