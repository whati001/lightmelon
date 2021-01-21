import puppeteer from 'puppeteer-core';
import { UserAuth } from './appConfig';

/**
 * Authentication schemes
 */
export interface Auth {
  login(browser: puppeteer.Browser, auth: UserAuth): Promise<boolean>;
  isLoggedIn(browser: puppeteer.Browser): Promise<boolean>;
  logout(browser: puppeteer.Browser): Promise<boolean>;
}