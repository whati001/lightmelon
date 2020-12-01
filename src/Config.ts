import { catConfig } from './Logger';
import fs from 'fs';
import path from 'path';

interface PageBasicAuth {
  user: string,
  pwd: string
}
type PageAuth = PageBasicAuth;

interface PageConfig {
  url: string,
  interval: number,
  auth?: PageAuth
}

type PagesConfig = PageConfig[];

export default class Config {
  private readonly PAGE_FILE_NAME: string = 'pages.json';
  private readonly OUT_FILE_NAME: string = 'output.json';

  private rootDir: string;
  private pageFile: string;
  private outFile: string;

  constructor(root: string = './config/') {
    catConfig.info(`Initiate new instance for configRoot: ${root}`);

    this.rootDir = root;
    this.pageFile = path.join(this.rootDir, this.PAGE_FILE_NAME);
    this.outFile = path.join(this.rootDir, this.OUT_FILE_NAME);

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
    catConfig.info('Start reading config')
    if (!this._configFileExists()) {
      return false;
    }

    return true;
  }
}