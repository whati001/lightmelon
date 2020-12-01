import { Category, CategoryServiceFactory, CategoryConfiguration, LogLevel } from "typescript-logging";

// create new logger instance
CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Debug));


// register categories
export const catApp = new Category('app');
export const catRepDriver = new Category('rep-driver', catApp);
export const catConfig = new Category('config', catApp);
export const catRepWorker = new Category('rep-worker', catApp);
export const catQueue = new Category('queue', catApp);