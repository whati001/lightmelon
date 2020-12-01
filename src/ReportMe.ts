import { catRepMe } from './Logger';
import Config from './Config';

export default class ReportMe {
  private config: Config;

  constructor(cRoot: string) {
    catRepMe.info('Initate new ReportMe instance');
    this.config = new Config(cRoot);
    this.config.readConfig();

    catRepMe.info('Initate new ReportMe instance done');
  }

  public run() {
    const startDateTime: Date = new Date();
    catRepMe.info(`Started app at ${startDateTime}`);
  }
}



