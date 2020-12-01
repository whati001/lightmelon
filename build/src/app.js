"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const Logger_1 = require("./util/Logger");
const RepDriver_1 = __importDefault(require("./report/RepDriver"));
const getConfigRoot = () => {
    return path_1.default.join(__dirname, './config/');
};
(() => {
    Logger_1.catApp.info('Staring app in progress...');
    const repMe = new RepDriver_1.default(getConfigRoot());
    repMe.init();
    repMe.run();
    Logger_1.catApp.info('Stopping app in progress...');
})();
