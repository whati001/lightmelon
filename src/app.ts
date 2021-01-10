import { catApp } from './util/Logger';
import RepDriver from './report/RepDriver';
import { resolveRelativeToApp } from './util/FileHandler';

const CONFIG_DIR = './config/';

(() => {
  catApp.info('Staring app in progress...');
  const repMe = new RepDriver(CONFIG_DIR);
  if(!repMe.init()) {
    catApp.error('Failed to initiate RepDriver, stop applicaiton and check errors', new Error('Init RepDriver failed'));
    return;
  }
  repMe.run();
})();