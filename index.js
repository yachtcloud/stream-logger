import { isEmpty, isString, repeat } from 'lodash';
import chalk from 'chalk';
import { errorToString, iso } from './utils';
const space = '    ';
const validLevels = new Set(['error', 'warning', 'info', 'verbose', 'debug']);
const instances = [];
const lastEntries = new Map();
export const findLogger = (meta) => instances.find(logger => logger.hasMeta(meta));
export class BaseStreamLogger {
    constructor(meta, initialLevel = 'verbose', options) {
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
    hasMeta(meta) {
        if (!meta || isEmpty(meta)) {
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
    _logWithLevel(level, what, options) {
        const { now, isoDate } = iso();
        const msgRaw = [level, this.prefix, what].join(' ');
        const message = this._isDev ? `${isoDate} ${msgRaw}` : msgRaw;
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
            this._logWithLevel('error', `${what} ${errorToString(error)}`, options);
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
        if (!this._isTest && isString(what)) {
            const text = space + what + space;
            const line = repeat('-', text.length);
            const prefix = this._isDev ? `${iso().isoDate} info: ` : 'info: ';
            console.log(prefix, line);
            console.log(prefix, text);
            console.log(prefix, line);
        }
    }
}
export function createLogger(meta) {
    return new BaseStreamLogger(meta);
}
export function getLoggerForService(id) {
    const meta = { type: 'service', id };
    return findLogger(meta) || createLogger(meta);
}
export function getLoggerForRoute(id) {
    const meta = { type: 'route', id };
    return findLogger(meta) || createLogger(meta);
}
export function getAllLoggers() {
    return instances;
}
