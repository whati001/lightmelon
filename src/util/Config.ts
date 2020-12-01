import { catConfig } from './Logger';
import fs from 'fs';
import path from 'path';
import { fileExists, readJson } from './../util/FileHandler'

import { PagesConfig, OutConfig } from '../types/config'

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

  public getPages(): PagesConfig {
    return this.pageConfig;
  }

  public getOut(): OutConfig {
    return this.outConfig;
  }



  private _configFileExists(): boolean {
    for (let cPath of [this.rootDir, this.pageFile, this.outFile]) {
      catConfig.debug(`Verify if config path ${cPath} exists`);
      if (!(fileExists(cPath))) {
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

    const pageJson = readJson(this.pageFile);
    if (!pageJson) {
      catConfig.error(`Failed to load pageConfig`, new Error());
      return false;
    }
    this.pageConfig = pageJson
    catConfig.debug(`PageConfig: ${JSON.stringify(this.pageConfig)}`);

    const outJson = readJson(this.outFile);
    if (!outJson) {
      catConfig.error(`Failed to load outConfig`, new Error());
      return false;
    }
    this.outConfig = outJson;
    catConfig.debug(`OutConfig: ${JSON.stringify(this.outConfig)}`);


    return true;
  }
}