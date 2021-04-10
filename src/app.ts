import { catApp } from "./util/Logger";
import RepDriver from "./report/RepDriver";
import { parserConfig } from "./util/ConfigParser";
import { resolveRelativeToApp } from "./util/FileHandler";

const CONFIG_FILE = resolveRelativeToApp("config", "lightmelon.yaml");

/**
 * Main entry point for lighthouse app
 */
(() => {
  catApp.info("Starting lightmelon application in progress.");
  const config = parserConfig(CONFIG_FILE);
  // const repMe = new RepDriver(CONFIG_DIR);
  // const retDriver = repMe.init();
  // if (!retDriver) {
  //   catApp.error(
  //     "Failed to initiate RepDriver, stop applicaiton and check errors",
  //     new Error("Init RepDriver failed"),
  //   );
  //   return;
  // }
  // repMe.run();
})();
