import { catRepMe } from './Logger';
import Config from './Config';

export default class ReportMe {
  private config: Config;

  constructor(cRoot: string) {
    this.config = new Config(cRoot);
    catRepMe.info('Created new ReportMe instance, please init() before use.');
  }

  public init(): boolean {
    catRepMe.info('Start init ReportMe instance.');
    if (!this.config.readConfig()) {
      return false;
    }
    
    catRepMe.info('Done init ReportMe instance.');
    return true;
  }

  public run() {
    const startDateTime: Date = new Date();
    catRepMe.info(`Started app at ${startDateTime}`);
  }
}



