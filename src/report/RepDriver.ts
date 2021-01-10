import { catApp, catRepDriver } from '../util/Logger';
import Config from '../util/Config';
import RepWorker from './RepWorker';
import Queue from '../util/Queue';
import { RepTask } from '../types/queue';
import { PageConfig, ReportOutputs } from '../types/config';

export default class RepDriver {
  private config: Config;
  private tasks: any[];
  private queue: Queue<RepTask>;
  private worker: RepWorker | undefined;

  constructor(cRoot: string) {
    this.config = new Config(cRoot);
    this.tasks = [];
    this.queue = new Queue<RepTask>(50);
    this.worker = undefined;
    catRepDriver.info('Created new RepDriver instance, please init() before use.');
  }

  private _registerSignalHandler(): boolean {
    catRepDriver.info('Start register process signal handler');
    process.on('SIGINT', () => {
      catRepDriver.info('Shutdown App started');
      console.log(this.worker);
    });

    catRepDriver.info('Done register process signal handler');
    return true;
  }

  public init(): boolean {
    catRepDriver.info('Start init RepDriver instance.');
    if (!this.config.readConfig()) {
      return false;
    }

    this.worker = new RepWorker(this.config.getWorkerSleepInterval(), this.config.getBrowser(), this.queue);
    catRepDriver.info('Done init RepDriver instance.');

    
    return this._registerSignalHandler();
  }

  public run() {
    const startDateTime: Date = new Date();
    catRepDriver.info(`Started app at ${startDateTime}`);

    if (this.worker) {
      this.worker.start();
    }
    
    const pages = this.config.getPages();
    const outputs = this.config.getApp().output;
    for (let page of pages) {
      const task = setInterval((queue: Queue<RepTask>, pageConfig: PageConfig, outputs: ReportOutputs) => {
        const task: RepTask = { name: pageConfig.name, url: pageConfig.url, output: outputs };
        queue.enqueue(task);
      }, page.interval, this.queue, page, outputs);
      catRepDriver.info(`New import task created for ${page.url} and interval: ${page.interval}`);
      this.tasks.push(task);
    }
  }
}



