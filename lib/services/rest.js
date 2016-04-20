'use strict';

const async = require('async');
const modifiers = require('../utils/modifiers');
const normalize = require('../utils/normalize');
const parse = require('../utils/parse');
const _ = require('lodash');


function Service(options) {
    const self = this;
    self._options = _.cloneDeep(options);
    self.modifiers = _.merge(modifiers, _.get(self._options, 'filter.modifiers') || {});
    self.normalize = normalize(self);
    self.parse = parse(self);
}

module.exports = Service;
