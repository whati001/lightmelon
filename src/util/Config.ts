import { catConfig } from './Logger';
import { fileExists, readJson, resolveRelativeToApp } from './../util/FileHandler';
import { URL } from 'url';

import { AppConfig, BrowserConfig, ReportOutputs } from './../types/appConfig';
import { PageConfigs } from './../types/pageConfig';

/**
 * Config class
 */
export default class Config {
  static readonly APP_FILE_NAME: string = 'app.json';
  static readonly PAGE_FILE_NAME: string = 'pages.json';
  static readonly INIT_PAGES_CONFIG: PageConfigs = [];
  static readonly INIT_APP_CONFIG: AppConfig = { 'output': [{ 'type': 'file', 'folder': './result/' }], 'browser': { 'type': 'chromium', 'executable': './../chromium/chrome.exe', 'headless': false, 'auth': { 'email': '', 'pwd': '' } }, 'workerInterval': 1000 };

  private pageFile = '';
  private appFile = '';
  private pagesConfig: PageConfigs;
  private appConfig: AppConfig;

  /**
   * Config ctor
   * @param configDir relative config root directory
   */
  constructor(configDir: string = './config/') {
    catConfig.info(`Initiated new configuration instance for configDir: ${configDir}`);

    this.pageFile = resolveRelativeToApp(configDir, Config.PAGE_FILE_NAME);
    this.appFile = resolveRelativeToApp(configDir, Config.APP_FILE_NAME);
    this.pagesConfig = Config.INIT_PAGES_CONFIG;
    this.appConfig = Config.INIT_APP_CONFIG;

    catConfig.info(`Done initiating new instance for configDir: ${configDir}`);
  }

  /**
   * Getter for pages config
   */
  public getAllPages(): PageConfigs {
    return this.pagesConfig;
  }

  /**
   * Getter for app config
   */
  public getApp(): AppConfig {
    return this.appConfig;
  }

  /**
   * Getter for outputs config
   */
  public getOutputs(): ReportOutputs {
    return this.appConfig.output;
  }

  /**
   * Getter for browser config
   */
  public getBrowser(): BrowserConfig {
    return this.appConfig.browser;
  }

  /**
   * Getter for worker sleep interval config
   */
  public getWorkerSleepInterval(): number {
    return this.appConfig.workerInterval;
  }

  /**
   * Validate if all configuration properties are valid
   * App will fail if this function returns false
   */
  private _validateConfig(): boolean {
    const browserConfig = this.appConfig.browser;
    if (!fileExists(browserConfig.executable)) {
      catConfig.error('Browser executable not found', new Error('Invalid BrowserEXE'));
      return false;
    }

    for (let page of this.pagesConfig) {
      try {
        new URL(page.url);
        if (page.interval <= 0) {
          catConfig.error(`Invalid interval passed for page ${page.name}, please define them in minutes greater equal 1`, new Error('Invalid Interval'));
          return false;
        }
      } catch (_) {
        catConfig.error(`Invalid url found for page: ${page.name}, please check ${page.url}`, new Error('Invalid PageUrl'));
        return false;
      }
    }
    return true;
  }

  /**
   * Read config file into <T> type from disk
   * @param file config file to read
   */
  private _readConfigFile<T>(file: string): T | undefined {
    if (!fileExists(file)) {
      catConfig.error(`Failed to find config file: ${file}`, new Error('Config file not found'));
      return undefined;
    }

    const config = readJson<T>(file);
    if (!config) {
      catConfig.error(`Failed to read configuration file: ${file}`, new Error('Config file read failed'));
      return undefined;
    }

    catConfig.debug(`Config[${file}]: ... hidden due to security}`);
    return config;
  }

  /**
   * Read entire app config
   */
  public readConfig(): boolean {
    const pageRet = this._readConfigFile<PageConfigs>(this.pageFile);
    if (!pageRet) {
      catConfig.error(`Failed to read ${this.pageFile}`, new Error('Config error'));
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