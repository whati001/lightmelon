import {
  Category,
  CategoryConfiguration,
  CategoryServiceFactory,
  LogLevel,
} from "typescript-logging";

CategoryServiceFactory.setDefaultConfiguration(
  new CategoryConfiguration(LogLevel.Debug),
);

/**
 * Please create new logger categories as needed
 */
export const catApp = new Category("Lightmelon");
export const catRepDriver = new Category("ReportDriver", catApp);
export const catConfig = new Category("ConfigParser", catApp);
export const catRepWorker = new Category("RepWorker", catApp);
export const catQueue = new Category("Queue", catApp);
export const catAuth = new Category("Auth", catApp);
