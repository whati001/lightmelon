import path from 'path';
import { catApp } from './Logger';
import ReportMe from './ReportMe';


const getConfigRoot = (): string => {
  return path.join(__dirname, './config/');
}

(() => {
  catApp.info('Starting ReportMe app in progress...');

  const repMe = new ReportMe(getConfigRoot());

  catApp.info('Initation done, start running reports')
  repMe.run();
})();