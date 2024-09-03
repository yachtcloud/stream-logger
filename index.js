"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEnvironment = exports.getAllLoggers = exports.getLoggerForRoute = exports.getLoggerForService = exports.createLogger = exports.BaseStreamLogger = exports.filterLoggersByMeta = exports.findLoggerByMeta = exports.LogLevelOptions = void 0;
const lodash_1 = require("lodash");
const chalk = require("chalk");
const utils_1 = require("./utils");
var LogLevelOptions;
(function (LogLevelOptions) {
    LogLevelOptions["error"] = "error";
    LogLevelOptions["warning"] = "warning";
    LogLevelOptions["info"] = "info";
    LogLevelOptions["verbose"] = "verbose";
    LogLevelOptions["debug"] = "debug";
})(LogLevelOptions = exports.LogLevelOptions || (exports.LogLevelOptions = {}));
const space = '    ';
let isDev = false;
let isTest = false;
const validLevels = new Set([
    LogLevelOptions.error,
    LogLevelOptions.warning,
    LogLevelOptions.info,
    LogLevelOptions.verbose,
    LogLevelOptions.debug
]);
const instances = [];
const lastEntries = new Map();
const findLoggerByMeta = (meta) => instances.find(logger => logger.hasMeta(meta));
exports.findLoggerByMeta = findLoggerByMeta;
function filterLoggersByMeta(meta) {
    return instances.filter(logger => logger.hasMeta(meta));
}
exports.filterLoggersByMeta = filterLoggersByMeta;
class BaseStreamLogger {
    constructor(meta, initialLevel = 'verbose') {
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
    hasMeta(meta) {
        if (!meta || (0, lodash_1.isEmpty)(meta)) {
            return false;
        }
        for (const key in meta) {
            if (this._meta[key] !== meta[key]) {
                return false;
            }
        }
        return true;
    }
    setLevel(level) {
        if (!validLevels.has(level)) {
            return;
        }
        this._enabled.error = true;
        this._enabled.warning = false;
        this._enabled.info = false;
        this._enabled.verbose = false;
        this._enabled.debug = false;
        if (isTest || level === 'error') {
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
    }
    get prefix() {
        const { id, type } = this._meta;
        if (id) {
            return `${type}.${id}`;
        }
        else {
            return `${type}`;
        }
    }
    get meta() {
        return this._meta;
    }
    get enabled() {
        return this._enabled;
    }
    _logWithLevel(level, what, options) {
        const { now, isoDate } = (0, utils_1.iso)();
        const msgRaw = [level, this.prefix, what].join(' ');
        const message = isDev ? `${isoDate} ${msgRaw}` : msgRaw;
        if (options === null || options === void 0 ? void 0 : options.throttle) {
            const last = lastEntries.get(msgRaw);
            if (last && ((now - last) < options.throttle)) {
                return; // skip repeated logs
            }
            else {
                lastEntries.set(msgRaw, now);
            }
        }
        const shouldWriteToConsole = (level === 'error') ||
            (level === 'debug' && this._enabled.debug) ||
            (level === 'info' && this._enabled.info) ||
            (level === 'verbose' && this._enabled.verbose) ||
            (level === 'warning' && this._enabled.warning);
        if (!shouldWriteToConsole) {
            // skip this step
        }
        else if (level === 'info') {
            console.log(chalk.green(message));
        }
        else if (level === 'error') {
            console.log(chalk.red(message));
        }
        else if (level === 'warning') {
            console.log(chalk.yellow(message));
        }
        else {
            console.log(message);
        }
        if (options === null || options === void 0 ? void 0 : options.trace) {
            console.trace();
        }
    }
    debug(what, options) {
        this._logWithLevel('debug', what, options);
    }
    verbose(what, options) {
        this._logWithLevel('verbose', what, options);
    }
    info(what, options) {
        this._logWithLevel('info', what, options);
    }
    warn(what, options) {
        this._logWithLevel('warning', what, options);
    }
    error(what, error, options) {
        if (error) {
            this._logWithLevel('error', `${what} ${(0, utils_1.errorToString)(error)}`, options);
        }
        else {
            this._logWithLevel('error', what, options);
        }
    }
    silly(what) {
        if (Math.random() < 0) {
            this.verbose(what);
        }
    }
    prettyPrint(what) {
        if (!isTest && (0, lodash_1.isString)(what)) {
            const text = space + what + space;
            const line = (0, lodash_1.repeat)('-', text.length);
            const prefix = isDev ? `${(0, utils_1.iso)().isoDate} info: ` : 'info: ';
            console.log(prefix, line);
            console.log(prefix, text);
            console.log(prefix, line);
        }
    }
}
exports.BaseStreamLogger = BaseStreamLogger;
function createLogger(meta) {
    return new BaseStreamLogger(meta);
}
exports.createLogger = createLogger;
function getLoggerForService(id) {
    const meta = { type: 'service', id };
    return (0, exports.findLoggerByMeta)(meta) || createLogger(meta);
}
exports.getLoggerForService = getLoggerForService;
function getLoggerForRoute(id) {
    const meta = { type: 'route', id };
    return (0, exports.findLoggerByMeta)(meta) || createLogger(meta);
}
exports.getLoggerForRoute = getLoggerForRoute;
function getAllLoggers() {
    return instances;
}
exports.getAllLoggers = getAllLoggers;
function setupEnvironment(env) {
    if (!(0, lodash_1.isUndefined)(env.isDev)) {
        isDev = !!env.isDev;
    }
    if (!(0, lodash_1.isUndefined)(env.isTest)) {
        isTest = !!env.isTest;
    }
}
exports.setupEnvironment = setupEnvironment;
