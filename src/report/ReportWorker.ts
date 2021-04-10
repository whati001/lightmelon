import { catReportWorker } from "../util/Logger";
import moment from "moment";
import { createFolder, writeRelativeToApp } from "../util/FileHandler";
import Queue from "../util/Queue";
import { ReportTask } from "../types/queue";
import { sleep } from "../util/Utils";
import puppeteer from "puppeteer-core";
import { URL } from "url";
import getAuth from "../auth";
import { Auth } from "../types/auth";
import {
  AppOutputConfig,
  BrowserConfig,
  PageAuthConfig,
} from "../types/config";

// @ts-ignore
const lighthouse = require("lighthouse");

/**
 * ReportWorker class
 * Fetches task from queue and creates a report for each enqued task
 */
export default class ReportWorker {
  private workerId: number;
  private queue: Queue<ReportTask>;
  private sleepInterval: number;
  private browser: puppeteer.Browser | undefined;
  private launchConfig: puppeteer.LaunchOptions;

  /**
   * ReportWorker ctor
   * @param sleepInterval interval in ms if no task is equeued
   * @param browserConfig browser config to use for creating report
   * @param queue queue to fetch tasks from
   */
  constructor(
    workerId: number,
    sleepInterval: number,
    launchConfig: puppeteer.LaunchOptions,
    queue: Queue<ReportTask>,
  ) {
    this.workerId = workerId;
    this.sleepInterval = sleepInterval;
    this.queue = queue;
    this.browser = undefined;
    this.launchConfig = launchConfig;
  }

  /**
   * Start new Browser instance
   */
  private async _startBrowser(): Promise<boolean> {
    try {
      this.browser = await puppeteer.launch(this.launchConfig);
      return true;
    } catch (e) {
      catReportWorker.warn(
        "Failed to start browser instance, skip RepTask report building",
      );
      console.debug(e);
      return false;
    }
  }

  /**
   * Close browser instance
   */
  private async _closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }

  /**
  * Kill ReportWorker instance
  */
  public async kill() {
    this.queue.clear();
    this._closeBrowser();
  }

  // /**
  //  * Store report result to all passed outputs
  //  * @param repResult report object to store
  //  * @param name name to use for storing the result
  //  * @param outputs outputs to store report to
  //  */
  // private async _storeReport(
  //   repResult: any,
  //   name: string,
  //   outputs: AppOutputConfig,
  // ) {
  //   const timeStamp: string = moment().format("YYYYMMDD-hmmss");

  //   // for (let output of outputs) {
  //   //   catReportWorker.info(`Ouput report to ${JSON.stringify(output)}`);

  //   //   switch (output.type) {
  //   //     case "file": {
  //   //       const dstDir = output.folder;
  //   //       createFolder(dstDir);

  //   //       const htmlFile = `${dstDir}/resHtml_${name}_${timeStamp}.html`;
  //   //       writeRelativeToApp(htmlFile, repResult.report[0]);
  //   //       catReportWorker.info(`Stored HTML report as file to ${htmlFile}`);

  //   //       const jsonFile = `${dstDir}/resJson_${name}_${timeStamp}.json`;
  //   //       writeRelativeToApp(jsonFile, repResult.report[1]);
  //   //       catReportWorker.info(`Stored JSON report as file to ${jsonFile}`);
  //   //       break;
  //   //     }
  //   //     default:
  //   //       break;
  //   //   }
  //   // }
  // }

  // /**
  //  * Create new report with ligthouse framework
  //  * @param url to create report for
  //  */
  // // @ts-ignore
  // private async _getLigthouseReport(url: string): any {
  //   if (this.browser) {
  //     const lighthouseConfig = {
  //       logLevel: "info",
  //       output: ["html", "json"],
  //       port: (new URL(this.browser.wsEndpoint())).port,
  //     };
  //     const runnerResult = await lighthouse(url, lighthouseConfig);
  //     await this.browser.close();
  //     this.browser = undefined;

  //     return runnerResult;
  //   } else {
  //     catReportWorker.warn(
  //       "No active browser instance found, skip current report creation",
  //     );
  //     return undefined;
  //   }
  // }

  // /**
  //  * Authenticate before creating the report
  //  * @param authname authenticate name to use for this report task
  //  */
  // public async _doAuthentication(authname: string): Promise<boolean> {
  //   catReportWorker.info(
  //     `Page needs some authentication, start authentication for ${authname}`,
  //   );

  //   if (!this.browser) {
  //     catReportWorker.warn(
  //       "Failed to find active browser session, seems like it crashsed, skip task",
  //     );
  //     return false;
  //   }

  //   const auth: Auth = getAuth(authname);
  //   if (await auth.isLoggedIn(this.browser)) {
  //     catReportWorker.info(
  //       "User is still logged in, skip authentication process",
  //     );
  //     return true;
  //   }

  //   catReportWorker.info(
  //     "No active user session found, start new login process",
  //   );
  //   if (await auth.login(this.browser, this.authConfig)) {
  //     catReportWorker.info("User logged in, authentication was successfully");
  //     return true;
  //   }

  //   catReportWorker.warn(
  //     "Failed to authenticate user against page, skip RepTask report building",
  //   );
  //   return false;
  // }

  // /**
  //  * Create new Ligthouse report
  //  * @param task task to create report for
  //  */
  // public async createReport(task: ReportTask): Promise<boolean> {
  //   catReportWorker.info(`Start creating new report for url ${task.url}`);

  //   const retStartBrowser = await this._startBrowser();
  //   if (!retStartBrowser) {
  //     return false;
  //   }

  //   if (task.auth) {
  //     const retDoAuth = await this._doAuthentication(task.auth);
  //     if (!retDoAuth) {
  //       await this._closeBrowser();
  //       return false;
  //     }
  //   }

  //   try {
  //     const repResult = await this._getLigthouseReport(task.url);
  //     if (!repResult) {
  //       catReportWorker.warn("Failed to create report, skip storing results");
  //     }

  //     await this._storeReport(repResult, task.name, task.outputs);
  //     catReportWorker.info(`Finished creating report for url: ${task.url}s`);
  //     return true;
  //   } catch (e) {
  //     catReportWorker.warn("Failed to create report, keep trying...");
  //     console.debug(e);
  //     return false;
  //   }
  // }

  /**
   * Start ReportWorker and keep working until kill receives
   */
  public async start() {
    while (true) {
      if (this.queue.size() == 0) {
        await sleep(this.sleepInterval);
      } else {
        const task = this.queue.dequeue();
        if (task) {
          catReportWorker.info(`Process some task on Worker ${this.workerId}`);
          // await this.createReport(task);
        }
      }
    }
  }
}
