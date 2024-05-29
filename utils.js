"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorToString = exports.iso = void 0;
var lodash_1 = require("lodash");
function iso() {
    var logDate = new Date();
    var now = Date.now();
    logDate.setTime(now);
    return { now: now, isoDate: logDate.toISOString() };
}
exports.iso = iso;
function errorToString(err) {
    var errorString = (0, lodash_1.get)(err, 'response.data.message', null) || (0, lodash_1.get)(err, 'message', null) || "".concat(err);
    var _a = (0, lodash_1.get)(err, 'request.res', { statusCode: -1, statusMessage: null, responseUrl: null }), statusCode = _a.statusCode, statusMessage = _a.statusMessage, responseUrl = _a.responseUrl;
    if (statusCode > 0 && statusMessage && responseUrl) {
        return "".concat(errorString, " at URL ").concat(responseUrl);
    }
    return errorString;
}
exports.errorToString = errorToString;
