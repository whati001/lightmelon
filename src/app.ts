import { catApp } from "./util/Logger";
import ReportDriver from "./report/ReportDriver";
import { parserConfig } from "./util/ConfigParser";
import { resolveRelativeToApp } from "./util/FileHandler";
import { exit } from "process";

const CONFIG_FILE = resolveRelativeToApp("config", "lightmelon.yaml");

/**
 * Main entry point for lighthouse app
 */
(() => {
  catApp.info("Starting lightmelon application in progress.");
  const config = parserConfig(CONFIG_FILE);
  if (!config) {
    catApp.error(
      "Failed to parse configuration file properly, please check output",
      null,
    );
    exit(1);
  }

  const reportDriver = new ReportDriver(config);
  if (false == reportDriver.init()) {
    catApp.error("Failed to initialize ReportDriver, stop application", null);
    exit(1);
  }

  reportDriver.run();
})();
