import { catRepWorker } from '../util/Logger';
import moment from 'moment';
import { writeRelativeToApp } from '../util/FileHandler';
import Queue from '../util/Queue';
import { RepTask } from '../types/queue';
import { sleep } from '../util/Utils';
import { BrowserConfig, ReportOutputs } from '../types/config';

// @ts-ignore
const chromeLauncher = require('chrome-launcher');
// @ts-ignore
const lighthouse = require('lighthouse');

export default class RepWorker {
  private queue: Queue<RepTask>;
  private sleepInterval: number;
  private browserConfig: BrowserConfig;

  constructor(sleepInterval: number, browserConfig: BrowserConfig, queue: Queue<RepTask>) {
    this.sleepInterval = sleepInterval;
    this.queue = queue;
    this.browserConfig = this._getBrowserConfig(browserConfig);
    catRepWorker.info(JSON.stringify(browserConfig));
  }

  private _getBrowserConfig(config: BrowserConfig) {
    const res: any = {
      'chromeFlags': []
    };
    res['chromePath'] = config.executable;
    res['userDataDir'] = config.profilePath;
    res['chromeFlags'].push(`--profile-directory=${config.userProfile}`)

    return res;
  }

  // @ts-ignore
  private async _getLigthouseReport(url: string): any {
    console.log(this.browserConfig);
    const chromeBrowser = await chromeLauncher.launch(this.browserConfig);

    const options = { logLevel: 'info', output: ['html', 'json'], port: chromeBrowser.port };
    const runnerResult = await lighthouse(url, options);

    await chromeBrowser.kill();

    return runnerResult;
  }

  private async _storeReport(report: string, name: string, timeStamp: string, outputs: ReportOutputs) {
    for (let output of outputs) {
      catRepWorker.info(`Ouput report to ${JSON.stringify(output)}`);

      switch (output.type) {
        case 'file': {
          const dstDir = output.folder;
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
