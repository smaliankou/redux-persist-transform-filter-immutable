'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createTransform = createTransform;
exports.createFilter = createFilter;
exports.createWhitelistFilter = createWhitelistFilter;
exports.createBlacklistFilter = createBlacklistFilter;
exports.persistFilter = persistFilter;

var _immutable = require('immutable');

var _lodash = require('lodash.forin');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.get');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.includes');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.isempty');

var _lodash8 = _interopRequireDefault(_lodash7);

var _lodash9 = require('lodash.isobject');

var _lodash10 = _interopRequireDefault(_lodash9);

var _lodash11 = require('lodash.isstring');

var _lodash12 = _interopRequireDefault(_lodash11);

var _lodash13 = require('lodash.isundefined');

var _lodash14 = _interopRequireDefault(_lodash13);

var _lodash15 = require('lodash.pickby');

var _lodash16 = _interopRequireDefault(_lodash15);

var _lodash17 = require('lodash.set');

var _lodash18 = _interopRequireDefault(_lodash17);

var _lodash19 = require('lodash.unset');

var _lodash20 = _interopRequireDefault(_lodash19);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createTransform(dataToStorage, dataFromStorage) {
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var whitelist = (0, _lodash10.default)(config) && Array.isArray(config.whitelist) ? config.whitelist : null;
    var blacklist = (0, _lodash10.default)(config) && Array.isArray(config.blacklist) ? config.blacklist : null;

    function whitelistBlacklistCheck(key) {
        return whitelist && !(0, _lodash6.default)(whitelist, key) || blacklist && (0, _lodash6.default)(blacklist, key);
    }

    function transformDataToStorage(state, key) {
        return !whitelistBlacklistCheck(key) && dataToStorage ? dataToStorage(state, key) : state;
    }

    function transformDataFromStorage(state, key) {
        return !whitelistBlacklistCheck(key) && dataFromStorage ? dataFromStorage(state, key) : state;
    }

    return {
        in: transformDataToStorage,
        out: transformDataFromStorage,
        transformDataToStorage: transformDataToStorage,
        transformDataFromStorage: transformDataFromStorage
    };
}

function createFilter(reducerName, inboundPaths, outboundPaths) {
    var transformType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'whitelist';

    transformType = (0, _lodash6.default)(['whitelist', 'blacklist'], transformType) ? transformType : 'whitelist';

    return createTransform(function (inboundState, key) {
        return inboundPaths ? persistFilter(inboundState, inboundPaths, transformType) : inboundState;
    }, function (outboundState, key) {
        return outboundPaths ? persistFilter(outboundState, outboundPaths, transformType) : outboundState;
    }, { whitelist: typeof reducerName === "string" ? [reducerName] : reducerName });
};

function createWhitelistFilter(reducerName, inboundPaths, outboundPaths) {
    return createFilter(reducerName, inboundPaths, outboundPaths, 'whitelist');
}

function createBlacklistFilter(reducerName, inboundPaths, outboundPaths) {
    return createFilter(reducerName, inboundPaths, outboundPaths, 'blacklist');
}

function filterObject(_ref, state, iterable) {
    var path = _ref.path,
        _ref$filterFunction = _ref.filterFunction,
        filterFunction = _ref$filterFunction === undefined ? function () {
        return true;
    } : _ref$filterFunction;

    var value = iterable ? state.getIn(path) : (0, _lodash4.default)(state, path);

    return Array.isArray(value) || _immutable.Iterable.isIterable(value) ? value.filter(filterFunction) : (0, _lodash16.default)(value, filterFunction);
}

function persistFilter(state) {
    var paths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var transformType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'whitelist';

    if (!(0, _lodash6.default)(['whitelist', 'blacklist'], transformType)) {
        return state;
    }

    var blacklist = 'blacklist' === transformType;
    var iterable = _immutable.Iterable.isIterable(state);
    var subset = iterable ? (0, _immutable.Map)(blacklist ? state : {}) : blacklist ? Object.assign({}, state) : {};
    paths = (0, _lodash12.default)(paths) ? [paths] : paths;

    if (!blacklist) {
        paths.forEach(function (path) {
            if ((0, _lodash10.default)(path) && !Array.isArray(path)) {
                if (path.hasOwnProperty('path')) {
                    var value = filterObject(path, state, iterable);

                    if (!(0, _lodash8.default)(value)) {
                        iterable ? subset = subset.setIn(Array.isArray(path.path) ? path.path : [path.path], value) : (0, _lodash18.default)(subset, path.path, value);
                    }
                }
            } else {
                var _value = iterable ? state.getIn(Array.isArray(path) ? path : [path]) : (0, _lodash4.default)(state, path);

                if (!(0, _lodash14.default)(_value)) {
                    iterable ? subset = subset.setIn(Array.isArray(path) ? path : [path], _value) : (0, _lodash18.default)(subset, path, _value);
                }
            }
        });
    } else {
        paths.forEach(function (path) {
            if ((0, _lodash10.default)(path) && !Array.isArray(path)) {
                if (path.hasOwnProperty('path')) {
                    var value = filterObject(path, state, iterable);

                    if (!(0, _lodash8.default)(value)) {
                        if (Array.isArray(value)) {
                            iterable ? subset = subset.setIn(Array.isArray(path.path) ? path.path : [path.path], subset.getIn(Array.isArray(path.path) ? path.path : [path.path]).filter(function (x) {
                                return false;
                            })) : (0, _lodash18.default)(subset, path.path, (0, _lodash4.default)(subset, path.path).filter(function (x) {
                                return false;
                            }));
                        } else {
                            (0, _lodash2.default)(value, function (value, key) {
                                iterable ? subset = subset.deleteIn([path.path, key]) : (0, _lodash20.default)(subset, path.path + '[' + key + ']');
                            });
                        }
                    }
                }
            } else {
                var _value2 = iterable ? state.getIn(Array.isArray(path) ? path : [path]) : (0, _lodash4.default)(state, path);

                if (!(0, _lodash14.default)(_value2)) {
                    iterable ? subset = subset.deleteIn(Array.isArray(path) ? path : [path]) : (0, _lodash20.default)(subset, path);
                }
            }
        });
    }

    return subset;
}

exports.default = createFilter;
