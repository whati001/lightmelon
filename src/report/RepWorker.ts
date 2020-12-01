import { OutConfig, PageAuth, PageConfig } from "../types/config";
import { catRepWorker } from '../util/Logger'
import moment from 'moment';
import { writeFile } from "../util/FileHandler";

// @ts-ignore
const chromeLauncher = require('chrome-launcher');
// @ts-ignore
const lighthouse = require('lighthouse');
// import { writeFile } from "../util/FileHandler";

export default class RepWorker {
  private url: string;
  private interval: number;
  private auth: PageAuth;

  private resDir: string;
  private isRunning: boolean;

  constructor(pageConfig: PageConfig, outConfig: OutConfig) {
    this.url = pageConfig.url;
    this.interval = pageConfig.interval;
    this.auth = { user: 'anoymous', pwd: 'anoymous' };
    this.resDir = outConfig.folder;

    this.isRunning = false;
  }

  // @ts-ignore
  private async _getLigthouseReport(): string {
    const chromeBrowser = await chromeLauncher.launch({ chromeFlags: [] });

    const options = { logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chromeBrowser.port };
    const runnerResult = await lighthouse(this.url, options);

    const report = runnerResult.report;
    await chromeBrowser.kill();

    return report;
  }

  public async createReport(): Promise<boolean> {
    if (this.isRunning) {
      catRepWorker.warn(`Still a old report geneartion is running, please set interval for page ${this.url} heigher`);
      return false;
    }
    this.isRunning = true;
    const timeStamp: string = moment().format('YYYYMMDD-hmmss');
    catRepWorker.info(`Start creating new report for url ${this.url} at ${timeStamp}`);

    const resJson: string = `resJson_${this.url}_${timeStamp}.json`;
    const resHtml: string = `resHtml_${timeStamp}.html`;

    const report = await this._getLigthouseReport();
    console.log(report);

    catRepWorker.info(`Finished creating report for url: ${this.url} -> Result[json: ${resJson}, html: ${resHtml}]`);
    this.isRunning = false;
    return true;
  }


  public async start() {
    while (true) {
      await this.createReport();
      await this._sleep(this.interval);
    }
  }
}