"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./Logger");
const path_1 = __importDefault(require("path"));
const FileHandler_1 = require("./../util/FileHandler");
class Config {
    constructor(root = './config/') {
        this.PAGE_FILE_NAME = 'pages.json';
        this.OUT_FILE_NAME = 'output.json';
        Logger_1.catConfig.info(`Initiate new instance for configRoot: ${root}`);
        this.loadConfig = false;
        this.rootDir = root;
        this.pageFile = path_1.default.join(this.rootDir, this.PAGE_FILE_NAME);
        this.outFile = path_1.default.join(this.rootDir, this.OUT_FILE_NAME);
        this.pageConfig = [];
        this.outConfig = { "folder": "" };
        Logger_1.catConfig.info(`Done initiating new instance for configRoot: ${root}`);
    }
    getPages() {
        return this.pageConfig;
    }
    getOut() {
        return this.outConfig;
    }
    _configFileExists() {
        for (let cPath of [this.rootDir, this.pageFile, this.outFile]) {
            Logger_1.catConfig.debug(`Verify if config path ${cPath} exists`);
            if (!(FileHandler_1.fileExists(cPath))) {
                Logger_1.catConfig.error(`Configuration path ${cPath} does not exists, please double check.`, new Error());
            }
        }
        return true;
    }
    readConfig() {
        if (this.loadConfig) {
            return true;
        }
        Logger_1.catConfig.info('Start reading config');
        if (!this._configFileExists()) {
            return false;
        }
        const pageJson = FileHandler_1.readJson(this.pageFile);
        if (!pageJson) {
            Logger_1.catConfig.error(`Failed to load pageConfig`, new Error());
            return false;
        }
        this.pageConfig = pageJson;
        Logger_1.catConfig.debug(`PageConfig: ${JSON.stringify(this.pageConfig)}`);
        const outJson = FileHandler_1.readJson(this.outFile);
        if (!outJson) {
            Logger_1.catConfig.error(`Failed to load outConfig`, new Error());
            return false;
        }
        this.outConfig = outJson;
        Logger_1.catConfig.debug(`OutConfig: ${JSON.stringify(this.outConfig)}`);
        return true;
    }
}
exports.default = Config;
