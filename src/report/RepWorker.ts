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
  private async _getLigthouseReport(url: string): any {
    const chromeBrowser = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

    const options = { logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chromeBrowser.port };
    const runnerResult = await lighthouse(url, options);

    await chromeBrowser.kill();

    return runnerResult;
  }

  private async _storeReport(report: string, name: string, timeStamp: string, outputs: ReportOutputs) {
    console.log(outputs);
    for (let output of outputs) {
      catRepWorker.info(`Ouput report to ${JSON.stringify(output)}`);

      switch (output.type) {
        case 'file': {
          const dstDir = output.folder;
          writeRelativeFile(`./../${dstDir}/${name}`, report);
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
    await this._storeReport(repResult.report, resHtml, timeStamp, task.output);
    const resJson: string = `resJson_${task.name}_${timeStamp}.json`;
    await this._storeReport(JSON.stringify(repResult.lhr), resJson, timeStamp, task.output);

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