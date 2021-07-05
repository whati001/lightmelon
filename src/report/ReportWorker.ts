import moment from "moment";
import { createFolder, writeRelativeToApp } from "../util/FileHandler";
import Queue from "../util/Queue";
import { ReportTask } from "../types/queue";
import { sleep } from "../util/Utils";
import puppeteer from "puppeteer-core";
import { URL } from "url";
import getAuth from "../auth";
import { Auth } from "../types/auth";
import fetch from "node-fetch";
import {
  AppOutputConfig,
  AuthConfig,
  FileOutputConfig,
  HttpOutputConfig,
} from "../types/config";
import { Logger } from "tslog";
import { getLogger } from "../util/Logger";

// @ts-ignore
const lighthouse = require("lighthouse");

export default class ReportWorker {
  private workerId: number;
  private queue: Queue<ReportTask>;
  private sleepInterval: number;
  private browser: puppeteer.Browser | undefined;
  private launchConfig: puppeteer.LaunchOptions;
  private isAlive: boolean;
  private logger: Logger;

  constructor(
    workerId: number,
    sleepInterval: number,
    launchConfig: puppeteer.LaunchOptions,
    queue: Queue<ReportTask>,
  ) {
    this.logger = getLogger(`RepWorker-${workerId}`).unwrap();
    this.logger.info("Start creating new ReportWorker instance");
    this.workerId = workerId;
    this.sleepInterval = sleepInterval;
    this.queue = queue;
    this.browser = undefined;
    this.launchConfig = launchConfig;
    this.isAlive = true;
    this.logger.info("Done creating new ReportWorker instance");
  }

  private async _startBrowser(): Promise<boolean> {
    try {
      this.browser = await puppeteer.launch(this.launchConfig);
      return true;
    } catch (e) {
      this.logger.warn(
        "Failed to start browser instance, skip RepTask report building",
      );
      this.logger.error(e)
      return false;
    }
  }

  private async _closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }

  public async kill() {
    this.queue.clear();
    this.isAlive = false;
    this._closeBrowser();
  }

  private async _storeReport(
    repResult: string,
    subDir: string,
    name: string,
    outputs: AppOutputConfig,
  ) {
    for (let output of outputs) {
      switch (output.type) {
        case "file": {
          try {
            const fileOutput = output as FileOutputConfig;
            this.logger.info(
              `Store report as file with name ${name} to ${fileOutput.folder}`,
            );
            const subDirPath = `${fileOutput.folder}/${subDir}`;
            const filePath = `${subDirPath}/${name}`;
            createFolder(subDirPath);
            writeRelativeToApp(filePath, repResult);
            this.logger.info(
              `Finished to store report as file to ${filePath}`,
            );
          } catch (e) {
            this.logger.error(
              `Failed to store report as file with name ${name}`,
              null,
            );
            this.logger.error(e, null);
          }
          break;
        }
        case "http": {
          const httpOutput = output as HttpOutputConfig;
          const endpointUrl = httpOutput.url.replace(
            "{filename}",
            `${subDir}/${name}`,
          );
          this.logger.info(
            `Store report via http with name ${name} to ${endpointUrl}`,
          );
          fetch(endpointUrl, {
            method: httpOutput.method,
            body: repResult,
          }).then((res) =>
            this.logger.info(
              `Finished to store report via http with name ${name} to ${endpointUrl}`,
            )
          ).catch((err) =>
            this.logger.warn(
              `Failed to store report via http with name ${name} to ${endpointUrl}`,
            )
          );
          break;
        }
        default: {
          this.logger.warn(
            `Unsupported output type ${output.type} used, please check documentation`,
          );
          break;
        }
      }
    }
  }

  // @ts-ignore
  private async _getLigthouseReport(url: string): any {
    if (this.browser) {
      const lighthouseConfig = {
        logLevel: "error",
        output: ["html", "json"],
        port: (new URL(this.browser.wsEndpoint())).port,
      };
      const runnerResult = await lighthouse(url, lighthouseConfig);
      await this.browser.close();
      this.browser = undefined;

      return runnerResult;
    } else {
      this.logger.warn(
        "No active browser instance found, skip current report creation",
      );
      return undefined;
    }
  }

  public async _doAuthentication(authconfig: AuthConfig): Promise<boolean> {
    this.logger.info(
      `Page needs some authentication, start login with implementation ${authconfig.impl}`,
    );

    if (!this.browser) {
      this.logger.warn(
        "Failed to find active browser session, seems like it crashsed, skip task",
      );
      return false;
    }

    const auth: Auth = getAuth(authconfig.impl);
    if (await auth.isLoggedIn(this.browser)) {
      this.logger.info(
        "User is still logged in, skip authentication process",
      );
      return true;
    }

    this.logger.info(
      "No active user session found, start new login process",
    );
    if (await auth.login(this.browser, authconfig)) {
      this.logger.info("User logged in, authentication was successfully");
      return true;
    }

    this.logger.warn(
      "Failed to authenticate user against page, skip RepTask report building",
    );
    return false;
  }

  public async createReport(task: ReportTask): Promise<boolean> {
    this.logger.info(
      `Start new report creation for url ${task.page.url} on worker: ${this.workerId}`,
    );

    const retStartBrowser = await this._startBrowser();
    if (!retStartBrowser) {
      return false;
    }

    if (task.auth) {
      const retDoAuth = await this._doAuthentication(task.auth);
      if (!retDoAuth) {
        await this._closeBrowser();
        return false;
      }
    }

    try {
      const repResult = await this._getLigthouseReport(task.page.url);
      if (!repResult) {
        this.logger.warn("Failed to create report, skip storing results");
      }
      this.logger.info(
        `Created report for url ${task.page.url} successfully`,
      );

      this.logger.info("Start storing reports");
      const timeStamp: string = moment().format("YYYYMMDD-HHmmss");

      const resHtmlSubDir = `html/${task.page.name}`;
      const resHtmlName = `resHtml_${task.page.name}_${timeStamp}.html`;
      await this._storeReport(
        repResult.report[0],
        resHtmlSubDir,
        resHtmlName,
        task.outputs,
      );

      const resJsonSubDir = `json/${task.page.name}`;
      const resJsonName = `resJson_${task.page.name}_${timeStamp}.json`;
      await this._storeReport(
        repResult.report[1],
        resJsonSubDir,
        resJsonName,
        task.outputs,
      );

      this.logger.info("Finished storing report");

      return true;
    } catch (e) {
      this.logger.warn("Failed to create report, keep trying...");
      this.logger.error(e);

      return false;
    }
  }

  public async start() {
    while (this.isAlive) {
      if (this.queue.size() == 0) {
        await sleep(this.sleepInterval);
      } else {
        const task = this.queue.dequeue();
        if (task) {
          await this.createReport(task);
        }
      }
    }
  }
}
