'use strict';

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
