import { catConfig } from './Logger';
import fs from 'fs';
import path from 'path';

import { PagesConfig, OutConfig, PageConfig} from '../types/config'

export default class Config {
  private readonly PAGE_FILE_NAME: string = 'pages.json';
  private readonly OUT_FILE_NAME: string = 'output.json';

  private loadConfig: boolean;
  private rootDir: string;
  private pageFile: string;
  private outFile: string;

  private pageConfig: PagesConfig;
  private outConfig: OutConfig;

  constructor(root: string = './config/') {
    catConfig.info(`Initiate new instance for configRoot: ${root}`);

    this.loadConfig = false;
    this.rootDir = root;
    this.pageFile = path.join(this.rootDir, this.PAGE_FILE_NAME);
    this.outFile = path.join(this.rootDir, this.OUT_FILE_NAME);
    this.pageConfig = [];
    this.outConfig = { "folder": "" };

    catConfig.info(`Done initiating new instance for configRoot: ${root}`);
  }

  private _fileExists(path: string): boolean {
    return fs.existsSync(path);
  }

  private _configFileExists(): boolean {
    for (let cPath of [this.rootDir, this.pageFile, this.outFile]) {
      catConfig.debug(`Verify if config path ${cPath} exists`);
      if (!this._fileExists(cPath)) {
        catConfig.error(`Configuration path ${cPath} does not exists, please double check.`, new Error());
      }
    }
    return true;
  }

  public readConfig(): boolean {
    if (this.loadConfig) {
      return true;
    }

    catConfig.info('Start reading config')
    if (!this._configFileExists()) {
      return false;
    }

    const pagePayload = fs.readFileSync(this.pageFile);
    if (pagePayload) {
      this.pageConfig = JSON.parse(pagePayload.toString());
      catConfig.debug(`PageConfig: ${JSON.stringify(this.pageConfig)}`);
      if (!this.pageConfig) {
        catConfig.error('Failed to read pageConfig', new Error());
        return false;
      }
    }
    const outPayload = fs.readFileSync(this.outFile);
    if (outPayload) {
      this.outConfig = JSON.parse(outPayload.toString());
      catConfig.debug(`OutConfig: ${JSON.stringify(this.outConfig)}`);
      if (!this.outConfig) {
        catConfig.error('Failed to read outConfig', new Error());
        return false;
      }
    }

    return true;
  }
}