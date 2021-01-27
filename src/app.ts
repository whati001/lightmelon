import { catApp } from './util/Logger';
import RepDriver from './report/RepDriver';

const CONFIG_DIR = './config/';

/**
 * Main entry point for lighthouse app
 */
(() => {
  catApp.info('Staring app in progress...');
  const repMe = new RepDriver(CONFIG_DIR);
  const retDriver = repMe.init();
  if (!retDriver) {
    catApp.error('Failed to initiate RepDriver, stop applicaiton and check errors', new Error('Init RepDriver failed'));
    return;
  }
  repMe.run();
})();