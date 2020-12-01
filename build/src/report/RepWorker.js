"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../util/Logger");
const moment_1 = __importDefault(require("moment"));
// @ts-ignore
const chromeLauncher = require('chrome-launcher');
// @ts-ignore
const lighthouse = require('lighthouse');
// import { writeFile } from "../util/FileHandler";
class RepWorker {
    constructor(pageConfig, outConfig) {
        this._sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
        this.url = pageConfig.url;
        this.interval = pageConfig.interval;
        this.auth = { user: 'anoymous', pwd: 'anoymous' };
        this.resDir = outConfig.folder;
    }
    // @ts-ignore
    _getLigthouseReport() {
        return __awaiter(this, void 0, void 0, function* () {
            const chromeBrowser = yield chromeLauncher.launch({ chromeFlags: ['--headless'] });
            const options = { logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chromeBrowser.port };
            const runnerResult = yield lighthouse(this.url, options);
            const report = runnerResult.report;
            yield chromeBrowser.kill();
            return report;
        });
    }
    createReport() {
        return __awaiter(this, void 0, void 0, function* () {
            const timeStamp = moment_1.default().format('YYYYMMDD-hmmss');
            Logger_1.catRepWorker.info(`Start creating new report for url ${this.url} at ${timeStamp}`);
            const resJson = `resJson_${this.url}_${timeStamp}.json`;
            const resHtml = `resHtml_${timeStamp}.html`;
            const report = yield this._getLigthouseReport();
            console.log(report);
            Logger_1.catRepWorker.info(`Finished creating report for url: ${this.url} -> Result[json: ${resJson}, html: ${resHtml}]`);
            return true;
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                yield this.createReport();
                yield this._sleep(this.interval);
                break;
            }
        });
    }
}
exports.default = RepWorker;
