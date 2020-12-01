"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catRepWorker = exports.catConfig = exports.catRepDriver = exports.catApp = void 0;
const typescript_logging_1 = require("typescript-logging");
// create new logger instance
typescript_logging_1.CategoryServiceFactory.setDefaultConfiguration(new typescript_logging_1.CategoryConfiguration(typescript_logging_1.LogLevel.Debug));
// register categories
exports.catApp = new typescript_logging_1.Category('app');
exports.catRepDriver = new typescript_logging_1.Category('rep-driver', exports.catApp);
exports.catConfig = new typescript_logging_1.Category('config', exports.catApp);
exports.catRepWorker = new typescript_logging_1.Category('rep-worker', exports.catApp);
