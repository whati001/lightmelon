import { Category, CategoryServiceFactory, CategoryConfiguration, LogLevel } from "typescript-logging";

// create new logger instance
CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Debug));


// register categories
export const catApp = new Category('app');
export const catRepMe = new Category('reportme', catApp);
export const catConfig = new Category('config', catApp);
