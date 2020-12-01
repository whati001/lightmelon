import path from 'path';
import { catApp } from './util/Logger';
import ReportMe from './ReportMe';


const getConfigRoot = (): string => {
  return path.join(__dirname, './config/');
}

(() => {
  catApp.info('Staring app in progress...');
  const repMe = new ReportMe(getConfigRoot());
  repMe.init();
  repMe.run();
  catApp.info('Stopping app in progress...');
})();