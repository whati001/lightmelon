import { catApp } from './util/Logger';
import RepDriver from './report/RepDriver';
import { resolveRelativeToApp } from './util/FileHandler';

(() => {
  catApp.info('Staring app in progress...');
  const repMe = new RepDriver(resolveRelativeToApp('./config/'));
  repMe.init();
  repMe.run();
  catApp.info('Stopping app in progress...');
})();