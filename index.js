"use strict";
exports.__esModule = true;
exports.getAllLoggers = exports.getLoggerForRoute = exports.getLoggerForService = exports.createLogger = exports.BaseStreamLogger = exports.findLogger = void 0;
var lodash_1 = require("lodash");
var chalk_1 = require("chalk");
var utils_1 = require("./utils");
var space = '    ';
var validLevels = new Set(['error', 'warning', 'info', 'verbose', 'debug']);
var instances = [];
var lastEntries = new Map();
var findLogger = function (meta) { return instances.find(function (logger) { return logger.hasMeta(meta); }); };
exports.findLogger = findLogger;
var BaseStreamLogger = /** @class */ (function () {
    function BaseStreamLogger(meta, initialLevel, options) {
        if (initialLevel === void 0) { initialLevel = 'verbose'; }
        this._isTest = !!(options === null || options === void 0 ? void 0 : options.isTest);
        this._isDev = !!(options === null || options === void 0 ? void 0 : options.isDev);
        this._meta = meta;
        this._enabled = {
            error: true,
            warning: false,
            info: false,
            verbose: false,
            debug: false
        };
        this.setLevel(initialLevel);
        instances.push(this);
    }
    BaseStreamLogger.prototype.hasMeta = function (meta) {
        if (!meta || (0, lodash_1.isEmpty)(meta)) {
            return false;
        }
        for (var key in meta) {
            if (this._meta[key] !== meta[key]) {
                return false;
            }
        }
        return true;
    };
    BaseStreamLogger.prototype.setLevel = function (level) {
        if (!validLevels.has(level)) {
            return;
        }
        this._enabled.error = true;
        this._enabled.warning = false;
        this._enabled.info = false;
        this._enabled.verbose = false;
        this._enabled.debug = false;
        if (this._isTest || level === 'error') {
            // no other loggers enabled
        }
        else if (level === 'warning') {
            this._enabled.warning = true;
        }
        else if (level === 'info') {
            this._enabled.warning = true;
            this._enabled.info = true;
        }
        else if (level === 'verbose') {
            this._enabled.warning = true;
            this._enabled.info = true;
            this._enabled.verbose = true;
        }
        else if (level === 'debug') {
            this._enabled.warning = true;
            this._enabled.info = true;
            this._enabled.verbose = true;
            this._enabled.debug = true;
        }
        return this;
    };
    Object.defineProperty(BaseStreamLogger.prototype, "prefix", {
        get: function () {
            var _a = this._meta, id = _a.id, type = _a.type;
            if (id) {
                return "".concat(type, ".").concat(id);
            }
            else {
                return "".concat(type);
            }
        },
        enumerable: false,
        configurable: true
    });
    BaseStreamLogger.prototype._logWithLevel = function (level, what, options) {
        var _a = (0, utils_1.iso)(), now = _a.now, isoDate = _a.isoDate;
        var msgRaw = [level, this.prefix, what].join(' ');
        var message = this._isDev ? "".concat(isoDate, " ").concat(msgRaw) : msgRaw;
        if (options === null || options === void 0 ? void 0 : options.throttle) {
            var last = lastEntries.get(msgRaw);
            if (last && ((now - last) < options.throttle)) {
                return; // skip repeated logs
            }
            else {
                lastEntries.set(msgRaw, now);
            }
        }
        var shouldWriteToConsole = (level === 'error') ||
            (level === 'debug' && this._enabled.debug) ||
            (level === 'info' && this._enabled.info) ||
            (level === 'verbose' && this._enabled.verbose) ||
            (level === 'warning' && this._enabled.warning);
        if (!shouldWriteToConsole) {
            // skip this step
        }
        else if (level === 'info') {
            console.log(chalk_1["default"].green(message));
        }
        else if (level === 'error') {
            console.log(chalk_1["default"].red(message));
        }
        else if (level === 'warning') {
            console.log(chalk_1["default"].yellow(message));
        }
        else {
            console.log(message);
        }
        if (options === null || options === void 0 ? void 0 : options.trace) {
            console.trace();
        }
    };
    BaseStreamLogger.prototype.debug = function (what, options) {
        this._logWithLevel('debug', what, options);
    };
    BaseStreamLogger.prototype.verbose = function (what, options) {
        this._logWithLevel('verbose', what, options);
    };
    BaseStreamLogger.prototype.info = function (what, options) {
        this._logWithLevel('info', what, options);
    };
    BaseStreamLogger.prototype.warn = function (what, options) {
        this._logWithLevel('warning', what, options);
    };
    BaseStreamLogger.prototype.error = function (what, error, options) {
        if (error) {
            this._logWithLevel('error', "".concat(what, " ").concat((0, utils_1.errorToString)(error)), options);
        }
        else {
            this._logWithLevel('error', what, options);
        }
    };
    BaseStreamLogger.prototype.silly = function (what) {
        if (Math.random() < 0) {
            this.verbose(what);
        }
    };
    BaseStreamLogger.prototype.prettyPrint = function (what) {
        if (!this._isTest && (0, lodash_1.isString)(what)) {
            var text = space + what + space;
            var line = (0, lodash_1.repeat)('-', text.length);
            var prefix = this._isDev ? "".concat((0, utils_1.iso)().isoDate, " info: ") : 'info: ';
            console.log(prefix, line);
            console.log(prefix, text);
            console.log(prefix, line);
        }
    };
    return BaseStreamLogger;
}());
exports.BaseStreamLogger = BaseStreamLogger;
function createLogger(meta) {
    return new BaseStreamLogger(meta);
}
exports.createLogger = createLogger;
function getLoggerForService(id) {
    var meta = { type: 'service', id: id };
    return (0, exports.findLogger)(meta) || createLogger(meta);
}
exports.getLoggerForService = getLoggerForService;
function getLoggerForRoute(id) {
    var meta = { type: 'route', id: id };
    return (0, exports.findLogger)(meta) || createLogger(meta);
}
exports.getLoggerForRoute = getLoggerForRoute;
function getAllLoggers() {
    return instances;
}
exports.getAllLoggers = getAllLoggers;
