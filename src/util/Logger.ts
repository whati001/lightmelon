import { ILogObject, Logger } from "tslog";
import { createStream } from "rotating-file-stream";
import { createFolder } from "./FileHandler";

// create rotating file stream
const rotatingFileStream = ((filename: string) => {
  const stream = createStream(`./logs/${filename}`, {
    size: "10M", // rotate every 10 MegaBytes written
    interval: "1d", // rotate daily
    compress: "gzip", // compress rotated files
  });

  return stream;
})("lightmelon.log");

// create log transport pipeline
const logToTransport = (logObject: ILogObject) => {
  rotatingFileStream.write(JSON.stringify(logObject) + "\n");
};

// create main logger
export const catApp: Logger = new Logger({ name: "Lightmelon" });
catApp.attachTransport(
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

// create child logger
export const catReportDriver = catApp.getChildLogger({ name: "ReportDriver" });
export const catConfig = catApp.getChildLogger({ name: "ConfigParser" });
export const catReportWorker = catApp.getChildLogger({ name: "RepWorker" });
export const catQueue = catApp.getChildLogger({ name: "Queue" });
export const catAuth = catApp.getChildLogger({ name: "Auth" });
