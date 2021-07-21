import {
  AppConfig,
  AppOutputConfig,
  BrowserConfig,
  FileOutputConfig,
  HttpOutputConfig,
  LighthouseConfig,
  PageAuthConfig,
  PagesConfig,
  WinAdAuthConfig,
  WorkerConfig,
} from "../types/config";
import * as yamlJs from "js-yaml";
import { fileExists, readFile, resolveFullPath } from "./FileHandler";
import { Err, Ok, Result } from "ts-results";
import { getLogger } from "./Logger";

/**
 * Default values for the configuration
 */
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

const LOGGER = getLogger("Config").unwrap();

/**
 * Trace error to output stream, should include some information for the user to fix the configuration file
 * @param text prefix of error message
 */
const logError = (text: string) => {
  LOGGER.error(`${text}, please checkout documentation`, null);
};

/**
 * Parse value and check if desire data type
 * @param value to parse
 * @param type to check against
 * @returns type t on sucess, if not found null, if wrong type undefined
 */
const parseValueType = <T>(value: any, type: string): T | undefined | null => {
  if (value == undefined) {
    return null;
  }
  if (!(typeof value === type)) {
    return undefined;
  }
  return value as T;
};

/**
 * Parse boolean and check if valid datatype
 * @param value to check
 * @returns boolean on sucess, if not found null, if wrong type undefined
 */
const parseBoolean = (value: any): boolean | undefined | null => {
  return parseValueType<boolean>(value, "boolean");
};

/**
 * Parse boolean value and use default value if not defined
 * @param value to parse
 * @param def if value is null
 * @returns the parsed boolean value or undefined if wrong type was used
 */
const parseBooleanWithDefault = (
  value: any,
  def: boolean,
): boolean | undefined => {
  const parsedValue = parseValueType<boolean>(value, "boolean");
  return (parsedValue === null) ? def : parsedValue;
};

/**
 * Parse number and check if valid datatype
 * @param value to check
 * @returns number on sucess, if not found null, if wrong type undefined
 */
const parseNumber = (value: any): number | undefined | null => {
  return parseValueType<number>(value, "number");
};

/**
 * Parse number value and use default value if not defined
 * @param value to parse
 * @param def if value is null
 * @returns the parsed number value or undefined if wrong type was used
 */
const parseNumberWithDefault = (
  value: any,
  def: number,
): number | undefined => {
  const parsedValue = parseValueType<number>(value, "number");
  return (parsedValue === null) ? def : parsedValue;
};

/**
 * Parse string and check if valid datatype
 * @param value to check
 * @returns string on sucess, if not found null, if wrong type undefined
 */
const parseString = (value: any): string | undefined | null => {
  return parseValueType<string>(value, "string");
};

/**
 * Parse string value and use default value if not defined
 * @param value to parse
 * @param def if value is null
 * @returns the parsed string value or undefined if wrong type was used
 */
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
    return DEF_CONFIG.app.worker;
  }
  const gotConfig = config as WorkerConfig;
  const inst = parseNumberWithDefault(
    gotConfig.instances,
    DEF_CONFIG.app.worker.instances,
  );
  if (inst == undefined) {
    logError("Invalid instances value found");
    return undefined;
  }
  const sleep = parseNumberWithDefault(
    gotConfig.sleepInterval,
    DEF_CONFIG.app.worker.sleepInterval,
  );
  if (sleep == undefined) {
    logError("Invalid sleepInterval value found");
    return undefined;
  }
  return { instances: inst, sleepInterval: sleep };
};

/**
 * Parse AppOutputConfig and validate all fields, if not defined and not set mantatory, use default value
 * @param config read from config file and to verify
 * @returns 
 */
const parseOutputConfig = (config: object): AppOutputConfig | undefined => {
  if (!config) {
    return undefined;
  }

  const outputConfig: AppOutputConfig = [];
  for (const [index, value] of (config as AppOutputConfig).entries()) {
    const outType = parseString(value.type);
    if (!outType) {
      logError(`Failed to parse output type with index ${index}`);
      return undefined;
    }
    switch (outType) {
      case "file": {
        const fileOutput = value as FileOutputConfig;
        const folder = parseString(fileOutput.folder);
        if (!folder) {
          logError(
            `Failed to parse file folder for output with index ${index}`,
          );
          return undefined;
        }
        outputConfig.push(fileOutput);
        break;
      }
      case "http": {
        const httpOutput = value as HttpOutputConfig;
        const method = parseString(httpOutput.method);
        if (!method) {
          logError(
            `Failed to parse http method from output with index ${index}`,
          );
          return undefined;
        }
        const url = parseString(httpOutput.url);
        if (!url) {
          logError(`Failed to parse http url from output with index ${index}`);
          return undefined;
        }
        outputConfig.push(httpOutput);
        break;
      }
      default: {
        logError("Unsupported output type found");
        return undefined;
      }
    }
  }

  return outputConfig;
};

/**
 * Parse App config if possible, on error return undefined
 * @param config to parse
 * @returns AppConfig with either the user defined config or default value
 */
