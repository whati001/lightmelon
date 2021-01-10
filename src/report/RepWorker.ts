import { catRepWorker } from '../util/Logger';
import moment from 'moment';
import { createFolder, writeRelativeToApp } from '../util/FileHandler';
import Queue from '../util/Queue';
import { RepTask } from '../types/queue';
import { sleep } from '../util/Utils';
import { BrowserConfig, ReportOutputs } from '../types/config';
import puppeteer from 'puppeteer-core';
import { URL } from 'url';

// @ts-ignore
const lighthouse = require('lighthouse');

export default class RepWorker {
  private queue: Queue<RepTask>;
  private sleepInterval: number;
  private browser: any;
  private browserExec: BrowserConfig;

  constructor(sleepInterval: number, browserExec: BrowserConfig, queue: Queue<RepTask>) {
    this.sleepInterval = sleepInterval;
    this.queue = queue;
    this.browserExec = browserExec;
  }

  // @ts-ignore
  private async _getLigthouseReport(url: string): any {
    this.browser = await puppeteer.launch({
      executablePath: this.browserExec,
      slowMo: 500,
      headless: false,
      defaultViewport: null
    });

    // this.browser.on('targetchanged', async target => {
    //   const page = await target.page();
    //   if (page && page.url() === url) {
    //     await page.addStyleTag({content: '* {color: red}'});
    //   }
    // });

    const options = { logLevel: 'info', output: ['html', 'json'], port: (new URL(this.browser.wsEndpoint())).port };
    const runnerResult = await lighthouse(url, options);
    await this.browser.close();
    this.browser = undefined;

    return runnerResult;
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

  public async createReport(task: RepTask): Promise<boolean> {
    const timeStamp: string = moment().format('YYYYMMDD-hmmss');
    catRepWorker.info(`Start creating new report for url ${task.url} at ${timeStamp}`);

    const repResult = await this._getLigthouseReport(task.url);
    const resHtml: string = `resHtml_${task.name}_${timeStamp}.html`;
    await this._storeReport(repResult.report[0], resHtml, timeStamp, task.output);
    const resJson: string = `resJson_${task.name}_${timeStamp}.json`;
    await this._storeReport(repResult.report[1], resJson, timeStamp, task.output);

    catRepWorker.info(`Finished creating report for url: ${task.url}s`);
    return true;
  }

  public async kill() {
    this.queue.clear();
    if (this.browser) {
      await this.browser.close();
    }
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
