import { catRepDriver } from '../util/Logger';
import Config from '../util/Config';
import RepWorker from './RepWorker';

export default class RepDriver {
  private config: Config;
  private worker: RepWorker[];

  constructor(cRoot: string) {
    this.config = new Config(cRoot);
    this.worker = [];

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
      catRepDriver.info(`Start new workder for page: ${page.url} with interval: ${page.interval}`);
      const pageWorker = new RepWorker(page, this.config.getOut());
      this.worker.push(pageWorker);
      pageWorker.start();
    }
  }
}



