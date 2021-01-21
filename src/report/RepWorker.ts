import { catRepWorker } from '../util/Logger';
import moment from 'moment';
import { createFolder, writeRelativeToApp } from '../util/FileHandler';
import Queue from '../util/Queue';
import { ReportTask } from '../types/queue';
import { sleep } from '../util/Utils';
import puppeteer from 'puppeteer-core';
import { URL } from 'url';
import { BrowserConfig, ReportOutputs, ReportOutput } from '../types/appConfig';
import getAuth from './../auth';
import { Auth } from '../types/auth';

// @ts-ignore
const lighthouse = require('lighthouse');

export default class RepWorker {
  private queue: Queue<ReportTask>;
  private sleepInterval: number;
  private browserInstance: puppeteer.Browser | undefined;
  private browserConfig: BrowserConfig;

  constructor(sleepInterval: number, browserConfig: BrowserConfig, queue: Queue<ReportTask>) {
    this.sleepInterval = sleepInterval;
    this.queue = queue;
    this.browserInstance = undefined;
    this.browserConfig = browserConfig;
  }

  // @ts-ignore
  private async _getLigthouseReport(url: string): any {

    // TODO: validate page is loaded properly -> if not use puppeteer to do so
    // this.browser.on('targetchanged', async target => {
    //   const page = await target.page();
    //   if (page && page.url() === url) {
    //     await page.addStyleTag({content: '* {color: red}'});
    //   }
    // });

    if (this.browserInstance) {
      const options = { logLevel: 'info', output: ['html', 'json'], port: (new URL(this.browserInstance.wsEndpoint())).port };
      const runnerResult = await lighthouse(url, options);
      await this.browserInstance.close();
      this.browserInstance = undefined;

      return runnerResult;
    } else {
      catRepWorker.warn('No active browser instance found, skip current report creation');
      return undefined;
    }
  }

  private async _storeReport(report: string, name: string, timeStamp: string, outputs: ReportOutputs) {
    for (let output of outputs) {
      catRepWorker.info(`Ouput report to ${JSON.stringify(output)}`);

      switch (output.type) {
        case 'file': {
          const dstDir = output.folder;
          createFolder(dstDir);
          writeRelativeToApp(`${dstDir}/${name}`, report);
          break;
        }
        default:
          break;
      }
    }
  }

  private _getBrowserConfig(): puppeteer.LaunchOptions {
    const options: puppeteer.LaunchOptions = {
      headless: this.browserConfig.headless,
      executablePath: this.browserConfig.executable
    };

    return options;
  }

  private async _startBrowser(): Promise<boolean> {
    try {
      this.browserInstance = await puppeteer.launch(this._getBrowserConfig());
      return true;
    } catch (e) {
      catRepWorker.error(`Failed to start browser instance, skip RepTask report building`, new Error('Browser not started properly'));
      return false;
    }
  }

  private async _closeBrowser() {
    if (this.browserInstance) {
      await this.browserInstance.close();
    }
  }

  public async _doAuthentication(authname: string): Promise<boolean> {
    catRepWorker.info(`Page needs some authentication, start authentication for ${authname}`);
    if (this.browserInstance) {
      const auth: Auth = getAuth(authname);
      if (await auth.isLoggedIn(this.browserInstance)) {
        catRepWorker.info(`User is still logged in, skip authentication process`);
        return true;
      }
      catRepWorker.info('No active user session found, start new login process');
      if (await auth.login(this.browserInstance, this.browserConfig.auth)) {
        catRepWorker.info(`User logged in, authentication was successfully`);
        return true;
      }
      catRepWorker.error(`Failed to authenticate user against page, skip RepTask report building`, new Error('Failed to authenticate user against page'));
      return false;
    }
    catRepWorker.error(`Browser instance crashed somehow before authentication took place`, new Error('Browser closed unexpected'));
    return false;
  }

  public async createReport(task: ReportTask): Promise<boolean> {
    const timeStamp: string = moment().format('YYYYMMDD-hmmss');
    catRepWorker.info(`Start creating new report for url ${task.url} at ${timeStamp}`);

    await this._startBrowser();

    if (task.auth) {
      if (!await this._doAuthentication(task.auth)) {
        await this._closeBrowser();
        return false;
      }
    }

    try {
      const repResult = await this._getLigthouseReport(task.url);
      if (!repResult) {
        catRepWorker.warn('Skip result storing, something went wrong with report creation');
      }
      const resHtml: string = `resHtml_${task.name}_${timeStamp}.html`;
      await this._storeReport(repResult.report[0], resHtml, timeStamp, task.outputs);
      const resJson: string = `resJson_${task.name}_${timeStamp}.json`;
      await this._storeReport(repResult.report[1], resJson, timeStamp, task.outputs);

      catRepWorker.info(`Finished creating report for url: ${task.url}s`);
      return true;
    } catch (e) {
      catRepWorker.warn('Failed to create report, keep trying...');
      return false;
    }
  }

  public async kill() {
    this.queue.clear();
    this._closeBrowser();
  }

  public async start() {
    while (true) {
      if (this.queue.size() == 0) {
        await sleep(this.sleepInterval);
      } else {
        const task = this.queue.dequeue();
        if (task) {
          await this.createReport(task);
        }
      }
    }
  }
}
