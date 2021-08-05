import ReportWorker from "./ReportWorker";
import Queue from "../util/Queue";
import { ReportTask } from "../types/queue";
import { getMsFromMinute } from "../util/Utils";
import { LighthouseConfig } from "../types/config";
import { LaunchOptions } from "puppeteer-core";
import { getLogger } from "../util/Logger";
import { Logger } from "tslog";
import { Err, Ok, Result } from "ts-results";

export default class ReportDriver {
  private config: LighthouseConfig;
  private jobs: number[];
  private queue: Queue<ReportTask>;
  private workers: ReportWorker[];
  private logger: Logger;

  constructor(config: LighthouseConfig) {
    this.logger = getLogger("ReportDriver").unwrap();
    this.logger.info(
      "Start creating new ReportDriver instance from given configuration",
    );
    this.config = config;
    this.jobs = [];
    this.queue = new Queue<ReportTask>(50);
    this.workers = [];

    this.logger.info(
      "Created new ReportDriver instance properly",
    );
  }

  private _parseBrowserConfig(): LaunchOptions {
    const options: LaunchOptions = {
      headless: this.config.app.browser.headless,
      executablePath: this.config.app.browser.executable,
      defaultViewport: {
        width: 1350,
        height: 940,
      },
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--window-size=1350,940",
      ],
    };

    return options;
  }

  private _startWorkers() {
    for (const worker of this.workers) {
      worker.start();
    }
  }

  private _getAuth(name: string) {
    const auth = this.config.auth.filter((x) => x.name === name);
    return (auth.length === 1) ? auth[0] : undefined;
  }

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

      this.logger.info(
        `New import task created for ${page.url} and interval: ${page.interval} minute`,
      );
      this.jobs.push(taskInterval);
    }
  }

  public init(): Result<boolean, string> {
    this.logger.info(
      "Start initiating ReportDriver instance for given configuration",
    );

    const launchConfig = this._parseBrowserConfig();

    if (0 === this.config.app.worker.instances) {
      return new Err("WorkerCount is set to 0, please use at least 1 worker");
    }

    for (let idx = 0; idx < this.config.app.worker.instances; idx++) {
      const worker = new ReportWorker(
        idx,
        this.config.app.worker.sleepInterval,
        launchConfig,
        this.queue,
      );
      this.logger.info(`Started new ReportWorker with id: ${idx}`);
      this.workers.push(worker);
    }
    this.logger.info(
      "Done initiating ReportDriver instance for given configuration",
    );

    return new Ok(true);
  }

  public kill(): void {
    this.logger.info(
      "ReportDriver received kill request, start shutdown gracefully",
    );

    this.logger.info("Start stopping all import tasks");
    for (let task of this.jobs) {
      this.logger.info(`Stopped import task with id: ${task}`);
      clearInterval(task);
    }
    this.jobs = [];
    this.logger.info("Stopped all importer tasks properly");

    this.logger.info("Start signal kill to all ReportWorkers");
    for (const worker of this.workers) {
      if (worker) {
        worker.kill();
      }
    }
    this.logger.info("Finished signal kill to all ReportWorkers");

    this.logger.info(
      "ReportDriver will shutdown soon, please wait until all workers have stopped",
    );
  }

  public run(): Result<boolean, string> {
    const startDateTime: Date = new Date();
    this.logger.info(
      `Started ReportDriver to import tasks at ${startDateTime}`,
    );

    if (0 === this.workers.length) {
      this.logger.warn(
        "ReportDriver is not initiated, please call init() before run()",
      );
      return Err("ReportDriver is not initialize properly");
    }

    this._startWorkers();
    this._registerJobs();
    return new Ok(true);
  }
}
