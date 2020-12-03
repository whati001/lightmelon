import { catRepDriver } from '../util/Logger';
import Config from '../util/Config';
import RepWorker from './RepWorker';
import Queue from '../util/Queue';
import { RepTask } from '../types/queue';
import { PageConfig, ReportOutputs } from '../types/config';

export default class RepDriver {
  private config: Config;
  private tasks: any[];
  private queue: Queue<RepTask>;
  private worker: RepWorker;

  constructor(cRoot: string) {
    this.config = new Config(cRoot);
    this.tasks = [];
    this.queue = new Queue<RepTask>(50);
    this.worker = new RepWorker(this.config.getWorkerSleepInterval(), this.config.getBrowser(), this.queue);

    catRepDriver.info('Created new RepDriver instance, please init() before use.');
  }

  public init(): boolean {
    catRepDriver.info('Start init RepDriver instance.');
    if (!this.config.readConfig()) {
      return false;
    }

    catRepDriver.info('Done init RepDriver instance.');
    return true;
  }

  public run() {
    const startDateTime: Date = new Date();
    catRepDriver.info(`Started app at ${startDateTime}`);
    this.worker.start();

    const pages = this.config.getPages();
    const outputs = this.config.getApp().output;
    for (let page of pages) {
      const task = setInterval((queue: Queue<RepTask>, pageConfig: PageConfig, outputs: ReportOutputs) => {
        const task: RepTask = { name: pageConfig.name, url: pageConfig.url, output: outputs }
        queue.enqueue(task);
      }, page.interval, this.queue, page, outputs);
      catRepDriver.info(`New import task created for ${page.url} and interval: ${page.interval}`);
      this.tasks.push(task);
    }
  }
}



