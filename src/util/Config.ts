import { catConfig } from './Logger';
import path from 'path';
import { fileExists, readJson } from './../util/FileHandler';

import { PagesConfig, AppConfig, BrowserConfig, PageConfig } from '../types/config';

export default class Config {
  private readonly APP_FILE_NAME: string = 'app.json';
  private readonly PAGE_FILE_NAME: string = 'pages.json';

  private loadConfig: boolean;
  private rootDir: string;
  private pageFile: string;
  private appFile: string;

  private pageConfig: PagesConfig;
  private appConfig: AppConfig;

  constructor(root: string = './config/') {
    catConfig.info(`Initiate new instance for configRoot: ${root}`);

    this.loadConfig = false;
    this.rootDir = root;
    this.pageFile = path.join(this.rootDir, this.PAGE_FILE_NAME);
    this.appFile = path.join(this.rootDir, this.APP_FILE_NAME);
    this.pageConfig = [];
    this.appConfig = { output: [], workerInterval: 0, browser: { headless: false, userProfile: false } };

    catConfig.info(`Done initiating new instance for configRoot: ${root}`);
  }

  public getPages(): PagesConfig {
    return this.pageConfig;
  }

  public getApp(): AppConfig {
    return this.appConfig;
  }

  public getBrowser(): BrowserConfig {
    return this.appConfig.browser;
  }

  public getWorkerSleepInterval(): number {
    return this.appConfig.workerInterval;
  }

  private _configFileExists(): boolean {
    for (let cPath of [this.rootDir, this.pageFile, this.appFile]) {
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

    catConfig.info('Start reading config');
    if (!this._configFileExists()) {
      return false;
    }

    const pageJson = readJson<PagesConfig>(this.pageFile);
    if (!pageJson) {
      catConfig.error('Failed to load pageConfig', new Error());
      return false;
    }
    this.pageConfig = pageJson;
    catConfig.debug(`PageConfig: ${JSON.stringify(this.pageConfig)}`);

    const appJson = readJson<AppConfig>(this.appFile);
    if (!appJson) {
      catConfig.error('Failed to load outConfig', new Error());
      return false;
    }
    this.appConfig = appJson;
    catConfig.debug(`AppConfig: ${JSON.stringify(this.appFile)}`);


    return true;
  }
}