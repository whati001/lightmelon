import { Browser } from "puppeteer-core";
import { AuthConfig } from "./config";

/**
 * Authentication schemes
 */
export interface Auth {
  login(browser: Browser, auth: AuthConfig): Promise<boolean>;
  isLoggedIn(browser: Browser): Promise<boolean>;
  logout(browser: Browser): Promise<boolean>;
}
