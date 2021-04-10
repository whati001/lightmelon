import ReportWorker from "./ReportWorker";
import Queue from "../util/Queue";
import { ReportTask } from "../types/queue";
import { catReportDriver, catReportWorker } from "../util/Logger";
import { getMsFromMinute } from "../util/Utils";
import {
  AppOutputConfig,
  BrowserConfig,
  LighthouseConfig,
  PageConfig,
} from "../types/config";
import { LaunchOptions } from "puppeteer-core";

/**
 * ReportDriver class
 * Holds entire configuration and worker information
 */
export default class ReportDriver {
  private config: LighthouseConfig;
  private jobs: number[];
  private queue: Queue<ReportTask>;
  private workers: ReportWorker[];

  /**
   * ReportDriver ctor
   * @param configPath configuration directory path relative to app home
   */
  constructor(config: LighthouseConfig) {
    this.config = config;
    this.jobs = [];
    this.queue = new Queue<ReportTask>(50);
    this.workers = [];
    catReportDriver.info(
      "Created new Report Driver instance, please call init() before run() method",
    );
  }

  /**
   * Register all needed signal handlers
   */
  private _registerSignalHandler() {
    catReportDriver.info("Start register process signal handler");
    process.on("SIGINT", () => {
      catReportDriver.info("Shutdown App started");

      catReportDriver.info("Start clearning all running intervals");
      for (let task of this.jobs) {
        catReportDriver.info(`Clear interval: ${task}`);
        clearInterval(task);
      }
      this.jobs = [];
      catReportDriver.info("Done clearning all running intervals");

      catReportDriver.info("Stop RepWorkers");
      for (const worker of this.workers) {
        if (worker) {
          worker.kill().then((res) => {
            catReportWorker.info("Stopped ReportWorker");
          });
        }
      }
      catReportDriver.info(
        "App will shutdown soon, please wait until all workers have stopped",
      );
    });

    catReportDriver.info("Done register process signal handler");
    return true;
  }

  /**
   * Create and return browser configuration
   */
  private _parseBroserConfig(bConfig: BrowserConfig): LaunchOptions {
    const options: LaunchOptions = {
      headless: bConfig.headless,
      executablePath: bConfig.executable,
    };

    return options;
  }

  /**
   * Init ReportDriver class instance
   */
  public init(): boolean {
    catReportDriver.info("Start init ReportDriver instance.");
    this._registerSignalHandler();

    const launchConfig = this._parseBroserConfig(this.config.app.browser);

    for (let idx = 0; idx < this.config.app.worker.instances; idx++) {
      const worker = new ReportWorker(
        idx,
        this.config.app.worker.sleepInterval,
        launchConfig,
        this.queue,
      );
      catReportDriver.info(`Started new ReportWorker with id: ${idx}`);
      this.workers.push(worker);
    }
    catReportDriver.info("Done init ReportDriver instance.");

    return true;
  }

  /**
   * Start all workers
   */
  private _startWorkers() {
    for (const worker of this.workers) {
      worker.start();
    }
  }

  private _getAuth(name: string) {
    const auth = this.config.auth.filter((x) => x.name === name);
    return (auth.length === 1) ? auth[0] : undefined;
  }

  /**
   * Register new jobs realized via js timout function
   */
  private _registerJobs() {
    for (let page of this.config.pages) {
      const interval = getMsFromMinute(page.interval);

      const pageTask: ReportTask = {
        page: page,
        outputs: this.config.app.output,
        auth: this._getAuth(page.auth),
      };

      const taskInterval = setInterval(
        (queue: Queue<ReportTask>, task: ReportTask) => {
          queue.enqueue(task);
        },
        interval,
        this.queue,
        pageTask,
      );

      catReportDriver.info(
        `New import task created for ${page.url} and interval: ${page.interval}`,
      );
      this.jobs.push(taskInterval);
    }
  }

  /**
   * Run ReportDriver instance
   */
  public run() {
    const startDateTime: Date = new Date();
    catReportDriver.info(
      `Started ReportDriver to import tasks at ${startDateTime}`,
    );

    if (0 === this.workers.length) {
      catReportDriver.warn(
        "ReportDriver is not initiated, please call init() before run()",
      );
      return false;
    }

    this._startWorkers();
    this._registerJobs();
    return true;
  }
}