const parseAppConfig = (config: AppConfig): AppConfig | undefined => {
  if (undefined == config) {
    logError("No app configuration found");
    return undefined;
  }

  const browser = parseBroswerConfig((config as AppConfig).browser);
  if (undefined == browser) {
    logError("Failed to read browser configuration properly");
    return undefined;
  }

  const worker = parseWorkerConfig((config as AppConfig).worker);
  if (undefined == worker) {
    logError("Failed to read worker configuration properly");
    return undefined;
  }

  const output = parseOutputConfig((config as AppConfig).output);
  if (undefined == output) {
    logError("Failed to read output configuration properly");
    return undefined;
  }

  return { browser: browser, worker: worker, output: output };
};

/**
 * Parse App auth if possible, on error return undefined
 * @param config to parse
 * @returns PageAuthConfig with either the user defined config or default value
 */
const parseAuthConfig = (
  config: PageAuthConfig,
): PageAuthConfig | undefined => {
  if (!config) {
    return [];
  }
  const authConfig: PageAuthConfig = [];
  for (const [index, value] of (config as PageAuthConfig).entries()) {
    const authType = parseString(value.type);
    if (!authType) {
      logError(`Failed to parse auth type with index ${index}`);
      return undefined;
    }
    switch (authType) {
      case "WinAdAuth":
      case "WinUserAuth": {
        const winAuth = value as WinAdAuthConfig;
        const name = parseString(winAuth.name);
        if (!name) {
          logError(
            `Failed to parse name for WinAdAuth with index ${index}`,
          );
          return undefined;
        }
        const impl = parseString(winAuth.impl);
        if (!impl) {
          logError(
            `Failed to parse impl for WinAdAuth with index ${index}`,
          );
          return undefined;
        }
        const userMail = parseString(winAuth.userMail);
        if (!userMail) {
          logError(
            `Failed to parse userMail for WinAdAuth with index ${index}`,
          );
          return undefined;
        }
        const userPwd = parseString(winAuth.userPwd);
        if (!userPwd) {
          logError(
            `Failed to parse userPwd for WinAdAuth with index ${index}`,
          );
          return undefined;
        }
        authConfig.push(winAuth);
        break;
      }
      default: {
        logError("Unsupported auth type found");
        return undefined;
      }
    }
  }

  return authConfig;
};

/**
 * Parse pages if possible, on error return undefined
 * @param config to parse
 * @param authNames name from all auths to validate integrity
 * @returns PageConfig parsed or undefined on error
 */
const parsePageConfig = (
  config: PagesConfig,
  authNames: string[],
): PagesConfig | undefined => {
  if (!config) {
    logError("No page configuration found");
    return undefined;
  }

  authNames.push("none");
  const pageConfig: PagesConfig = [];
  for (const [index, value] of (config as PagesConfig).entries()) {
    const pname = parseString(value.name);
    if (!pname) {
      logError(`Invalid name defined in page with index ${index}`);
      return undefined;
    }

    const purl = parseString(value.url);
    if (!purl) {
      logError(`Invalid url defined in page with index ${index}`);
      return undefined;
    }

    const pinterval = parseNumberWithDefault(value.interval, 60);
    if (undefined === pinterval) {
      logError(`Invalid interval defined in page with index ${index}`);
      return undefined;
    }

    const pauth = parseStringWithDefault(value.auth, "none");
    if (undefined === pauth) {
      logError(`Invalid auth defined in page with index ${index}`);
      return undefined;
    }
    if (!authNames.includes(pauth)) {
      logError(`Auth mode not registed for page with index ${index}`);
      return undefined;
    }

    pageConfig.push({
      name: pname,
      url: purl,
      interval: pinterval,
      auth: pauth,
    });
  }

  return pageConfig;
};

/**
 * Parse lightmelon configuration file and validate if all mantatory fields are set
 * @param configPath path to config file
 * @returns LighthouseConfig on success else undefined
 */
export const parserConfig = (
  configPath: string,
): Result<LighthouseConfig, string> => {
  LOGGER.info("Start parsing configuration file");
  if (!fileExists(configPath)) {
    LOGGER.error(
      `Configuration file ${configPath} not found`,
      new Error("ConfigFileNotFound"),
    );
    return new Err(`Configuration file ${configPath} not found`);
  }

  LOGGER.info(`Read configuration file ${configPath} from disk`);
  const readConfig = yamlJs.load(readFile(configPath));
  if (!readConfig) {
    LOGGER.error(
      "Failed to read Configruation file properly, please verify it's a valid yaml file",
      new Error("ConfigParseError"),
    );
    return new Err(
      "Failed to read Configruation file properly, please verify it's a valid yaml file",
    );
  }

  LOGGER.info("Start parsing app section");
  const appConfig = parseAppConfig((readConfig as LighthouseConfig).app);
  if (appConfig === undefined) {
    return new Err("Failed to parse AppConfig section");
  }
  LOGGER.info("Finished parsing app section successfully");

  LOGGER.info("Start parsing auth section");
  const authConfig = parseAuthConfig((readConfig as LighthouseConfig).auth);
  if (authConfig === undefined) {
    return new Err("Failed to parse AuthConfig section");
  }
  LOGGER.info("Finished parsing auth section successfully");

  LOGGER.info("Start parsing page section");
  const pageConfig = parsePageConfig(
    (readConfig as LighthouseConfig).pages,
    authConfig.map((x) => x.name),
  );
  if (pageConfig === undefined) {
    return new Err("Failed to parse PageConfig section");
  }
  LOGGER.info("Finished parsing page section successfully");

  LOGGER.info("Finished parsing configuration file");
  return new Ok({ app: appConfig, auth: authConfig, pages: pageConfig });
};
