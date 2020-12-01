import { catRepDriver } from '../util/Logger';
import Config from '../util/Config';
import RepWorker from './RepWorker';
import Queue from '../util/Queue';
import { RepTask } from '../types/queue';

export default class RepDriver {
  private config: Config;
  private tasks: any[];
  private queue: Queue<RepTask>;

  constructor(cRoot: string) {
    this.config = new Config(cRoot);
    this.tasks = [];
    this.queue = new Queue<RepTask>(50);

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
    const pages = this.config.getPages();

    for (let page of pages) {
      const task = setInterval((queue, pageConfig, outConfig) => {
        const task: RepTask = { url: pageConfig.url, dstDir: outConfig.folder }
        queue.enqueue(task);
      }, page.interval, this.queue, page, this.config.getOut());
      catRepDriver.info(`New import task created for ${page.url} and interval: ${page.interval}`);
      this.tasks.push(task);
    }
  }
}



