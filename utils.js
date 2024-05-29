"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorToString = exports.iso = void 0;
const lodash_1 = require("lodash");
function iso() {
    let logDate = new Date();
    const now = Date.now();
    logDate.setTime(now);
    return { now, isoDate: logDate.toISOString() };
}
exports.iso = iso;
function errorToString(err) {
    const errorString = (0, lodash_1.get)(err, 'response.data.message', null) || (0, lodash_1.get)(err, 'message', null) || `${err}`;
    const { statusCode, statusMessage, responseUrl } = (0, lodash_1.get)(err, 'request.res', { statusCode: -1, statusMessage: null, responseUrl: null });
    if (statusCode > 0 && statusMessage && responseUrl) {
        return `${errorString} at URL ${responseUrl}`;
    }
    return errorString;
}
exports.errorToString = errorToString;
