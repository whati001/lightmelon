import { closeLogger, getLogger } from "./util/Logger";
import ReportDriver from "./report/ReportDriver";
import { parserConfig } from "./util/ConfigParser";
import { resolveRelativeToApp } from "./util/FileHandler";
import { exit } from "process";
import promptSync from "prompt-sync";

const CONFIG_FILE = resolveRelativeToApp("config", "lightmelon.yaml");
const LOGGER = getLogger("App").unwrap();

/**
 * Main entry point for lighthouse app
 */
(() => {
  LOGGER.info("Starting lightmelon application in progress.");

  const config = parserConfig(CONFIG_FILE);
  if (config.err) {
    LOGGER.error(
      "Failed to parse configuration file properly, please check output",
      null,
    );

    const prompt = promptSync();
    prompt("Please hit enter to close the window");
    exit(1);
  }

  const reportDriver = new ReportDriver(config.val);
  if (reportDriver.init().err) {
    LOGGER.error("Failed to initialize ReportDriver, stop application", null);
    reportDriver.kill();
    exit(1);
  }

  process.on("SIGINT", () => {
    reportDriver.kill();
    closeLogger();
  });
  reportDriver.run();
})();
