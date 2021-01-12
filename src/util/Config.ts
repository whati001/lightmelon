import { catConfig } from './Logger';
import { fileExists, readJson, resolveRelativeToApp, resolveRelativeToFile } from './../util/FileHandler';
import { URL } from 'url';

import { PagesConfig, AppConfig, BrowserConfig, PageConfig } from '../types/config';

export default class Config {
  static readonly APP_FILE_NAME: string = 'app.json';
  static readonly PAGE_FILE_NAME: string = 'pages.json';
  static readonly INIT_PAGES_CONFIG: PagesConfig = [];
  static readonly INIT_APP_CONFIG: AppConfig = { output: [], workerInterval: 0, browserExecutable: '', browserUserDir: '' };

  private loadConfig: boolean;
  private pagesFile: string;
  private appFile: string;

  private pagesConfig: PagesConfig;
  private appConfig: AppConfig;

  constructor(root: string = './config/') {
    catConfig.info(`Initiate new instance for configRoot: ${root}`);

    this.loadConfig = false;
    this.pagesFile = resolveRelativeToApp(root, Config.PAGE_FILE_NAME);
    this.appFile = resolveRelativeToApp(root, Config.APP_FILE_NAME);
    this.pagesConfig = Config.INIT_PAGES_CONFIG;
    this.appConfig = Config.INIT_APP_CONFIG;

    catConfig.info(`Done initiating new instance for configRoot: ${root}`);
  }

  public getPages(): PagesConfig {
    return this.pagesConfig;
  }

  public getApp(): AppConfig {
    return this.appConfig;
  }

  public getBrowserExecPath(): BrowserConfig {
    return this.appConfig.browserExecutable;
  }

  public getBrowserUserDir(): BrowserConfig {
    return this.appConfig.browserUserDir;
  }

  public getWorkerSleepInterval(): number {
    return this.appConfig.workerInterval;
  }

  private _validateConfig(): boolean {
    if (!fileExists(this.appConfig.browserExecutable)) {
      catConfig.error('Browser executable not found', new Error('Invalid BrowserEXE'));
      return false;
    }
    for (let page of this.pagesConfig) {
      try {
        new URL(page.url);
      } catch (_) {
        catConfig.error(`Invalid url found for page: ${page.name}, please check ${page.url}`, new Error('Invalid PageUrl'));
        return false;
      }
    }
    return true;
  }

  private _readConfigFile<T>(file: string): T | undefined {
    if (!fileExists(file)) {
      catConfig.error(`Failed to find config file: ${file}`, new Error('Config file not found'));
      return;
    }

    const config = readJson<T>(file);
    if (!config) {
      catConfig.error(`Failed to read configuration file: ${file}`, new Error('Config file read failed'));
      return;
    }
    catConfig.debug(`Config[${file}]: ${JSON.stringify(config)}`);
    return config;
  }

  public readConfig(): boolean {
    if (this.loadConfig) {
      return true;
    }

    const pageRet = this._readConfigFile<PagesConfig>(this.pagesFile);
    if (!pageRet) {
      catConfig.error(`Failed to read ${this.pagesFile}`, new Error('Config error'));
      return false;
    }
    this.pagesConfig = pageRet;

    const appRet = this._readConfigFile<AppConfig>(this.appFile);
    if (!appRet) {
      catConfig.error(`Failed to read ${this.appFile}`, new Error('Config error'));
      return false;
    }
    this.appConfig = appRet;

    return this._validateConfig();
  }
}