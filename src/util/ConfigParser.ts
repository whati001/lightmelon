import {
  AppConfig,
  AppOutputConfig,
  BrowserConfig,
  LighthouseConfig,
  WorkerConfig,
} from "../types/config";
import * as yamlJs from "js-yaml";
import { fileExists, readFile, resolveFullPath } from "./FileHandler";
import { catConfig } from "./Logger";

const DEF_CONFIG: LighthouseConfig = {
  app: {
    browser: { executable: "/usr/bin/chromium", headless: true },
    worker: { instances: 1, sleepInterval: 1000 },
    output: [],
  },
  auth: [],
  pages: [{
    name: "google",
    url: "https://google.com",
    interval: 1,
    auth: "none",
  }],
};

/**
 * Trace error to output stream, should include some information for the user to fix the configuration file
 * @param text prefix of error message
 */
const logError = (text: string) => {
  catConfig.error(`${text}, please checkout documentation`, null);
};

const parseValueType = <T>(value: any, type: string): T | undefined | null => {
  if (value == undefined || value == null) {
    return null;
  }
  if (!(typeof value === type)) {
    return undefined;
  }
  return value as T;
};

const parseBoolean = (value: any): boolean | undefined | null => {
  return parseValueType<boolean>(value, "boolean");
};

const parseBooleanWithDefault = (
  value: any,
  def: boolean,
): boolean | undefined => {
  const parsedValue = parseValueType<boolean>(value, "boolean");
  return (parsedValue === null) ? def : parsedValue;
};

const parseNumber = (value: any): number | undefined | null => {
  return parseValueType<number>(value, "number");
};

const parseNumberWithDefault = (
  value: any,
  def: number,
): number | undefined => {
  const parsedValue = parseValueType<number>(value, "number");
  return (parsedValue === null) ? def : parsedValue;
};

const parseString = (value: any): string | undefined | null => {
  return parseValueType<string>(value, "string");
};

const parseStringWithDefault = (
  value: any,
  def: string,
): string | undefined => {
  const parsedValue = parseValueType<string>(value, "string");
  return (parsedValue === null) ? def : parsedValue;
};

/**
 * Parse BrowserConfig and validate all fields, if not defined and not set mantatory, use default value
 * @param config read from config file and to verify
 * @returns 
 */
const parseBroswerConfig = (config: object): BrowserConfig | undefined => {
  if (!config) {
    return undefined;
  }
  const gotConfig = config as BrowserConfig;

  const execPath = parseString(gotConfig.executable);
  if (!execPath) {
    logError("No browser executable defined");
    return undefined;
  }
  const canExecPath = resolveFullPath(execPath);
  if (!fileExists(canExecPath)) {
    logError("Invalid browser executable defined");
    return undefined;
  }

  const headFlag = parseBooleanWithDefault(
    gotConfig.headless,
    DEF_CONFIG.app.browser.headless,
  );
  if (undefined === headFlag) {
    logError("Invalid browser headless flag found");
    return undefined;
  }

  return { executable: canExecPath, headless: headFlag };
};

/**
 * Parse WorkerConfig and validate all fields, if not defined and not set mantatory, use default value
 * @param config read from config file and to verify
 * @returns 
 */
const parseWorkerConfig = (config: object): WorkerConfig | undefined => {
  if (!config) {
    return undefined;
  }
};

const parseOutputConfig = (config: object): AppOutputConfig | undefined => {
  if (!config) {
    return undefined;
  }
};

const parseAppConfig = (config: AppConfig): AppConfig | undefined => {
  if (undefined == config) {
    return undefined;
  }

  const browser = parseBroswerConfig((config as AppConfig).browser);
  if (undefined == browser) {
    catConfig.error(
      "Failed to read browser configuration properly, please checkout documentation",
      new Error("BrowserConfgException"),
    );
    return undefined;
  }
  console.log(browser);

  const worker = parseWorkerConfig((config as AppConfig).worker);
  if (undefined == worker) {
    catConfig.error(
      "Failed to read worker configuration properly, please checkout documentation",
      new Error("WorkerConfgException"),
    );
    return undefined;
  }
  const output = parseOutputConfig((config as AppConfig).worker);
  if (undefined == output) {
    catConfig.error(
      "Failed to read worker configuration properly, please checkout documentation",
      new Error("WorkerConfgException"),
    );
    return undefined;
  }

  return { browser: browser, worker: worker, output: output };
};

export const parserConfig = (
  configPath: string,
): LighthouseConfig | undefined => {
  let parsedConfig = DEF_CONFIG;

  if (!fileExists(configPath)) {
    catConfig.error(
      `Configuration file ${configPath} not found`,
      new Error("ConfigFileNotFound"),
    );
    return undefined;
  }

  const readConfig = yamlJs.load(readFile(configPath));
  if (!readConfig) {
    catConfig.error(
      `Failed to read Configruation file properly, please verify it's a valid yaml file`,
      new Error("ConfigParseError"),
    );
    return undefined;
  }

  const authConfig = parseAppConfig((readConfig as LighthouseConfig).app);
  console.log(authConfig);

  return parsedConfig;
};
