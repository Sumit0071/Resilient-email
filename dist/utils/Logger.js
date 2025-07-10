"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static info(message, data) {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || '');
    }
    static warn(message, data) {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data || '');
    }
    static error(message, error) {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map