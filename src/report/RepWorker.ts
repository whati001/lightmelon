import { OutConfig, PageConfig } from "../types/config";
import { catRepWorker } from '../util/Logger'
import deepcopy from "ts-deepcopy";
import { resolve } from "path";

const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

export default class RepWorker {
  private pageConfig: PageConfig;
  private outConfig: OutConfig;

  constructor(pageConfig: PageConfig, outConfig: OutConfig) {
    this.pageConfig = deepcopy(pageConfig);
    this.outConfig = deepcopy(outConfig);
  }

  public createReport(): boolean {
    catRepWorker.info(`Start creating new report for url ${this.pageConfig.url}`);
    const resJson: string = '';
    const resHtml: string = '';
    catRepWorker.info(`Finished creating report for url: ${this.pageConfig.url} -> Result[json: ${resJson}, html: ${resHtml}]`);
    return true;
  }

  private _sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

  public async start() {
    while (true) {
      this.createReport();
      await this._sleep(this.pageConfig.interval);
    }
  }
}