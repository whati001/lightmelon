import { ILogObject, Logger } from "tslog";
import { createStream } from "rotating-file-stream";
import { Err, Ok, Result } from "ts-results";

// main logger name
const MAIN_LOGGER_NAME = "Lightmelon";
const LOG_FILE_PATH = "./logs/lightmelon.log";

const stream = createStream(LOG_FILE_PATH, {
  size: "10M", // rotate every 10 MegaBytes written
  interval: "1d", // rotate daily
  compress: "gzip", // compress rotated files
});

// store all current active logger instances in this dict
const activeLogger = new Map<string, Logger>();

const getLogger = (name: string): Result<Logger, string> => {
  if (0 === activeLogger.size || !activeLogger.has(MAIN_LOGGER_NAME)) {
    console.log("create new logger instnace");
    const rootLogger = new Logger({ name: MAIN_LOGGER_NAME });
    activeLogger.set(MAIN_LOGGER_NAME, rootLogger);

    // log object transport function
    const logToTransport = (logObject: ILogObject) => {
      stream.write(`${logObject.date}  ${logObject.logLevel} [${logObject.typeName} ${logObject.filePath}:${logObject.lineNumber}:${logObject.columnNumber}] ${logObject.argumentsArray.join(' ')}\n`);
    };

    rootLogger.attachTransport(
      {
        silly: logToTransport,
        debug: logToTransport,
        trace: logToTransport,
        info: logToTransport,
        warn: logToTransport,
        error: logToTransport,
        fatal: logToTransport,
      },
      "debug",
    );
  }

  const logger = activeLogger.get(name);
  if (logger) {
    return new Ok(logger);
  }

  const mainLogger = activeLogger.get(MAIN_LOGGER_NAME);
  if (mainLogger) {
    const childLogger = mainLogger.getChildLogger({ name: name });
    activeLogger.set(name, childLogger);
    return new Ok(childLogger);
  }

  return new Err("Failed to find root logger instance");
};

const closeLogger = () => {
  stream.end();
};

export { closeLogger, getLogger };
