import { catRepWorker } from '../util/Logger'
import moment from 'moment';
import { writeRelativeFile } from "../util/FileHandler";
import Queue from "../util/Queue";
import { RepTask } from "../types/queue";
import { sleep } from "../util/Utils";
import { ReportOutputs } from '../types/config';

// @ts-ignore
const chromeLauncher = require('chrome-launcher');
// @ts-ignore
const lighthouse = require('lighthouse');

export default class RepWorker {
  private queue: Queue<RepTask>;
  private sleepInterval: number;

  constructor(sleepInterval: number, queue: Queue<RepTask>) {
    this.sleepInterval = sleepInterval;
    this.queue = queue;
  }

  // @ts-ignore
  private async _getLigthouseReport(url: string): string {
    const chromeBrowser = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

    const options = { logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chromeBrowser.port };
    const runnerResult = await lighthouse(url, options);

    const report = runnerResult.report;
    await chromeBrowser.kill();

    return report;
  }

  private async _storeReport(report: string, name: string, timeStamp: string, outputs: ReportOutputs) {
    console.log(outputs);
    for (let output of outputs) {
      catRepWorker.info(`Ouput report to ${JSON.stringify(output)}`);
      console.log(output);
      switch (output.type) {
        case 'file': {
          const dstDir = output.folder;
          // const resJson: string = `resJson_${url}_${timeStamp}.json`;
          const resHtml: string = `resHtml_${name}_${timeStamp}.html`;
          writeRelativeFile(`./../${dstDir}/${resHtml}`, report);
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

    console.log(task);
    const report = await this._getLigthouseReport(task.url);
    await this._storeReport(report, task.name, timeStamp, task.output);

    catRepWorker.info(`Finished creating report for url: ${task.url}s`);
    return true;
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