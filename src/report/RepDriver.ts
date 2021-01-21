import Config from '../util/Config';
import RepWorker from './RepWorker';
import Queue from '../util/Queue';
import { ReportTask } from '../types/queue';
import { PageConfig } from '../types/pageConfig';
import { catRepDriver } from '../util/Logger';
import { ReportOutputs } from '../types/appConfig';

export default class RepDriver {
  private config: Config;
  private tasks: number[];
  private queue: Queue<ReportTask>;
  private worker: RepWorker | undefined;

  constructor(configPath: string) {
    this.config = new Config(configPath);
    this.tasks = [];
    this.queue = new Queue<ReportTask>(50);
    this.worker = undefined;
    catRepDriver.info('Created new RepDriver instance, please init() before use.');
  }

  private _registerSignalHandler() {
    catRepDriver.info('Start register process signal handler');
    process.on('SIGINT', () => {
      catRepDriver.info('Shutdown App started');

      catRepDriver.info('Start clearning all running intervals');
      for (let task of this.tasks) {
        catRepDriver.info(`Clear interval: ${task}`);
        clearInterval(task);
      }
      this.tasks = [];
      catRepDriver.info('Done clearning all running intervals');

      catRepDriver.info('Stop RepWorker');
      if (this.worker) {
        this.worker.kill().then(res => {
          console.log('Killed RepWorker');
          catRepDriver.info('Shutdown App done');
          process.exit(0);
        });
      } else {
        catRepDriver.info('Shutdown App done');
        process.exit(0);
      }
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
    } else {
      catRepDriver.warn('Please init RepDriver before executing run()');
      return false;
    }

    const pages = this.config.getAllPages();
    const outputs = this.config.getOutputs();
    for (let page of pages) {
      const taskInterval = setInterval((queue: Queue<ReportTask>, pageConfig: PageConfig, outputs: ReportOutputs) => {
        const task: ReportTask = { name: pageConfig.name, url: pageConfig.url, auth: pageConfig.auth, outputs: outputs };
        queue.enqueue(task);
      }, page.interval * 60 * 1000, this.queue, page, outputs);
      catRepDriver.info(`New import task created for ${page.url} and interval: ${page.interval}`);
      this.tasks.push(taskInterval);
    }
    return true;
  }
}



