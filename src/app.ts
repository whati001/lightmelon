import { catApp } from './util/Logger';
import RepDriver from './report/RepDriver';
import { resolveRelativeFile } from './util/FileHandler';

(() => {
  catApp.info('Staring app in progress...');
  const repMe = new RepDriver(resolveRelativeFile('./config/'));
  repMe.init();
  repMe.run();
  catApp.info('Stopping app in progress...');
})();