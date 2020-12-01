"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/Logger");
const Config_1 = __importDefault(require("../util/Config"));
const RepWorker_1 = __importDefault(require("./RepWorker"));
class RepDriver {
    constructor(cRoot) {
        this.config = new Config_1.default(cRoot);
        this.worker = [];
        Logger_1.catRepDriver.info('Created new RepDriver instance, please init() before use.');
    }
    init() {
        Logger_1.catRepDriver.info('Start init RepDriver instance.');
        if (!this.config.readConfig()) {
            return false;
        }
        Logger_1.catRepDriver.info('Done init RepDriver instance.');
        return true;
    }
    run() {
        const startDateTime = new Date();
        Logger_1.catRepDriver.info(`Started app at ${startDateTime}`);
        const pages = this.config.getPages();
        for (let page of pages) {
            Logger_1.catRepDriver.info(`Start new workder for page: ${page.url} with interval: ${page.interval}`);
            const pageWorker = new RepWorker_1.default(page, this.config.getOut());
            this.worker.push(pageWorker);
            pageWorker.start();
            break;
        }
    }
}
exports.default = RepDriver;
